"use client";

import { useEffect, useRef } from "react";

/* Firebase UID'leri genellikle 28 karakter. 20+ karakter ise UID gibi göster. */
function displayName(identifier: string): string {
  return identifier.length > 20 ? `Kullanıcı` : `@${identifier}`;
}

interface LikesCardProps {
  likes: string[];
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export default function LikesCard({ likes, onClose, anchorRef }: LikesCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  /* Dışarı tıklanınca kapat */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        cardRef.current &&
        !cardRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, anchorRef]);

  /* Escape tuşu ile kapat */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (likes.length === 0) return null;

  return (
    <div
      ref={cardRef}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        minWidth: 160,
        maxWidth: 240,
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        backdropFilter: "blur(16px)",
        padding: "10px 0",
        animation: "fade-in 0.12s ease",
      }}
    >
      {/* Ok */}
      <div style={{
        position: "absolute",
        bottom: -5,
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        width: 10,
        height: 10,
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderTop: "none",
        borderLeft: "none",
      }} />

      <p className="mono" style={{
        fontSize: "0.62rem",
        color: "var(--text-3)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        padding: "0 12px 8px",
        borderBottom: "1px solid var(--border)",
        marginBottom: "4px",
      }}>
        Beğenenler · {likes.length}
      </p>

      <div style={{ maxHeight: 180, overflowY: "auto" }}>
        {likes.map((id, i) => (
          <div
            key={i}
            style={{
              padding: "5px 12px",
              fontSize: "0.8rem",
              color: "var(--text-2)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ color: "#ef4444", fontSize: "0.72rem" }}>♥</span>
            <span className="mono">{displayName(id)}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
