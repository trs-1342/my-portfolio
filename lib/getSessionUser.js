// lib/getSessionUser.js
import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(token, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
    };
  } catch {
    return null;
  }
}
