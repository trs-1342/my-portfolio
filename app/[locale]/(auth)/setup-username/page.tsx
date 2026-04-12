"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { createUserProfile, isUsernameAvailable } from "@/lib/firestore";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function SetupUsernamePage() {
  const t = useTranslations("Auth.setup");
  const { user, refreshProfile, loading } = useAuth();
  const router = useRouter();

  const [username,  setUsername]  = useState("");
  const [checking,  setChecking]  = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error,     setError]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [waiting,   setWaiting]   = useState(false);
  const [resent,    setResent]    = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!username) { setAvailable(null); setError(""); return; }
    if (!USERNAME_RE.test(username)) {
      setAvailable(null);
      setError(t("hint"));
      return;
    }
    setError(""); setChecking(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const ok = await isUsernameAvailable(username);
      setAvailable(ok);
      setChecking(false);
    }, 500);
  }, [username, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !available) return;
    setSaving(true);
    try {
      const pendingName = sessionStorage.getItem("pending_display_name");
      const resolvedDisplayName = user.displayName || pendingName || username;

      await createUserProfile(user.uid, {
        email:       user.email ?? "",
        username,
        displayName: resolvedDisplayName,
        photoURL:    user.photoURL,
      });
      sessionStorage.removeItem("pending_display_name");
      await refreshProfile();

      try {
        const idToken = await user.getIdToken();
        await fetch("/api/admin/notify-new-user", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
          body: JSON.stringify({ username, email: user.email ?? "", displayName: resolvedDisplayName }),
        });
      } catch { /* sessizce geç */ }

      if (user.emailVerified) {
        router.push("/awaiting-approval");
      } else {
        setWaiting(true);
      }
    } catch {
      setError("Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!waiting || !user) return;
    pollRef.current = setInterval(async () => {
      await user.reload();
      if (auth?.currentUser?.emailVerified) {
        clearInterval(pollRef.current!);
        router.push("/awaiting-approval");
      }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [waiting, user, router]);

  const handleResend = async () => {
    if (!auth?.currentUser) return;
    await sendEmailVerification(auth.currentUser);
    setResent(true);
    setTimeout(() => setResent(false), 30000);
  };

  const statusColor = checking ? "var(--text-3)"
    : available === true  ? "#10B981"
    : available === false ? "#ef4444"
    : "var(--text-3)";

  const statusText = checking ? t("checking")
    : available === true  ? `✓ ${t("available")}`
    : available === false ? `✗ ${t("taken")}`
    : "";

  if (waiting) {
    return (
      <div style={{ width: "min(440px, 100%)" }}>
        <p className="mono" style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "32px" }}>
          trs
        </p>
        <div className="glass" style={{ borderRadius: "20px", padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>📧</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
            {t("verify")}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "28px" }}>
            {t("verifyBody")}
          </p>
          <button
            onClick={handleResend}
            disabled={resent}
            className="btn btn-accent"
            style={{ justifyContent: "center", padding: "12px 24px", fontSize: "0.9rem", opacity: resent ? 0.6 : 1 }}
          >
            {resent ? t("resent") : t("resend")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "min(400px, 100%)" }}>
      <p className="mono" style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "32px" }}>
        trs
      </p>

      <div className="glass" style={{ borderRadius: "20px", padding: "36px 32px" }}>
        <div style={{ fontSize: "2rem", marginBottom: "12px" }}>👤</div>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
          {t("title")}
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "28px" }}>
          {t("subtitle")}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
              {t("title")}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder={t("placeholder")}
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
              {t("hint")}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || !available}
            className="btn btn-accent"
            style={{ justifyContent: "center", padding: "12px", fontSize: "0.9rem", marginTop: "4px" }}
          >
            {saving ? t("submitting") : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
