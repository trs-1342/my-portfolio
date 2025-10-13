// /lib/auth-helpers.js
import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

function getMaxAgeMs() {
  const days = Math.min(Number(process.env.SESSION_MAX_DAYS || "7"), 30);
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Google sign-in'dan aldığın idToken ile
 * Firebase Session Cookie üretir ve "session" cookie'sini yazar.
 */
export async function createSessionFromIdToken(idToken) {
  const maxAgeMs = getMaxAgeMs();

  // DİKKAT: adminAuth bir instance; fonksiyon gibi çağrılmaz
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: maxAgeMs,
  });

  // Next.js 15: cookies() async
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set({
    name: "session",
    value: sessionCookie,
    httpOnly: true,
    secure, // prod'da true, lokal geliştirmede false
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  });
}

/**
 * Session cookie'yi temizler ve (varsa) refresh token'ları revoke eder.
 */
export async function clearSessionAndRevoke() {
  const store = await cookies();
  const token = store.get("session")?.value;

  if (token) {
    try {
      // DİKKAT: adminAuth fonksiyon değil
      const decoded = await adminAuth.verifySessionCookie(token, true);
      await adminAuth.revokeRefreshTokens(decoded.sub);
    } catch {
      // sessiz yut
    }
  }

  // Cookie'yi sıfırla
  store.set({
    name: "session",
    value: "",
    path: "/",
    maxAge: 0,
  });
}
