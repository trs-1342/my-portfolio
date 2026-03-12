"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/firestore";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();

  const [navPos,   setNavPos]   = useState<"top" | "bottom">("top");
  const [theme,    setTheme]    = useState<"dark" | "light">("dark");
  const [notifEmail,   setNotifEmail]   = useState(true);
  const [notifMessage, setNotifMessage] = useState(true);
  const [notifSystem,  setNotifSystem]  = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState("");

  /* Profil yüklenince state'leri doldur */
  useEffect(() => {
    if (!profile) return;
    setNavPos(profile.settings.navbarPosition);
    setTheme(profile.settings.theme);
    setNotifEmail(profile.notifications?.email   ?? true);
    setNotifMessage(profile.notifications?.newMessage ?? true);
    setNotifSystem(profile.notifications?.system  ?? true);
  }, [profile]);

  /* Tema önizlemesi — kaydetmeden anında uygula */
  const handleThemeChange = (v: "dark" | "light") => {
    setTheme(v);
    if (v === "light") {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  if (!user || !profile) return null;

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      await updateUserProfile(user.uid, {
        settings: { navbarPosition: navPos, theme },
        notifications: { email: notifEmail, newMessage: notifMessage, system: notifSystem },
      });
      await refreshProfile();
      setMsg("Ayarlar kaydedildi.");
    } catch {
      setMsg("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AmbientGlow />
      <Navbar />
      <div className="page-content" style={{ paddingTop: "100px", paddingBottom: "80px" }}>
        <header style={{ marginBottom: "48px" }}>
          <p className="mono anim-fade-up" style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>
            /settings
          </p>
          <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)" }}>
            Ayarlar
          </h1>
        </header>

        <div style={{ maxWidth: "540px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ── Görünüm ── */}
          <SettingCard title="Görünüm">
            <SettingRow label="Tema" desc="Anında önizlenir, kaydet ile kalıcı olur.">
              <ToggleGroup
                options={[{ value: "dark", label: "🌑 Karanlık" }, { value: "light", label: "☀️ Aydınlık" }]}
                value={theme}
                onChange={(v) => handleThemeChange(v as "dark" | "light")}
              />
            </SettingRow>

            <Divider />

            <SettingRow label="Navbar Konumu" desc="Navigasyon çubuğunun konumu. (Yakında aktif)">
              <ToggleGroup
                options={[{ value: "top", label: "⬆ Üst" }, { value: "bottom", label: "⬇ Alt" }]}
                value={navPos}
                onChange={(v) => setNavPos(v as "top" | "bottom")}
                disabled
              />
            </SettingRow>
          </SettingCard>

          {/* ── Bildirimler ── */}
          <SettingCard title="Bildirimler">
            <SettingRow label="Email Bildirimleri" desc="Genel bildirimler email olarak gönderilir.">
              <Toggle value={notifEmail} onChange={setNotifEmail} />
            </SettingRow>

            <Divider />

            <SettingRow label="Yeni Mesaj" desc="İletişim formundan yeni mesaj geldiğinde.">
              <Toggle value={notifMessage} onChange={setNotifMessage} />
            </SettingRow>

            <Divider />

            <SettingRow label="Sistem Bildirimleri" desc="Bakım, güncelleme ve önemli duyurular.">
              <Toggle value={notifSystem} onChange={setNotifSystem} />
            </SettingRow>
          </SettingCard>

          {/* ── Hesap Bilgisi ── */}
          <SettingCard title="Hesap">
            <SettingRow label="Rol" desc="Hesap türü.">
              <span
                className="mono"
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: profile.role === "admin" ? "rgba(16,185,129,0.12)" : "var(--bg-2)",
                  border: `1px solid ${profile.role === "admin" ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                  color: profile.role === "admin" ? "var(--accent)" : "var(--text-3)",
                }}
              >
                {profile.role === "admin" ? "🔑 admin" : "👤 user"}
              </span>
            </SettingRow>

            <Divider />

            <SettingRow label="Durum" desc="Hesap durumu.">
              <span
                className="mono"
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  color: "var(--accent)",
                }}
              >
                ● {profile.status}
              </span>
            </SettingRow>
          </SettingCard>

          {msg && (
            <p style={{ fontSize: "0.82rem", color: msg.includes("kaydedildi") ? "#10B981" : "#ef4444", paddingLeft: "4px" }}>
              {msg}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-accent anim-fade-up"
            style={{ justifyContent: "center", padding: "13px", fontSize: "0.9rem" }}
          >
            {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </div>

        <Footer />
      </div>
    </>
  );
}

/* ── Yardımcı bileşenler ── */

function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass anim-fade-up" style={{ borderRadius: "20px", padding: "24px 28px" }}>
      <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "4px 0", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "2px" }}>{label}</p>
        <p style={{ fontSize: "0.74rem", color: "var(--text-3)", lineHeight: 1.4 }}>{desc}</p>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "var(--border)", margin: "14px 0" }} />;
}

function ToggleGroup({ options, value, onChange, disabled }: {
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => !disabled && onChange(o.value)}
          disabled={disabled}
          style={{
            padding: "7px 13px", borderRadius: "10px", border: "1px solid",
            borderColor: value === o.value ? "var(--accent)" : "var(--border)",
            background:  value === o.value ? "var(--accent-dim)" : "transparent",
            color:       value === o.value ? "var(--accent)" : "var(--text-3)",
            fontSize: "0.78rem", fontWeight: 500,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: "all 0.15s", fontFamily: "var(--font-sans)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: "999px", border: "none",
        background: value ? "var(--accent)" : "var(--bg-2)",
        cursor: "pointer", position: "relative", transition: "background 0.2s",
        flexShrink: 0,
        boxShadow: value ? "0 0 10px var(--accent-glow)" : "none",
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}
