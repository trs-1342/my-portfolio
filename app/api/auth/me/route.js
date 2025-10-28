// app/api/auth/me/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

export async function GET() {
  const store = await cookies();
  const token = store.get("session")?.value;

  if (!token) {
    return new NextResponse(JSON.stringify({ loggedIn: false, user: null }), {
      status: 200,
      headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
    });
  }

  try {
    const dec = await adminAuth.verifySessionCookie(token, true);
    const email = dec.email ?? `${dec.uid}@noemail.local`;

    // DB'de kullanıcıyı güncelle/oluştur ve image'ı kaydet
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: dec.name ?? null, image: dec.picture ?? null },
      create: { email, name: dec.name ?? null, image: dec.picture ?? null },
      select: { id: true, name: true, email: true, image: true },
    });

    return new NextResponse(
      JSON.stringify({ loggedIn: true, user: { ...user, picture: user.image } }),
      { status: 200, headers: { "Cache-Control": "no-store", "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verifySessionCookie failed:", e);
    return new NextResponse(JSON.stringify({ loggedIn: false, user: null }), {
      status: 200,
      headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
    });
  }
}
