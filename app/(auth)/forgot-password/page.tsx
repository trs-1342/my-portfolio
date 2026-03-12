"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState<"idle" | "sent" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "min(400px, 100%)" }}>
      <Link href="/" className="mono" style={{ display: "block", textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "32px", textDecoration: "none" }}>
        trs
      </Link>

      <div className="glass" style={{ borderRadius: "20px", padding: "36px 32px" }}>
        {status === "sent" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>📬</div>
            <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", marginBottom: "10px" }}>
              Email gönderildi
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "24px" }}>
              <strong style={{ color: "var(--text)" }}>{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi. Spam klasörünü de kontrol et.
            </p>
            <Link href="/login" className="btn btn-ghost" style={{ margin: "0 auto" }}>
              ← Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
              Şifremi Unuttum
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "28px" }}>
              Email adresini gir, sıfırlama bağlantısı gönderelim.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
                  Email
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com" required disabled={loading}
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

              {status === "error" && (
                <p style={{ fontSize: "0.8rem", color: "#ef4444" }}>
                  Bu email kayıtlı değil veya bir hata oluştu.
                </p>
              )}

              <button type="submit" disabled={loading} className="btn btn-accent" style={{ justifyContent: "center", padding: "12px", fontSize: "0.9rem" }}>
                {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
              </button>
            </form>
          </>
        )}
      </div>

      <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.83rem", color: "var(--text-3)" }}>
        <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>← Giriş sayfasına dön</Link>
      </p>
    </div>
  );
}
