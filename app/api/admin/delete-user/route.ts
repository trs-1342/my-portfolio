import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

/* POST /api/admin/delete-user — kullanıcıyı Auth + Firestore'dan sil */
export async function POST(req: NextRequest) {
  try {
    /* Session cookie'den admin doğrulaması */
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Oturum yok." }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const adminSnap = await adminDb.doc(`users/${decoded.uid}`).get();
    if (!adminSnap.exists || adminSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetki yok." }, { status: 403 });
    }

    const { uid, username } = await req.json();
    if (!uid) return NextResponse.json({ error: "UID gerekli." }, { status: 400 });

    /* Firebase Auth'dan sil */
    await adminAuth.deleteUser(uid);

    /* Firestore'dan sil */
    await adminDb.doc(`users/${uid}`).delete();
    if (username) {
      await adminDb.doc(`usernames/${username.toLowerCase()}`).delete();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete-user error:", err);
    return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
