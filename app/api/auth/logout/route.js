import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(request) {
  // Cookie’yi temizle. İstersen session revoke da yapabilirsin.
  const res = NextResponse.redirect(
    new URL("/login?loggedout=1", request.url),
    { status: 303 }
  );
  res.cookies.set("session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
