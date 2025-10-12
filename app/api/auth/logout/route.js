// app/api/auth/logout/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET(req) {
  const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
  res.cookies.set("session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
