"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // Başlangıç durumunu localStorage'dan oku
    const saved = localStorage.getItem("theme");
    const isDark = saved !== "light";
    setDark(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Aydınlık temaya geç" : "Karanlık temaya geç"}
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
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
