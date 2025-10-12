import { NextResponse } from "next/server";
import { adminAuth, db } from "@/lib/firebaseAdmin";
import { usernameToEmail, validateRegister } from "@/lib/auth-helpers";

export async function POST(request) {
  try {
    const form = await request.formData();
    const username = String(form.get("username") || "")
      .trim()
      .toLowerCase();
    const name = String(form.get("name") || "").trim();
    const password = String(form.get("password") || "");

    const errors = validateRegister({ username, name, password });
    if (errors.length) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    const unameDoc = db.collection("usernames").doc(username);
    const email = usernameToEmail(username);

    // Atomik: username boşta mı? Boştaysa oluştur.
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(unameDoc);
      if (snap.exists) throw new Error("Bu kullanıcı adı zaten alınmış.");

      // Firebase Auth kullanıcı oluştur
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
      });

      // users/{uid}
      const userRef = db.collection("users").doc(userRecord.uid);
      tx.set(userRef, {
        uid: userRecord.uid,
        username,
        name,
        createdAt: new Date(),
      });

      // usernames/{username} -> uid
      tx.set(unameDoc, { uid: userRecord.uid });
    });

    // Başarılı: login sayfasına yönlendir
    const res = NextResponse.redirect(
      new URL("/login?registered=1", request.url),
      { status: 303 }
    );
    return res;
  } catch (err) {
    const message = err?.message || "Kayıt sırasında hata oluştu.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
