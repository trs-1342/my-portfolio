"use client";
import { auth, googleProvider } from "@/lib/firebaseClient";
import {
  signInWithPopup,
  signInWithRedirect,
  getAdditionalUserInfo,
} from "firebase/auth";
import { useEffect, useState } from "react";

export default function GoogleLogin({ redirectTo = "/" }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function createSession(idToken) {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error || "Oturum kurulamadı.");
    }
  }

  async function handleGoogle() {
    setErr("");
    setBusy(true);
    try {
      // Popup deneyin, olmazsa redirect
      let userCred;
      try {
        userCred = await signInWithPopup(auth, googleProvider);
      } catch {
        await signInWithRedirect(auth, googleProvider);
        return; // redirect ile sayfa değişecek
      }

      const user = userCred.user;
      const idToken = await user.getIdToken(/* forceRefresh */ true);

      // İsteğe bağlı: yeni kullanıcı ise Firestore'a profil açmak için server tarafında beklersin
      // const info = getAdditionalUserInfo(userCred); info?.isNewUser

      await createSession(idToken);
      window.location.assign(redirectTo);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Google ile giriş başarısız.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="google-login">
      <button
        type="button"
        className="google-btn"
        onClick={handleGoogle}
        disabled={busy}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 48 48"
          aria-hidden="true"
          style={{ marginRight: 8 }}
        >
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3C33.7 31.7 29.3 35 24 35c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l5.7-5.7C34.9 3.6 29.7 1.5 24 1.5 11.6 1.5 1.5 11.6 1.5 24S11.6 46.5 24 46.5 46.5 36.4 46.5 24c0-1.1-.1-2.3-.3-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.5 16.4 18.8 13 24 13c3.3 0 6.3 1.2 8.6 3.2l5.7-5.7C34.9 3.6 29.7 1.5 24 1.5 16.1 1.5 9.2 5.7 6.3 14.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 46.5c5.3 0 10.1-1.8 13.8-4.8l-6.4-5.2C29.2 38.1 26.8 39 24 39c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.2 42.3 16.1 46.5 24 46.5z"
          />
          <path
            fill="#1976D2"
            d="M46.5 24c0-1.1-.1-2.3-.3-3.5H24v8h11.3c-.8 4-4.6 6.9-8.3 6.9-2.6 0-4.9-1-6.7-2.6l-6.5 5C16.1 42.3 20.9 46.5 24 46.5c12.4 0 22.5-10.1 22.5-22.5z"
          />
        </svg>
        {busy ? "Bağlanıyor..." : "Google ile devam et"}
      </button>
      {err && <div className="auth-error">{err}</div>}
    </div>
  );
}
