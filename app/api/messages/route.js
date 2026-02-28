export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

/** Session cookie'den kullanıcıyı çıkar (Next.js 15: cookies() => await) */
async function userFromSessionCookie() {
  const store = await cookies();
  const cookieVal = store.get("session")?.value;
  if (!cookieVal) return null;

  const dec = await adminAuth.verifySessionCookie(cookieVal, true);
  const email = dec.email || `${dec.uid}@noemail.local`;

  // DB'de yoksa oluştur (ilk giriş senaryosu)
  const user =
    (await prisma.user.findUnique({ where: { email } })) ||
    (await prisma.user.create({
      data: { email, name: dec.name ?? null, image: dec.picture ?? null },
    }));

  return user;
}

/** Authorization: Bearer <idToken> başlığıyla kullanıcıyı doğrula */
async function userFromBearer(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const dec = await adminAuth.verifyIdToken(token, true);
  const email = dec.email || `${dec.uid}@noemail.local`;

  const user =
    (await prisma.user.findUnique({ where: { email } })) ||
    (await prisma.user.create({
      data: { email, name: dec.name ?? null, image: dec.picture ?? null },
    }));

  return user;
}

/** Ortak: önce cookie, sonra bearer */
async function authUser(req) {
  try {
    const u = await userFromSessionCookie();
    if (u) return u;
  } catch (e) {
  if (process.env.NODE_ENV !== "production") {
    console.error("Session verify failed:", e);
  }
}
  try {
    const u = await userFromBearer(req);
    if (u) return u;
  } catch (e) {
  if (process.env.NODE_ENV !== "production") {
    console.error("Session verify failed:", e);
  }
}
  return null;
}

export async function GET(req) {
  const user = await authUser(req);
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await prisma.message.findMany({
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(rows, { status: 200 });
}

export async function POST(req) {
  const user = await authUser(req);
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { text } = await req.json();
  const content = (text || "").trim();
  if (!content) return NextResponse.json({ error: "empty" }, { status: 400 });

  const created = await prisma.message.create({
    data: { text: content, userId: user.id },
    include: { user: { select: { name: true, email: true, image: true } } },
  });

  return NextResponse.json(created, { status: 201 });
}
