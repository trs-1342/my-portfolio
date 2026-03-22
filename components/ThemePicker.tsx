"use client";

import { THEMES, applyTheme, normalizeThemeId } from "@/lib/themes";
import { updateUserTheme } from "@/lib/firestore";

interface Props {
  currentTheme: string;          // aktif tema ID
  uid?: string;                  // giriş yapmışsa UID (Firestore'a kayıt için)
  onThemeChange?: (id: string) => void;
  onSave?: (id: string) => Promise<void>; // uid yerine özel kayıt fn (örn. site teması)
  hint?: string;                 // alt bilgi yazısı override
}

export default function ThemePicker({ currentTheme, uid, onThemeChange, onSave, hint }: Props) {
  const active = normalizeThemeId(currentTheme);

  const handleSelect = async (id: string) => {
    applyTheme(id);
    onThemeChange?.(id);
    if (onSave) {
      await onSave(id);
    } else if (uid) {
      await updateUserTheme(uid, id);
    }
  };

  const dark  = THEMES.filter((t) => t.dark);
  const light = THEMES.filter((t) => !t.dark);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Koyu Temalar */}
      <div>
        <p className="mono" style={{
          fontSize: "0.65rem", color: "var(--text-3)",
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px",
        }}>
          Koyu
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {dark.map((t) => (
            <ThemeCard key={t.id} theme={t} selected={active === t.id} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      {/* Açık Temalar */}
      <div>
        <p className="mono" style={{
          fontSize: "0.65rem", color: "var(--text-3)",
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px",
        }}>
          Açık
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {light.map((t) => (
            <ThemeCard key={t.id} theme={t} selected={active === t.id} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
        {hint ?? "Seçim anında uygulanır ve hesabına kaydedilir."}
      </p>
    </div>
  );
}

function ThemeCard({
  theme,
  selected,
  onSelect,
}: {
  theme: (typeof THEMES)[number];
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(theme.id)}
      title={theme.label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "10px 8px",
        borderRadius: "12px",
        border: selected
          ? `2px solid ${theme.accent}`
          : "2px solid var(--border)",
        background: selected ? `${theme.accent}15` : "var(--bg-2)",
        cursor: "pointer",
        transition: "all 0.15s",
        outline: "none",
      }}
    >
      {/* Önizleme kutusu */}
      <div
        style={{
          width: "100%",
          height: "36px",
          borderRadius: "8px",
          background: theme.bg,
          border: `1px solid ${theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          overflow: "hidden",
        }}
      >
        {/* Mini UI önizlemesi */}
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: theme.accent }} />
        <div style={{ width: "18px", height: "3px", borderRadius: "2px", background: theme.accent, opacity: 0.6 }} />
        <div style={{ width: "10px", height: "3px", borderRadius: "2px", background: theme.dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }} />
      </div>

      {/* Etiket */}
      <span
        className="mono"
        style={{
          fontSize: "0.62rem",
          color: selected ? theme.accent : "var(--text-3)",
          textAlign: "center",
          lineHeight: 1.3,
          fontWeight: selected ? 600 : 400,
        }}
      >
        {theme.label}
      </span>

      {selected && (
        <span style={{ fontSize: "0.6rem", color: theme.accent }}>✓</span>
      )}
    </button>
  );
}
