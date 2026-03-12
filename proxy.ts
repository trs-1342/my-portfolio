import { NextRequest, NextResponse } from "next/server";

/* Oturum gerektiren rotalar */
const PROTECTED = ["/profile", "/settings"];

export default function proxy(req: NextRequest) {
  const session  = req.cookies.get("session")?.value;
  const pathname = req.nextUrl.pathname;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/settings/:path*"],
};
