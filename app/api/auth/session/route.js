export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

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
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "missing-idToken" },
        { status: 400 }
      );
    }

    // 1) Token doğrula
    const decoded = await adminAuth.verifyIdToken(idToken, true); // <— burada patlıyordu
    // 2) Session cookie oluştur
    const cookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: maxMs(),
    });

    // 3) Kullanıcıyı DB’ye upsert et
    const email = decoded.email || `${decoded.uid}@noemail.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: decoded.name ?? null, image: decoded.picture ?? null },
      create: {
        email,
        name: decoded.name ?? null,
        image: decoded.picture ?? null,
      },
    });

    const res = NextResponse.json({
      ok: true,
      uid: decoded.uid,
      userId: user.id,
    });
    res.cookies.set("session", cookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(maxMs() / 1000),
    });
    return res;
  } catch (e) {
    console.error("SESSION POST error:", e?.message || e);
    // Geçici olarak hata tipini gösterelim (debug için):
    return NextResponse.json(
      { ok: false, error: "invalid-idToken", detail: String(e?.message || e) },
      { status: 401 }
    );
  }
}
