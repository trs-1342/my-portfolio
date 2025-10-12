// app/api/auth/session/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth, db } from "@/lib/firebaseAdmin";

function maxMs() {
  const days = Math.min(
    Math.max(Number(process.env.SESSION_MAX_DAYS || 14), 1),
    30
  );
  return days * 24 * 60 * 60 * 1000;
}

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken)
      return NextResponse.json(
        { ok: false, error: "missing idToken" },
        { status: 400 }
      );

    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const cookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: maxMs(),
    });

    const res = NextResponse.json({ ok: true });

    const isProd = process.env.NODE_ENV === "production";
    res.cookies.set("session", cookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd, // 👈 DEV’de false; prod’da true
      path: "/",
      maxAge: Math.floor(maxMs() / 1000),
    });

    // (opsiyonel) Firestore'a yazma — hata verirse es geç
    try {
      await db
        .collection("users")
        .doc(decoded.uid)
        .set(
          {
            uid: decoded.uid,
            email: decoded.email || null,
            name: decoded.name || null,
            picture: decoded.picture || null,
            provider: decoded.firebase?.sign_in_provider || "google",
            lastLoginAt: new Date(),
          },
          { merge: true }
        );
    } catch {}

    return res;
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 400 }
    );
  }
}
