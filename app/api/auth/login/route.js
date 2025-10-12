import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  usernameToEmail,
  validateLogin,
  getSessionMaxAgeMs,
} from "@/lib/auth-helpers";

export async function POST(request) {
  try {
    const form = await request.formData();
    const username = String(form.get("username") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");

    const errors = validateLogin({ username, password });
    if (errors.length)
      return NextResponse.json({ ok: false, errors }, { status: 400 });

    const email = usernameToEmail(username);
    const API_KEY = process.env.FIREBASE_WEB_API_KEY;
    if (!API_KEY) throw new Error("WEB API anahtarı eksik.");

    // Firebase REST: signInWithPassword
    const r = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      const msg = e?.error?.message || "Geçersiz kullanıcı adı/şifre.";
      return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    }

    const data = await r.json(); // idToken, localId, refreshToken...
    const expiresIn = getSessionMaxAgeMs();

    // Session cookie üret
    const sessionCookie = await adminAuth.createSessionCookie(data.idToken, {
      expiresIn,
    });

    const res = NextResponse.redirect(new URL("/", request.url), {
      status: 303,
    });
    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: Math.floor(expiresIn / 1000),
      path: "/",
    });
    return res;
  } catch (err) {
    const message = err?.message || "Giriş sırasında hata oluştu.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
