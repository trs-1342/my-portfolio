// app/api/auth/login/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { getSessionMaxAgeMs } from "@/lib/auth-helpers"; // varsa

export async function POST(req) {
  try {
    const form = await req.formData();
    const email = String(form.get("username") || "");
    const password = String(form.get("password") || "");
    const apiKey =
      process.env.F_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) throw new Error("Firebase Web API key eksik.");

    // Firebase REST: email/password ile doğrula
    const r = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, error: e?.error?.message || "Giriş reddedildi." },
        { status: 401 }
      );
    }
    const { idToken } = await r.json();
    const cookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: getSessionMaxAgeMs?.() ?? 14 * 86400 * 1000,
    });

    const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
    res.cookies.set("session", cookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 14 * 86400,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
