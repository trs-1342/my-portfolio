"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/lib/firestore";

export default function LoginPage() {
  const { loginEmail, loginGoogle } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") ?? "/";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await loginEmail(email, password);
      router.push(redirect);
    } catch {
      setError("Email veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      const user = await loginGoogle();
      const profile = await getUserProfile(user.uid);
      router.push(profile?.username ? redirect : "/setup-username");
    } catch {
      setError("Google ile giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "min(420px, 100%)" }}>
      {/* Logo */}
      <Link href="/" className="mono" style={{ display: "block", textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "32px", textDecoration: "none" }}>
        trs
      </Link>

      <div className="glass" style={{ borderRadius: "20px", padding: "36px 32px" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
          Giriş Yap
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "28px" }}>
          Hesabına hoş geldin.
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "11px", borderRadius: "10px",
            border: "1px solid var(--border)", background: "var(--bg-2)",
            color: "var(--text)", fontSize: "0.9rem", fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "10px", marginBottom: "20px",
            transition: "border-color 0.15s, background 0.15s",
            fontFamily: "var(--font-sans)",
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

        {/* Form */}
        <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="ornek@mail.com" disabled={loading} />
          <AuthInput label="Şifre" type="password" value={password} onChange={setPassword} placeholder="••••••••" disabled={loading} />

          {error && <p style={{ fontSize: "0.8rem", color: "#ef4444", marginTop: "-4px" }}>{error}</p>}

          <Link href="/forgot-password" className="mono" style={{ fontSize: "0.72rem", color: "var(--text-3)", textDecoration: "none", textAlign: "right", marginTop: "-4px" }}>
            Şifremi unuttum →
          </Link>

          <button type="submit" disabled={loading} className="btn btn-accent" style={{ justifyContent: "center", padding: "12px", fontSize: "0.9rem", marginTop: "4px" }}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.83rem", color: "var(--text-3)" }}>
        Hesabın yok mu?{" "}
        <Link href="/register" style={{ color: "var(--accent)", textDecoration: "none" }}>Kayıt ol</Link>
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
