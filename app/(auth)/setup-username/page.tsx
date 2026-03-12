"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createUserProfile, isUsernameAvailable } from "@/lib/firestore";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function SetupUsernamePage() {
  const { user, refreshProfile, loading } = useAuth();
  const router = useRouter();

  const [username,   setUsername]   = useState("");
  const [checking,   setChecking]   = useState(false);
  const [available,  setAvailable]  = useState<boolean | null>(null);
  const [error,      setError]      = useState("");
  const [saving,     setSaving]     = useState(false);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Auth tamamlanınca kontrol et */
  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
  }, [loading, user, router]);

  /* Username uygunluk kontrolü (debounced) */
  useEffect(() => {
    if (!username) { setAvailable(null); setError(""); return; }
    if (!USERNAME_RE.test(username)) {
      setAvailable(null);
      setError("3-20 karakter, sadece a-z, 0-9 ve _");
      return;
    }
    setError(""); setChecking(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const ok = await isUsernameAvailable(username);
      setAvailable(ok);
      setChecking(false);
    }, 500);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !available) return;
    setSaving(true);
    try {
      await createUserProfile(user.uid, {
        email:       user.email ?? "",
        username,
        displayName: user.displayName ?? username,
        photoURL:    user.photoURL,
      });
      await refreshProfile();
      router.push("/");
    } catch {
      setError("Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const statusColor = checking ? "var(--text-3)"
    : available === true  ? "#10B981"
    : available === false ? "#ef4444"
    : "var(--text-3)";

  const statusText = checking ? "kontrol ediliyor..."
    : available === true  ? "✓ müsait"
    : available === false ? "✗ alınmış"
    : "";

  return (
    <div style={{ width: "min(400px, 100%)" }}>
      <p className="mono" style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "32px" }}>
        trs
      </p>

      <div className="glass" style={{ borderRadius: "20px", padding: "36px 32px" }}>
        <div style={{ fontSize: "2rem", marginBottom: "12px" }}>👤</div>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
          Kullanıcı Adı Seç
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "28px" }}>
          Bu adı sonradan değiştirebilirsin.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
              Kullanıcı Adı
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="trs_1342"
                required
                disabled={saving}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "10px",
                  border: `1px solid ${available === true ? "#10B981" : available === false ? "#ef4444" : "var(--border)"}`,
                  background: "var(--bg)", color: "var(--text)",
                  fontFamily: "var(--font-mono)", fontSize: "0.9rem",
                  outline: "none", transition: "border-color 0.15s",
                  paddingRight: "100px",
                }}
              />
              {statusText && (
                <span className="mono" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", color: statusColor }}>
                  {statusText}
                </span>
              )}
            </div>
            {error && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "6px" }}>{error}</p>}
            <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "6px" }}>
              3-20 karakter · küçük harf, rakam, alt çizgi
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || !available}
            className="btn btn-accent"
            style={{ justifyContent: "center", padding: "12px", fontSize: "0.9rem", marginTop: "4px" }}
          >
            {saving ? "Kaydediliyor..." : "Devam Et →"}
          </button>
        </form>
      </div>
    </div>
  );
}
