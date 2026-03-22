"use client";

import { useState } from "react";
import Image from "next/image";
import type { AboutPhoto } from "@/lib/firestore";

interface Props {
  photos: AboutPhoto[];
  name: string;
}

export default function PhotoSlider({ photos, name }: Props) {
  const [idx, setIdx] = useState(0);

  if (photos.length === 0) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, var(--bg-2) 0%, var(--bg) 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <span style={{ fontSize: "5rem" }}>🧑‍💻</span>
        <span className="mono" style={{ fontSize: "0.78rem", color: "var(--text-3)", textAlign: "center" }}>
          Admin panelinden fotoğraf ekle
        </span>
      </div>
    );
  }

  const current = photos[idx];
  const hasPrev = idx > 0;
  const hasNext = idx < photos.length - 1;

  return (
    <>
      <Image
        src={current.url}
        alt={name}
        fill
        style={{ objectFit: "cover" }}
        priority
      />

      {/* Sol/sağ butonlar — sadece birden fazla fotoğraf varsa */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={!hasPrev}
            style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, width: 32, height: 32, borderRadius: "50%",
              border: "1px solid var(--border)", background: "var(--panel)",
              backdropFilter: "blur(12px)", color: "var(--text)",
              fontSize: "0.85rem", cursor: hasPrev ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: hasPrev ? 1 : 0.3, transition: "opacity 0.2s",
            }}
          >‹</button>
          <button
            onClick={() => setIdx(i => Math.min(photos.length - 1, i + 1))}
            disabled={!hasNext}
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, width: 32, height: 32, borderRadius: "50%",
              border: "1px solid var(--border)", background: "var(--panel)",
              backdropFilter: "blur(12px)", color: "var(--text)",
              fontSize: "0.85rem", cursor: hasNext ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: hasNext ? 1 : 0.3, transition: "opacity 0.2s",
            }}
          >›</button>

          {/* Sayaç */}
          <div
            className="mono"
            style={{
              position: "absolute", bottom: 16, right: 16, zIndex: 10,
              fontSize: "0.68rem", color: "var(--text-3)",
              background: "var(--panel)", backdropFilter: "blur(12px)",
              padding: "3px 8px", borderRadius: "999px",
              border: "1px solid var(--border)",
            }}
          >
            {idx + 1}/{photos.length}
          </div>
        </>
      )}
    </>
  );
}
