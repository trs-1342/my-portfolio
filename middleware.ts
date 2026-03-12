import { NextRequest, NextResponse } from "next/server";

/* Oturum gerektiren rotalar */
const PROTECTED = ["/profile", "/settings"];
/* Sadece misafir rotalar (giriş yapmışlar yönlendirilir) */
const GUEST_ONLY = ["/login", "/register", "/forgot-password"];

export function middleware(req: NextRequest) {
  const session  = req.cookies.get("session")?.value;
  const pathname = req.nextUrl.pathname;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isGuestOnly && session) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/settings/:path*", "/login", "/register", "/forgot-password"],
};
