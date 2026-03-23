"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createUserProfile, getUserProfile } from "@/lib/firestore";

export default function RegisterPage() {
  const { register, loginGoogle, user } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [password2,   setPassword2]   = useState("");
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [sent,        setSent]        = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== password2) { setError("Şifreler eşleşmiyor."); return; }
    if (password.length < 6)   { setError("Şifre en az 6 karakter olmalı."); return; }
    setLoading(true);
    try {
      /* displayName'i setup-username sayfasına taşı */
      if (displayName.trim()) {
        sessionStorage.setItem("pending_display_name", displayName.trim());
      }
      await register(email, password);
      setSent(true);
    } catch (err: unknown) {
      sessionStorage.removeItem("pending_display_name");
      const msg = (err as { code?: string }).code;
      if (msg === "auth/email-already-in-use") setError("Bu email zaten kayıtlı.");
      else setError("Kayıt başarısız. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      const u = await loginGoogle();
      const profile = await getUserProfile(u.uid);
      router.push(profile?.username ? "/" : "/setup-username");
    } catch {
      setError("Google ile kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ width: "min(440px, 100%)" }}>
        <Link href="/" className="mono" style={{ display: "block", textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "32px", textDecoration: "none" }}>
          trs
        </Link>
        <div className="glass" style={{ borderRadius: "20px", padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📧</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
            Email Gönderildi!
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "28px" }}>
            <strong style={{ color: "var(--text)" }}>{email}</strong> adresine doğrulama bağlantısı gönderildi.
            Gelen kutunu kontrol et ve bağlantıya tıkla.
          </p>
          <button
            onClick={() => router.push("/setup-username")}
            className="btn btn-accent"
            style={{ justifyContent: "center", padding: "12px 24px", fontSize: "0.9rem" }}
          >
            Doğruladım, devam et →
          </button>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "16px" }}>
            Email gelmedi mi?{" "}
            <button
              onClick={() => setSent(false)}
              style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--font-sans)", padding: 0 }}
            >
              Tekrar dene
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "min(440px, 100%)" }}>
      <Link href="/" className="mono" style={{ display: "block", textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "32px", textDecoration: "none" }}>
        trs
      </Link>

      <div className="glass" style={{ borderRadius: "20px", padding: "36px 32px" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
          Hesap Oluştur
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "28px" }}>
          Birkaç saniye içinde hazır olursun.
        </p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "11px", borderRadius: "10px",
            border: "1px solid var(--border)", background: "var(--bg-2)",
            color: "var(--text)", fontSize: "0.9rem", fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "10px", marginBottom: "20px",
            transition: "border-color 0.15s", fontFamily: "var(--font-sans)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.1 33.9 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.8 0 20-7.8 20-21 0-1.4-.2-2.7-.5-4z"/></svg>
          Google ile devam et
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>veya</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <AuthInput label="Ad Soyad" type="text"     value={displayName} onChange={setDisplayName} placeholder="Halil Hattab"    disabled={loading} />
          <AuthInput label="Email"    type="email"    value={email}       onChange={setEmail}       placeholder="ornek@mail.com"  disabled={loading} />
          <AuthInput label="Şifre"    type="password" value={password}    onChange={setPassword}    placeholder="en az 6 karakter" disabled={loading} />
          <AuthInput label="Şifre Tekrar" type="password" value={password2} onChange={setPassword2} placeholder="••••••••"       disabled={loading} />

          {error && <p style={{ fontSize: "0.8rem", color: "#ef4444" }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-accent" style={{ justifyContent: "center", padding: "12px", fontSize: "0.9rem", marginTop: "4px" }}>
            {loading ? "Oluşturuluyor..." : "Hesap Oluştur"}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.83rem", color: "var(--text-3)" }}>
        Zaten hesabın var mı?{" "}
        <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Giriş yap</Link>
      </p>
    </div>
  );
}

function AuthInput({ label, type, value, onChange, placeholder, disabled }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; disabled: boolean;
}) {
  return (
    <div>
      <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required disabled={disabled}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: "10px",
          border: "1px solid var(--border)", background: "var(--bg)",
          color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: "0.9rem",
          outline: "none", transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
