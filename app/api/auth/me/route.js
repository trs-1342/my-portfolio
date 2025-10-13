export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin"; // senin admin wrapper'ına göre uyarlayın

export async function GET() {
  const jar = await cookies();
  const token = jar.get("session")?.value;
  if (!token) return NextResponse.json({ loggedIn: false });

  try {
    const decoded = await adminAuth().verifySessionCookie(token, true);
    const user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
    };
    return NextResponse.json({ loggedIn: true, user });
  } catch (err) {
    console.error("auth/me error:", err?.message || err);
    return NextResponse.json({ loggedIn: false });
  }
}
