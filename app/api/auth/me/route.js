export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

export async function GET() {
  // Next 15: cookies() async
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return NextResponse.json({ loggedIn: false }, { status: 200 });

  try {
    const dec = await adminAuth.verifySessionCookie(token, true);
    const email = dec.email || `${dec.uid}@noemail.local`;

    // DB’de kullanıcıyı güncelle/oluştur
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: dec.name ?? null, image: dec.picture ?? null },
      create: { email, name: dec.name ?? null, image: dec.picture ?? null },
      select: { id: true, name: true, email: true, image: true },
    });

    // Nav’daki mevcut kod "picture" bekliyor; uyumluluk için ekliyorum
    return NextResponse.json(
      {
        loggedIn: true,
        user: { ...user, picture: user.image },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ loggedIn: false }, { status: 200 });
  }
}
