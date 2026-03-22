"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { normalizeThemeId } from "@/lib/themes";
import ThemePicker from "@/components/ThemePicker";

export default function AdminThemePage() {
  const { user, profile } = useAuth();
  const [currentTheme, setCurrentTheme] = useState("dark-green");

  /* Profile yüklenince veya ThemePicker dışından değişince güncelle */
  useEffect(() => {
    if (profile?.settings?.theme) {
      setCurrentTheme(normalizeThemeId(profile.settings.theme));
    } else {
      const saved = localStorage.getItem("theme");
      setCurrentTheme(normalizeThemeId(saved));
    }
  }, [profile]);

  useEffect(() => {
    const onThemeChange = (e: Event) => {
      setCurrentTheme((e as CustomEvent<string>).detail);
    };
    window.addEventListener("themechange", onThemeChange);
    return () => window.removeEventListener("themechange", onThemeChange);
  }, []);

  return (
    <div style={{ maxWidth: "640px" }}>
      <header style={{ marginBottom: "32px" }}>
        <p className="mono" style={{
          fontSize: "0.68rem", color: "var(--text-3)",
          textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px",
        }}>
          /admin/tema
        </p>
        <h1 style={{
          fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700,
          color: "var(--text)", letterSpacing: "-0.02em",
        }}>
          Tema
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "8px" }}>
          Seçtiğin tema hesabına kaydedilir — her giriş yapışında otomatik yüklenir.
        </p>
      </header>

      <div className="glass" style={{ borderRadius: "16px", padding: "28px" }}>
        <ThemePicker
          currentTheme={currentTheme}
          uid={user?.uid}
          onThemeChange={setCurrentTheme}
        />
      </div>
    </div>
  );
}
