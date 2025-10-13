// lib/auth-helpers.js
import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

function getMaxAgeMs() {
  const days = Math.min(Number(process.env.SESSION_MAX_DAYS || "7"), 30);
  return days * 24 * 60 * 60 * 1000;
}

export async function createSessionFromIdToken(idToken) {
  const maxAgeMs = getMaxAgeMs();
  const sessionCookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: maxAgeMs,
  });
  const store = await cookies();
  store.set({
    name: "session",
    value: sessionCookie,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  });
}

export async function clearSessionAndRevoke() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (token) {
    try {
      const decoded = await adminAuth().verifySessionCookie(token, true);
      await adminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      /* yok say */
    }
  }
  store.set({
    name: "session",
    value: "",
    path: "/",
    maxAge: 0,
  });
}
