// lib/getSessionUser.js
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function getSessionUser() {
  const cookieStore = await cookies();                 // ← önemli
  const session = cookieStore.get("session");
  if (!session?.value) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session.value, true);
    return decoded; // uid, email vb.
  } catch {
    return null;
  }
}
