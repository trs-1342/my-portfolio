import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const COLOR_MAP: Record<string, string> = {
  red: "#ef4444", green: "#10B981", blue: "#3b82f6",
  yellow: "#f59e0b", purple: "#a855f7", orange: "#f97316", pink: "#ec4899",
};

function resolveColor(c: string): string {
  if (!c) return "#10B981";
  if (c.startsWith("#")) return c;
  return COLOR_MAP[c.toLowerCase()] ?? "#10B981";
}

export async function POST(req: NextRequest) {
  /* ── Admin yetkisi kontrolü ── */
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const snap    = await adminDb.collection("users").doc(decoded.uid).get();
    if (snap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Token geçersiz." }, { status: 401 });
  }

  /* ── JSON dosyasını oku ── */
  const jsonPath = path.join(process.cwd(), "data", "thanks-old.json");
  let raw: string;
  try {
    raw = await fs.readFile(jsonPath, "utf-8");
  } catch {
    return NextResponse.json({ error: "thanks-old.json bulunamadı." }, { status: 404 });
  }

  interface OldPerson {
    name: string; bio: string; url?: string;
    color: string; highlight?: boolean;
  }
  interface OldGroup {
    key: string; title: string; icon: string; people: OldPerson[];
  }

  const json: OldGroup[] = JSON.parse(raw);

  /* ── Yeni formata dönüştür ── */
  const categories = json.map((group, gi) => ({
    id:     group.key,
    title:  group.title,
    icon:   group.icon,
    order:  gi,
    people: group.people.map((p, pi) => ({
      id:        `${group.key}_${pi}`,
      name:      p.name,
      message:   p.bio,
      color:     resolveColor(p.color),
      url:       p.url ?? null,
      highlight: p.highlight ?? false,
      order:     pi,
    })),
  }));

  /* ── Firestore'a yaz (admin SDK — auth bypass) ── */
  await adminDb.collection("site_config").doc("thanks").set({ categories });

  return NextResponse.json({ ok: true, categories: categories.length, people: categories.reduce((s, c) => s + c.people.length, 0) });
}
