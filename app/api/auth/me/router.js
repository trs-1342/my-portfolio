export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureAdmin } from "@/lib/firebaseAdmin";

export async function GET() {
  const admin = ensureAdmin();
  if (!admin) return NextResponse.json({ loggedIn: false });

  const jar = await cookies();
  const session = jar.get("session")?.value;
  if (!session) return NextResponse.json({ loggedIn: false });

  try {
    const decoded = await admin.adminAuth.verifySessionCookie(session, true);
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
