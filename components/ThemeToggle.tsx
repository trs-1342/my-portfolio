"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { applyTheme, normalizeThemeId, getCounterpart } from "@/lib/themes";
import { updateUserTheme } from "@/lib/firestore";

export default function ThemeToggle() {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState("dark-green");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTheme(normalizeThemeId(saved));

    /* ThemePicker veya başka yerden tema değişirse güncelle */
    const onThemeChange = (e: Event) => {
      setCurrentTheme((e as CustomEvent<string>).detail);
    };
    window.addEventListener("themechange", onThemeChange);
    return () => window.removeEventListener("themechange", onThemeChange);
  }, []);

  const isDark = currentTheme.startsWith("dark-");

  const toggle = async () => {
    const next = getCounterpart(currentTheme);
    setCurrentTheme(next);
    applyTheme(next);
    if (user) {
      await updateUserTheme(user.uid, next);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Aydınlık temaya geç" : "Karanlık temaya geç"}
      title={isDark ? "Aydınlık mod" : "Karanlık mod"}
      style={{
        padding: "7px 10px",
        borderRadius: "999px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "1rem",
        lineHeight: 1,
        transition: "transform 0.3s ease",
        color: "var(--text-2)",
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
