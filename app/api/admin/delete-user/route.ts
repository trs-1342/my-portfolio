import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

/* POST /api/admin/delete-user — kullanıcıyı Auth + Firestore'dan sil */
export async function POST(req: NextRequest) {
  try {
    /* Authorization: Bearer <fresh-id-token> ile admin doğrula */
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Oturum yok." }, { status: 401 });

    let decoded: { uid: string };
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş token." }, { status: 401 });
    }

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
