import { NextRequest, NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

/* Oturum olmadan erişilemeyen rotalar */
const AUTH_REQUIRED = ["/profile", "/settings"];

/* Engelleme kontrolü yapılacak rotalar */
const BLOCK_CHECKED = new Set(["/contact", "/photos", "/hsounds", "/profile", "/settings"]);

/** JWT payload'ını doğrulama yapmadan hızlıca decode eder (sadece uid için). */
function decodeJwt(token: string): { user_id?: string; sub?: string } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session")?.value;

  /* Oturum gerektiren sayfalar — session yoksa login'e yönlendir */
  const needsAuth = AUTH_REQUIRED.some((p) => pathname.startsWith(p));
  if (needsAuth && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  /* Engelleme kontrolü — sadece korumalı sayfalarda ve session varsa */
  if (session && BLOCK_CHECKED.has(pathname)) {
    const payload = decodeJwt(session);
    const uid = payload?.user_id ?? payload?.sub;

    if (uid) {
      try {
        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`,
          { headers: { Authorization: `Bearer ${session}` } }
        );

        if (res.ok) {
          const doc = await res.json();
          const f   = doc.fields ?? {};

          const status: string       = f.status?.stringValue ?? "active";
          const blockedPages: string[] =
            f.blockedPages?.arrayValue?.values?.map(
              (v: { stringValue: string }) => v.stringValue
            ) ?? [];

          const banned     = status === "banned";
          const pageBanned = blockedPages.includes(pathname);

          if (banned || pageBanned) {
            const dest = req.nextUrl.clone();
            dest.pathname = "/blocked";
            dest.searchParams.set("path",   pathname);
            dest.searchParams.set("banned", banned ? "1" : "0");
            dest.searchParams.set("pages",  blockedPages.join(","));
            return NextResponse.rewrite(dest);
          }
        }
      } catch {
        /* Firestore erişilemezse geçir */
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/contact", "/photos", "/hsounds", "/profile/:path*", "/settings/:path*"],
};
