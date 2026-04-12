"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState, useRef, useEffect } from "react";
import { locales, type Locale } from "@/i18n/routing";

const LOCALE_META: Record<Locale, { flag: string; short: string; name: string }> = {
  tr: { flag: "🇹🇷", short: "TR", name: "Türkçe" },
  en: { flag: "🇬🇧", short: "EN", name: "English" },
  ar: { flag: "🇸🇦", short: "AR", name: "العربية" },
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Dışarı tıklayınca kapat */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLocale = (next: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  const current = LOCALE_META[locale];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="mono"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "5px 10px",
          borderRadius: "999px",
          border: "1px solid var(--border)",
          background: open ? "var(--panel)" : "transparent",
          color: "var(--text-2)",
          fontSize: "0.72rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}
        aria-label="Dil seç / Select language"
        aria-expanded={open}
      >
        <span style={{ fontSize: "0.85rem" }}>{current.flag}</span>
        {current.short}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "130px",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            zIndex: 9999,
            animation: "fadeInUp 0.15s ease both",
          }}
        >
          {locales.map((loc) => {
            const meta = LOCALE_META[loc];
            const isActive = loc === locale;
            return (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: isActive ? "var(--accent-dim)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-2)",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 700 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--panel-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                }}
              >
                <span style={{ fontSize: "1rem" }}>{meta.flag}</span>
                <span className="mono" style={{ letterSpacing: "0.03em" }}>
                  {meta.short}
                </span>
                <span style={{ color: "var(--text-3)", fontSize: "0.76rem" }}>
                  {meta.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
