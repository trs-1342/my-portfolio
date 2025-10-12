import { cookies } from "next/headers";
import { adminAuth, db } from "@/lib/firebaseAdmin";

export async function getSessionUser() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    // İstersen Firestore profilini de döndür:
    const doc = await db.collection("users").doc(decoded.uid).get();
    return { uid: decoded.uid, ...doc.data() };
  } catch {
    return null;
  }
}
