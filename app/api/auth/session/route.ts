import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 gün

/* POST /api/auth/session — ID token → session cookie */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token gerekli." }, { status: 400 });

    /* ID token doğrula */
    await adminAuth.verifyIdToken(token);

    /* httpOnly session cookie */
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   MAX_AGE,
      path:     "/",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Geçersiz token." }, { status: 401 });
  }
}

/* DELETE /api/auth/session — çıkış yap */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
