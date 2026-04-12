import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/* next-intl locale yönlendirme middleware'i */
const intlMiddleware = createMiddleware(routing);

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

/* Oturum olmadan erişilemeyen rotalar (locale prefix'siz) */
const AUTH_REQUIRED = ["/profile", "/settings"];

/* Engelleme kontrolü yapılacak rotalar (locale prefix'siz) */
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

/** Locale prefix'i pathname'den çıkarır: /tr/contact → /contact */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(tr|en|ar)/, "") || "/";
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API route'ları ve statik dosyaları atla
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. Önce next-intl locale yönlendirmesini uygula
  const intlResponse = intlMiddleware(req);

  // Eğer next-intl bir redirect döndürüyorsa (locale eksikti), onu kullan
  if (intlResponse.status !== 200) {
    return intlResponse;
  }

  // 2. Locale prefix'siz path'i hesapla
  const cleanPath = stripLocale(pathname);
  const session   = req.cookies.get("session")?.value;

  /* Oturum gerektiren sayfalar — session yoksa login'e yönlendir */
  const needsAuth = AUTH_REQUIRED.some((p) => cleanPath.startsWith(p));
  if (needsAuth && !session) {
    // Locale'i koru: /tr/profile → /tr/login
    const localePrefix = pathname.match(/^\/(tr|en|ar)/)?.[0] ?? "/tr";
    const url = req.nextUrl.clone();
    url.pathname = `${localePrefix}/login`;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  /* Engelleme kontrolü — sadece korumalı sayfalarda ve session varsa */
  if (session && BLOCK_CHECKED.has(cleanPath)) {
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
          const pageBanned = blockedPages.includes(cleanPath);

          if (banned || pageBanned) {
            const localePrefix = pathname.match(/^\/(tr|en|ar)/)?.[0] ?? "/tr";
            const dest = req.nextUrl.clone();
            dest.pathname = `${localePrefix}/blocked`;
            dest.searchParams.set("path",   cleanPath);
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

  return intlResponse;
}

export const config = {
  // API route'larını, statik dosyaları ve _next'i atla
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
