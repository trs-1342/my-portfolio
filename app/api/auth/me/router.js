// app/api/auth/me/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
  const store = await cookies();
  const token = store.get("session")?.value;
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
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
