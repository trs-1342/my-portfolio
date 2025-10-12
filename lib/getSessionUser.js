import { cookies } from "next/headers";
import { adminAuth, db } from "@/lib/firebaseAdmin";

export async function getSessionUser() {
  const s = cookies().get("session")?.value;
  if (!s) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(s, true);
    const doc = await db.collection("users").doc(decoded.uid).get();
    return { uid: decoded.uid, ...doc.data() };
  } catch {
    return null;
  }
}
