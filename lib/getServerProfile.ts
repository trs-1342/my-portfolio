import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { UserProfile } from "@/lib/firestore";

/** Session cookie'den kullanıcı profilini döner. Oturum yoksa/hata varsa null. */
export async function getServerProfile(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const decoded = await adminAuth.verifyIdToken(token);
    const snap    = await adminDb.doc(`users/${decoded.uid}`).get();
    if (!snap.exists) return null;

    return { uid: decoded.uid, ...snap.data() } as UserProfile;
  } catch {
    return null;
  }
}

/** Kullanıcının verilen path'e erişimi engellenmiş mi? */
export function isBlocked(profile: UserProfile | null, path: string): boolean {
  if (!profile) return false;
  return profile.status === "banned" || (profile.blockedPages?.includes(path) ?? false);
}
