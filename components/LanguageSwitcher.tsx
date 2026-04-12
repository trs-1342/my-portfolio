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

interface Props {
  /** pill  → navbar'da küçük dropdown  (masaüstü)
   *  inline → mobil menüde yan yana 3 buton (mobil)  */
  mode?: "pill" | "inline";
}

export default function LanguageSwitcher({ mode = "pill" }: Props) {
  const locale   = useLocale() as Locale;
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Dışarı tıklayınca kapat (sadece pill modda gerekli) */
  useEffect(() => {
    if (mode !== "pill") return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mode]);

  /* Escape ile kapat */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const switchLocale = (next: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  /* ── Inline mod: mobil menüde yan yana 3 buton ── */
  if (mode === "inline") {
    return (
      <div style={{ display: "flex", gap: "6px" }}>
        {locales.map((loc) => {
          const meta    = LOCALE_META[loc];
          const isActive = loc === locale;
          return (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              aria-label={meta.name}
              aria-pressed={isActive}
              style={{
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                gap:            "3px",
                padding:        "8px 12px",
                borderRadius:   "10px",
                border:         `1px solid ${isActive ? "var(--border-hover)" : "var(--border)"}`,
                background:     isActive ? "var(--accent-dim)" : "var(--panel)",
                cursor:         "pointer",
                transition:     "all 0.15s",
                flex:           "1",
              }}
            >
              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{meta.flag}</span>
              <span
                className="mono"
                style={{
                  fontSize:   "0.62rem",
                  fontWeight: isActive ? 700 : 400,
                  color:      isActive ? "var(--accent)" : "var(--text-3)",
                  letterSpacing: "0.06em",
                }}
              >
                {meta.short}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Pill mod: navbar'da dropdown ── */
  const current = LOCALE_META[locale];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="mono"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "5px",
          padding:      "5px 9px",
          borderRadius: "999px",
          border:       `1px solid ${open ? "var(--border-hover)" : "var(--border)"}`,
          background:   open ? "var(--accent-dim)" : "transparent",
          color:        open ? "var(--accent)" : "var(--text-2)",
          fontSize:     "0.7rem",
          fontWeight:   600,
          cursor:       "pointer",
          transition:   "all 0.15s",
          letterSpacing:"0.05em",
          whiteSpace:   "nowrap",
        }}
      >
        <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>{current.flag}</span>
        {current.short}
        {/* Küçük chevron */}
        <svg
          width="8" height="8" viewBox="0 0 8 8"
          style={{
            marginLeft: "1px",
            transition: "transform 0.2s",
            transform:  open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.6,
          }}
        >
          <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          style={{
            position:     "absolute",
            top:          "calc(100% + 8px)",
            right:        0,
            minWidth:     "145px",
            background:   "var(--panel)",
            border:       "1px solid var(--border)",
            borderRadius: "14px",
            padding:      "5px",
            display:      "flex",
            flexDirection:"column",
            gap:          "2px",
            boxShadow:    "0 12px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.15)",
            zIndex:       9999,
            animation:    "langDropIn 0.14s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {locales.map((loc) => {
            const meta    = LOCALE_META[loc];
            const isActive = loc === locale;
            return (
              <button
                key={loc}
                role="option"
                aria-selected={isActive}
                onClick={() => switchLocale(loc)}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "10px",
                  padding:      "8px 10px",
                  borderRadius: "10px",
                  border:       "none",
                  background:   isActive ? "var(--accent-dim)" : "transparent",
                  cursor:       "pointer",
                  textAlign:    "left",
                  fontFamily:   "var(--font-sans)",
                  transition:   "background 0.1s",
                  width:        "100%",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--panel-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                {/* Aktif göstergesi */}
                <span style={{
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: isActive ? "var(--accent)" : "transparent",
                  border: isActive ? "none" : "1px solid var(--border)",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }} />

                <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{meta.flag}</span>

                <span style={{ flex: 1 }}>
                  <span
                    className="mono"
                    style={{
                      display:    "block",
                      fontSize:   "0.72rem",
                      fontWeight: isActive ? 700 : 500,
                      color:      isActive ? "var(--accent)" : "var(--text)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {meta.short}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
                    {meta.name}
                  </span>
                </span>

                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ color: "var(--accent)", flexShrink: 0 }}>
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes langDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
