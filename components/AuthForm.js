// components/AuthForm.js  (varolan dosyaya ekle/güncelle)
"use client";
import Link from "next/link";
// import { auth, googleProvider, appleProvider } from "@/lib/firebaseClient";
import { auth, googleProvider } from "@/lib/firebaseClient";
import { signInWithPopup, signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const errRef = useRef(null);

  useEffect(() => {
    if (err && errRef.current) errRef.current.focus();
  }, [err]);

  const handleSignInCredential = async (userCredential) => {
    // ortak: idToken alıp backend'e gönderiyoruz
    const idToken = await userCredential.user.getIdToken();
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "login_failed");
    router.push("/profile");
    router.refresh();
  };

  const loginWithGoogle = async () => {
    setErr("");
    setBusy(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await handleSignInCredential(cred);
    } catch (e) {
      setErr(`Firebase: ${e?.message || e}`);
      try {
        await signOut(auth);
      } catch {}
    } finally {
      setBusy(false);
    }
  };

  // const loginWithApple = async () => {
  //   setErr("");
  //   setBusy(true);
  //   try {
  //     // Apple için OAuthProvider('apple.com') kullanıyoruz (lib/firebaseClient.js içinde tanımlı)
  //     const cred = await signInWithPopup(auth, appleProvider);
  //     // ÖNEMLİ: Apple bazen email/name vermez (ilk kayıtta gelir, sonraki girişlerde gelmeyebilir)
  //     await handleSignInCredential(cred);
  //   } catch (e) {
  //     setErr(`Firebase(Apple): ${e?.message || e}`);
  //     try {
  //       await signOut(auth);
  //     } catch {}
  //   } finally {
  //     setBusy(false);
  //   }
  // };

  async function handleApple() {
    if (!appleProvider) return; // SSR sırasında null olabilir
    await signInWithPopup(auth, appleProvider);
  }

  return (
    <div className="auth-container">
      <div className="auth-card" role="dialog" aria-labelledby="auth-title">
        <header className="auth-header">
          <h1 id="auth-title" className="auth-title">
            Giriş Yap
          </h1>
        </header>

        <div className="auth-form">
          <button
            onClick={loginWithGoogle}
            disabled={busy}
            className="google-btn"
            type="button"
            aria-busy={busy ? "true" : "false"}
          >
            <span aria-hidden="true">{/* google svg */}</span>
            {busy ? "Bağlanıyor..." : "Google ile devam et"}
          </button>

          {process.env.NEXT_PUBLIC_APPLE_ENABLED === "1" && (
            <button onClick={handleApple}>Apple ile Giriş</button>
          )}
          {/* Apple ile giriş, sadece iOS/macOS'ta göster */}

          {err && (
            <p
              ref={errRef}
              tabIndex={-1}
              className="auth-error"
              aria-live="assertive"
            >
              {err}
            </p>
          )}

          <div className="auth-footer">
            <Link href="/" className="auth-back">
              Geri Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
