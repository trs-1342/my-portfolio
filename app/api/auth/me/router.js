// app/api/auth/me/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    // 🔧 Next 15: cookies() async
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return NextResponse.json({ loggedIn: false });

    const decoded = await adminAuth.verifySessionCookie(session, true);
    return NextResponse.json({
      loggedIn: true,
      user: {
        uid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || null,
        picture: decoded.picture || null,
      },
    });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
