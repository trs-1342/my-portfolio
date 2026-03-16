"use client";

import { useState } from "react";
import type { CvFile } from "@/lib/firestore";

interface Props {
  cvFiles: CvFile[];
}

export default function CVSection({ cvFiles }: Props) {
  const sorted = [...cvFiles].sort((a, b) => a.order - b.order);

  if (sorted.length === 0) {
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
            Admin panelinden CV ekle
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ marginTop: "64px" }} className="anim-fade-up">
      <SectionLabel />
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {sorted.map((cv) => (
          <CVCard key={cv.id} cv={cv} />
        ))}
      </div>
    </section>
  );
}

function CVCard({ cv }: { cv: CvFile }) {
  const [expanded, setExpanded] = useState(false);
  const filename = cv.url.split("/").pop() ?? "cv.pdf";

  return (
    <div>
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
            {cv.label || filename}
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
            href={cv.url}
            download={filename}
            className="btn btn-accent"
            style={{ fontSize: "0.8rem", padding: "7px 14px" }}
          >
            ↓ İndir
          </a>
          <a
            href={cv.url}
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
            src={`${cv.url}#toolbar=0&navpanes=0`}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            title={cv.label || filename}
          />
        </div>
      )}
    </div>
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
