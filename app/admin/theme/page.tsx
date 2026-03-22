"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { normalizeThemeId } from "@/lib/themes";
import { getSiteTheme, setSiteTheme } from "@/lib/firestore";
import ThemePicker from "@/components/ThemePicker";

export default function AdminThemePage() {
  const { user, profile } = useAuth();
  const [personalTheme, setPersonalTheme] = useState("dark-green");
  const [siteTheme,     setSiteThemeState] = useState("dark-green");

  /* Profile yüklenince kişisel temayı doldur */
  useEffect(() => {
    if (profile?.settings?.theme) {
      setPersonalTheme(normalizeThemeId(profile.settings.theme));
    } else {
      setPersonalTheme(normalizeThemeId(localStorage.getItem("theme")));
    }
  }, [profile]);

  /* Site temasını Firestore'dan çek */
  useEffect(() => {
    getSiteTheme().then((t) => {
      if (t) setSiteThemeState(normalizeThemeId(t));
    });
  }, []);

  /* ThemePicker dışından tema değişince kişisel state'i güncelle */
  useEffect(() => {
    const onThemeChange = (e: Event) => {
      setPersonalTheme((e as CustomEvent<string>).detail);
    };
    window.addEventListener("themechange", onThemeChange);
    return () => window.removeEventListener("themechange", onThemeChange);
  }, []);

  const handleSiteSave = async (id: string) => {
    setSiteThemeState(id);
    await setSiteTheme(id);
  };

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
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── Site Varsayılan Teması ── */}
        <section>
          <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "4px" }}>
            Site Varsayılan Teması
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: "16px" }}>
            Giriş yapmayan ziyaretçiler bu temayı görür. Kayıtlı kullanıcıların kendi seçimleri bundan etkilenmez.
          </p>
          <div className="glass" style={{ borderRadius: "16px", padding: "28px" }}>
            <ThemePicker
              currentTheme={siteTheme}
              onSave={handleSiteSave}
              onThemeChange={setSiteThemeState}
              hint="Seçim kaydedilir ve ziyaretçilere uygulanır."
            />
          </div>
        </section>

        <div style={{ height: "1px", background: "var(--border)" }} />

        {/* ── Kendi Temam ── */}
        <section>
          <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "4px" }}>
            Kendi Temam
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: "16px" }}>
            Sadece senin hesabına kaydedilir — giriş yaptığında otomatik yüklenir.
          </p>
          <div className="glass" style={{ borderRadius: "16px", padding: "28px" }}>
            <ThemePicker
              currentTheme={personalTheme}
              uid={user?.uid}
              onThemeChange={setPersonalTheme}
            />
          </div>
        </section>

      </div>
    </div>
  );
}
