"use client";

import { useState } from "react";

interface Props {
  file: string | null; // "/doc/cv.pdf" gibi
}

export default function CVSection({ file }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!file) {
    return (
      <section style={{ marginTop: "64px" }}>
        <SectionLabel />
        <div
          className="glass"
          style={{
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "2rem" }}>📄</span>
          <p className="mono" style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>
            public/doc/ klasörüne bir PDF ekle
          </p>
        </div>
      </section>
    );
  }

  const filename = file.split("/").pop() ?? "cv.pdf";

  return (
    <section style={{ marginTop: "64px" }} className="anim-fade-up">
      <SectionLabel />

      {/* Aksiyon çubuğu */}
      <div
        className="glass"
        style={{
          borderRadius: expanded ? "16px 16px 0 0" : "16px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          borderBottom: expanded ? "1px solid var(--border)" : undefined,
          transition: "border-radius 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>📄</span>
          <span className="mono" style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
            {filename}
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="btn btn-ghost"
            style={{ fontSize: "0.8rem", padding: "7px 14px" }}
          >
            {expanded ? "↑ Gizle" : "👁 Görüntüle"}
          </button>
          <a
            href={file}
            download={filename}
            className="btn btn-accent"
            style={{ fontSize: "0.8rem", padding: "7px 14px" }}
          >
            ↓ İndir
          </a>
          <a
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: "0.8rem", padding: "7px 14px" }}
          >
            ↗ Tam Ekran
          </a>
        </div>
      </div>

      {/* PDF embed */}
      {expanded && (
        <div
          className="glass"
          style={{
            borderRadius: "0 0 16px 16px",
            overflow: "hidden",
            height: "700px",
          }}
        >
          <iframe
            src={`${file}#toolbar=0&navpanes=0`}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            title="CV"
          />
        </div>
      )}
    </section>
  );
}

function SectionLabel() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
      <p
        className="mono"
        style={{
          fontSize: "0.72rem",
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        Özgeçmiş / CV
      </p>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}
