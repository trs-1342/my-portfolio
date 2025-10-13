export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

function maxMs() {
  const days = Math.min(
    Math.max(Number(process.env.SESSION_MAX_DAYS || 14), 1),
    30
  );
  return days * 24 * 60 * 60 * 1000;
}

export async function GET() {
  return NextResponse.json({ ok: Boolean(adminAuth) });
}

export async function POST(req) {
  const admin = ensureAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "admin-not-configured" },
      { status: 500 }
    );
  }

  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json(
      { ok: false, error: "missing-idToken" },
      { status: 400 }
    );
  }

  const decoded = await admin.adminAuth.verifyIdToken(idToken, true);
  const cookie = await admin.adminAuth.createSessionCookie(idToken, {
    expiresIn: maxMs(),
  });

  const res = NextResponse.json({ ok: true, uid: decoded.uid });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set("session", cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: Math.floor(maxMs() / 1000),
  });
  return res;
}
