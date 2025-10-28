export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST() {
  const store = await cookies();
  const token = store.get("session")?.value;

  // (Opsiyonel ama tavsiye): aynı kullanıcıdaki tüm oturumları geçersiz kıl
  if (token) {
    try {
      const dec = await adminAuth.verifySessionCookie(token, true);
      await adminAuth.revokeRefreshTokens(dec.uid);
    } catch {
      // token yok/bozuk ise yok say
    }
  }

  // Session cookie'yi TUM PATH'lerde sıfırla (global)
  store.set("session", "", {
    path: "/",                 // ← önemli
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,                 // süreyi sıfırla
    expires: new Date(0),      // geçmişe ayarla
  });

  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
  });
}
