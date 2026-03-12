"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  event: {
    date: string;
    title: string;
    log: string;
  };
  onClose: () => void;
}

export default function MatrixOverlay({ event, onClose }: Props) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  /* Typewriter efekti — her karakter 28ms'de bir */
  useEffect(() => {
    const text = event.log;
    indexRef.current = 0;
    setDisplayed("");

    const id = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) clearInterval(id);
    }, 28);

    return () => clearInterval(id);
  }, [event.log]);

  /* ESC ile kapat */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "fadeInUp 0.2s ease both",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass"
        style={{
          width: "min(600px, 100%)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid var(--accent)",
          boxShadow: "0 0 40px var(--accent-glow), 0 0 80px rgba(16,185,129,0.1)",
        }}
      >
        {/* Terminal başlık çubuğu */}
        <div
          style={{
            background: "rgba(16,185,129,0.08)",
            borderBottom: "1px solid var(--accent)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            {["#ef4444","#f59e0b","#22c55e"].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span
            className="mono"
            style={{ fontSize: "0.75rem", color: "var(--accent)", flex: 1 }}
          >
            trs@arch: ~/system-log — {event.date}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-3)",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontFamily: "var(--font-mono)",
            }}
          >
            [ESC]
          </button>
        </div>

        {/* Terminal içeriği */}
        <div style={{ padding: "24px 20px", minHeight: "180px" }}>
          {/* Başlık logu */}
          <p
            className="mono"
            style={{
              fontSize: "0.75rem",
              color: "var(--text-3)",
              marginBottom: "16px",
            }}
          >
            # {event.title}
          </p>

          {/* Typewriter text */}
          <pre
            className="mono"
            style={{
              fontSize: "0.82rem",
              color: "var(--accent)",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {displayed}
            {/* Yanıp sönen imleç */}
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "14px",
                background: "var(--accent)",
                marginLeft: "2px",
                verticalAlign: "middle",
                animation: "statusPulse 0.8s step-end infinite",
              }}
            />
          </pre>
        </div>

        {/* Alt bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "10px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
            Kapatmak için ESC veya dışarı tıkla
          </span>
          <span className="mono" style={{ fontSize: "0.68rem", color: "var(--accent)" }}>
            [OK]
          </span>
        </div>
      </div>
    </div>
  );
}
