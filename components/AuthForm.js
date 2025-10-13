// components/AuthForm.js  (varolan dosyaya ekle/güncelle)
"use client";
import Link from "next/link";
import { auth, googleProvider, appleProvider } from "@/lib/firebaseClient";
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

  const loginWithApple = async () => {
    setErr("");
    setBusy(true);
    try {
      // Apple için OAuthProvider('apple.com') kullanıyoruz (lib/firebaseClient.js içinde tanımlı)
      const cred = await signInWithPopup(auth, appleProvider);
      // ÖNEMLİ: Apple bazen email/name vermez (ilk kayıtta gelir, sonraki girişlerde gelmeyebilir)
      await handleSignInCredential(cred);
    } catch (e) {
      setErr(`Firebase(Apple): ${e?.message || e}`);
      try {
        await signOut(auth);
      } catch {}
    } finally {
      setBusy(false);
    }
  };

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

          <button
            onClick={loginWithApple}
            disabled={true}
            className="apple-btn"
            type="button"
            aria-busy={busy ? "true" : "false"}
            style={{ marginTop: 8 }}
          >
            <span aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                {/* <path
                  d="M16.365 1.43c0 1.08-.43 2.2-1.2 3.06-.83.92-1.96 1.63-3.04 1.63.02-1.08.48-2.2 1.26-3.08C14.25 1.76 15.36 1.43 16.365 1.43zM20 17.75c-.07-2.16.86-3.8 2.45-4.87-1.43-2.07-3.69-3.34-6.1-3.34-2.58 0-4.45 1.34-5.54 1.34-1.11 0-3.07-1.3-5.04-1.3C2.41 9.58.08 12.48.08 16.1c0 2.07.64 4.04 1.9 5.53 1.23 1.44 2.99 2.94 5.18 2.88 1.06-.03 2.12-.64 3.6-.64 1.48 0 2.44.64 3.61.64 2.36 0 3.96-1.41 5.2-2.85 1.09-1.2 1.64-2.84 1.64-4.55-.01-.03-.01-.05-.02-.05z"
                  fill="currentColor"
                /> */}
              </svg>
            </span>
            {busy ? "Bağlanıyor..." : "Apple ile devam et (Not Working/Beta)"}
          </button>

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
