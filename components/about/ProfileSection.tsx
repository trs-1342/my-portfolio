/* Hakkımda sayfası üst bölüm — 50/50 split */
import Image from "next/image";
import PhotoSlider from "./PhotoSlider";
import type { AboutConfig } from "@/lib/firestore";

const LEVEL_LABELS: Record<string, string> = {
  junior: "Junior Software Developer",
  mid:    "Mid-level Software Developer",
  senior: "Senior Software Developer",
};

interface Props {
  config: AboutConfig;
}

export default function ProfileSection({ config }: Props) {
  const { name, handle, aboutLevel, aboutText, bioText, buttons, photos } = config;

  const titleText = aboutText
    ? `${LEVEL_LABELS[aboutLevel] ?? "Software Developer"} — ${aboutText}`
    : (LEVEL_LABELS[aboutLevel] ?? "Software Developer");

  /* Markdown-lite: **bold**, *italic*, <br> ve \n → <br> */
  function renderBio(raw: string) {
    return raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  return (
    <section
      className="profile-section"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "48px",
        alignItems: "center",
        minHeight: "100svh",
        paddingTop: "100px",
        paddingBottom: "60px",
      }}
    >
      {/* Sol — İçerik */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* İsim */}
        <div className="anim-fade-up d1">
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--text)",
              marginBottom: "6px",
            }}
          >
            {name}
          </h1>

          {/* Takma ad */}
          <div
            className="mono"
            style={{
              fontSize: "1.1rem",
              color: "var(--accent)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {handle}
          </div>
        </div>

        {/* Ünvan etiketi */}
        <div className="anim-fade-up d2">
          <span
            className="glass"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "999px",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "var(--accent)",
              boxShadow: "0 0 16px var(--accent-glow)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                boxShadow: "0 0 8px var(--accent)",
              }}
            />
            {titleText}
          </span>
        </div>

        {/* Bio */}
        <div
          className="anim-fade-up d3"
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <p
            style={{ color: "var(--text-2)", lineHeight: 1.8, fontSize: "0.96rem" }}
            dangerouslySetInnerHTML={{ __html: renderBio(bioText) }}
          />
        </div>

        {/* CTA butonlar */}
        {buttons.length > 0 && (
          <div
            className="anim-fade-up d4"
            style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
          >
            {[...buttons].sort((a, b) => a.order - b.order).map((btn) => (
              <a
                key={btn.id}
                href={btn.href}
                className={`btn btn-${btn.variant}`}
                target={btn.href.startsWith("http") ? "_blank" : undefined}
                rel={btn.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {btn.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Sağ — Fotoğraf kartı */}
      <div className="anim-fade-up d3" style={{ display: "flex", justifyContent: "center" }}>
        <div
          className="glass"
          style={{
            width: "100%",
            maxWidth: "460px",
            aspectRatio: "3 / 4",
            position: "relative",
            overflow: "hidden",
            borderRadius: "24px",
          }}
        >
          <PhotoSlider photos={[...photos].sort((a, b) => a.order - b.order)} name={name} />

          {/* Kenar gradient maskesi */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, transparent 50%, var(--bg) 90%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Köşe etiketi */}
          <div
            className="mono"
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              zIndex: 10,
              fontSize: "0.72rem",
              color: "var(--text-3)",
              background: "var(--panel)",
              backdropFilter: "blur(12px)",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid var(--border)",
            }}
          >
            {name} — {new Date().getFullYear()}
          </div>
        </div>
      </div>

    </section>
  );
}
