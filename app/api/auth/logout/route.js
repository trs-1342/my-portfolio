export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(
    new URL("/", `https://${process.env.VERCEL_URL || "localhost:3000"}`)
  );
  res.cookies.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(0),
  });
  return res;
}
