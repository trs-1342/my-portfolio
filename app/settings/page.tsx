"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/firestore";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();

  const [navPos, setNavPos] = useState<"top" | "bottom">(profile?.settings.navbarPosition ?? "top");
  const [theme,  setTheme]  = useState<"dark" | "light">(profile?.settings.theme ?? "dark");
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState("");

  if (!user || !profile) return null;

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      await updateUserProfile(user.uid, { settings: { navbarPosition: navPos, theme } });
      /* Temayı uygula */
      if (theme === "light") {
        document.documentElement.classList.add("light");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.remove("light");
        localStorage.setItem("theme", "dark");
      }
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
          <p className="mono anim-fade-up" style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>/settings</p>
          <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)" }}>
            Ayarlar
          </h1>
        </header>

        <div style={{ maxWidth: "520px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Görünüm */}
          <div className="glass anim-fade-up d2" style={{ borderRadius: "20px", padding: "28px" }}>
            <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
              Görünüm
            </p>

            {/* Tema */}
            <SettingRow label="Tema" desc="Sitenin renk temasını seç.">
              <ToggleGroup
                options={[{ value: "dark", label: "🌑 Karanlık" }, { value: "light", label: "☀️ Aydınlık" }]}
                value={theme}
                onChange={(v) => setTheme(v as "dark" | "light")}
              />
            </SettingRow>

            <div style={{ height: "1px", background: "var(--border)", margin: "18px 0" }} />

            {/* Navbar Konumu */}
            <SettingRow label="Navbar Konumu" desc="Navigasyon çubuğunun konumu. (Yakında aktif)">
              <ToggleGroup
                options={[{ value: "top", label: "⬆ Üst" }, { value: "bottom", label: "⬇ Alt" }]}
                value={navPos}
                onChange={(v) => setNavPos(v as "top" | "bottom")}
                disabled
              />
            </SettingRow>
          </div>

          {msg && (
            <p style={{ fontSize: "0.82rem", color: msg.includes("kaydedildi") ? "#10B981" : "#ef4444", paddingLeft: "4px" }}>
              {msg}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-accent anim-fade-up d3"
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

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "3px" }}>{label}</p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", lineHeight: 1.5 }}>{desc}</p>
      </div>
      {children}
    </div>
  );
}

function ToggleGroup({ options, value, onChange, disabled }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => !disabled && onChange(o.value)}
          disabled={disabled}
          style={{
            padding: "7px 14px",
            borderRadius: "10px",
            border: "1px solid",
            borderColor: value === o.value ? "var(--accent)" : "var(--border)",
            background:   value === o.value ? "var(--accent-dim)" : "transparent",
            color:        value === o.value ? "var(--accent)" : "var(--text-3)",
            fontSize: "0.8rem", fontWeight: 500,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: "all 0.15s",
            fontFamily: "var(--font-sans)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
