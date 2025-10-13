// app/api/posts/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

/** POST /api/posts  -> {title, description, content} */
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const content = String(body.content || "").trim();

    if (!title || !content) {
      return NextResponse.json(
        { ok: false, error: "title ve content zorunlu" },
        { status: 400 }
      );
    }

    const jar = await cookies();
    const session = jar.get("session")?.value;
    if (!session)
      return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });

    const decoded = await adminAuth()
      .verifySessionCookie(session, true)
      .catch(() => null);
    if (!decoded)
      return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });

    const now = Date.now();
    const doc = {
      title,
      description,
      content,
      author: {
        uid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || null,
        picture: decoded.picture || null,
      },
      createdAt: now,
      updatedAt: now,
    };

    const ref = await adminDb().collection("posts").add(doc);
    return NextResponse.json(
      { ok: true, id: ref.id, post: { id: ref.id, ...doc } },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

/** GET /api/posts?limit=10 -> son postlar */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") || 10))
  );

  const qs = await adminDb()
    .collection("posts")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  const items = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ ok: true, items });
}
