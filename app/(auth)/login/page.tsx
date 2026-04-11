"use client";

import { useState, Suspense } from "react"; // Suspense eklendi
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/lib/firestore";

// Firebase hata kodlarını Türkçeye çevirir
function translateAuthError(code: string): string {
  switch (code) {
    case "auth/missing-email":         return "Email adresi girilmedi.";
    case "auth/invalid-email":         return "Geçerli bir email adresi gir.";
    case "auth/user-not-found":        return "Bu emaile kayıtlı hesap bulunamadı.";
    case "auth/too-many-requests":     return "Çok fazla deneme yapıldı. Bir süre bekle.";
    case "auth/network-request-failed":return "Ağ hatası. İnternet bağlantını kontrol et.";
    default:                           return "Bir hata oluştu. Tekrar dene.";
  }
}

// Giriş formunun asıl mantığını bu bileşene taşıyoruz
function LoginForm() {
  const { loginEmail, loginGoogle, resetPassword } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") ?? "/";

  const [mode,     setMode]     = useState<"login" | "forgot">("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const u = await loginEmail(email, password);
      const profile = await getUserProfile(u.uid);
      if (!profile?.username) router.push("/setup-username");
      else if (profile.status === "pending") router.push("/awaiting-approval");
      else router.push(redirect);
    } catch {
      setError("Email veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      const u = await loginGoogle();
      const profile = await getUserProfile(u.uid);
      if (!profile?.username) router.push("/setup-username");
      else if (profile.status === "pending") router.push("/awaiting-approval");
      else router.push(redirect);
    } catch {
      setError("Google ile giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(translateAuthError(code));
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    setMode("login");
    setResetSent(false);
    setError("");
  };

  // Şifremi unuttum — başarı ekranı
  if (mode === "forgot" && resetSent) {
    return (
      <div className="glass" style={{ borderRadius: "20px", padding: "36px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "2.2rem", marginBottom: "16px" }}>📬</div>
        <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", marginBottom: "10px" }}>
          Email gönderildi
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "24px" }}>
          <strong style={{ color: "var(--text)" }}>{email}</strong> adresine sıfırlama bağlantısı gönderildi.
          Spam / gereksiz klasörünü de kontrol et.
        </p>
        <button onClick={backToLogin} className="btn btn-ghost" style={{ margin: "0 auto" }}>
          ← Girişe dön
        </button>
      </div>
    );
  }

  // Şifremi unuttum — email formu
  if (mode === "forgot") {
    return (
      <div className="glass" style={{ borderRadius: "20px", padding: "36px 32px" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
          Şifremi Unuttum
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "28px" }}>
          Email adresini gir, sıfırlama bağlantısı gönderelim.
        </p>

        <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="ornek@mail.com" disabled={loading} />

          {error && <p style={{ fontSize: "0.8rem", color: "#ef4444", marginTop: "-4px" }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-accent" style={{ justifyContent: "center", padding: "12px", fontSize: "0.9rem", marginTop: "4px" }}>
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>

        <button onClick={backToLogin} className="mono" style={{ marginTop: "18px", fontSize: "0.78rem", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          ← Girişe dön
        </button>
      </div>
    );
  }

  // Normal giriş ekranı
  return (
    <div className="glass" style={{ borderRadius: "20px", padding: "36px 32px" }}>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
        Giriş Yap
      </h1>
      <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "28px" }}>
        Hesabına hoş geldin.
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

      <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="ornek@mail.com" disabled={loading} />

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Şifre
            </label>
            <button
              type="button"
              onClick={() => { setMode("forgot"); setError(""); }}
              className="mono"
              style={{ fontSize: "0.68rem", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: "2px" }}
            >
              Şifremi unuttum
            </button>
          </div>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required disabled={loading}
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

        {error && <p style={{ fontSize: "0.8rem", color: "#ef4444", marginTop: "-4px" }}>{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-accent" style={{ justifyContent: "center", padding: "12px", fontSize: "0.9rem", marginTop: "4px" }}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}

// Ana sayfa bileşeni Suspense ile sarmalanmış olmalı
export default function LoginPage() {
  return (
    <div style={{ width: "min(420px, 100%)" }}>
      <Link href="/" className="mono" style={{ display: "block", textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "32px", textDecoration: "none" }}>
        trs
      </Link>

      {/* Build hatasını çözen kritik Suspense sarmalı */}
      <Suspense fallback={<p style={{ textAlign: "center", color: "var(--text-3)" }}>Yükleniyor...</p>}>
        <LoginForm />
      </Suspense>

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
