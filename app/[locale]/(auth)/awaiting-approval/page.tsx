"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/lib/firestore";

export default function AwaitingApprovalPage() {
  const t = useTranslations("Auth.awaiting");
  const { user, loading, logout } = useAuth();
  const router  = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }

    pollRef.current = setInterval(async () => {
      const profile = await getUserProfile(user.uid);
      if (profile?.status === "active") {
        clearInterval(pollRef.current!);
        router.push("/");
      } else if (!profile || profile.status === "banned") {
        clearInterval(pollRef.current!);
        await logout();
        router.push("/login");
      }
    }, 10000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, loading, router, logout]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div style={{ width: "min(440px, 100%)" }}>
      <p className="mono" style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: "32px" }}>
        trs
      </p>

      <div className="glass" style={{ borderRadius: "20px", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>⏳</div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
          {t("title")}
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "28px" }}>
          {t("body")}
        </p>
        <button
          onClick={handleLogout}
          style={{ padding: "10px 22px", borderRadius: "10px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "border-color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          {t("logout")}
        </button>
        <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: "20px" }}>
          {t("pollNote")}
        </p>
      </div>
    </div>
  );
}
