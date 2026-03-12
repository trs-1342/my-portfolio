"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

interface Props {
  photos: string[];
}

/* Dosya adından kullanıcı dostu isim ve tarih çıkar */
function parsePhotoMeta(src: string): { name: string; date: string | null } {
  const filename = src.split("/").pop() ?? src;
  const noExt = filename.replace(/\.[^.]+$/, "");

  /* Tarih desenleri: 2024-01-15, 20240115, 2024_01_15 */
  const dateMatch = noExt.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})/);
  let date: string | null = null;
  if (dateMatch) {
    const d = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
    if (!isNaN(d.getTime())) {
      date = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    }
  }

  /* İsim: tarih kısmını at, tire/alt çizgiyi boşluğa çevir */
  const name = noExt
    .replace(/\d{4}[-_]?\d{2}[-_]?\d{2}[-_]?/, "")
    .replace(/[-_]+/g, " ")
    .trim() || noExt;

  return { name, date };
}

export default function MasonryGallery({ photos }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  const prev = useCallback(() => {
    setIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }, [photos.length]);

  const next = useCallback(() => {
    setIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  const close = useCallback(() => setIndex(null), []);

  /* Klavye navigasyonu */
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, prev, next, close]);

  if (photos.length === 0) {
    return (
      <div
        className="glass"
        style={{
          borderRadius: "20px",
          padding: "80px 40px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "3rem" }}>📷</span>
        <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
          /public/myphotos/ klasörüne fotoğraf ekle
        </p>
      </div>
    );
  }

  const active = index !== null ? photos[index] : null;
  const activeMeta = active ? parsePhotoMeta(active) : null;

  return (
    <>
      {/* Masonry grid */}
      <div className="masonry-grid">
        {photos.map((src, i) => (
          <button
            key={src}
            onClick={() => setIndex(i)}
            className="masonry-item anim-fade-up"
            style={{ animationDelay: `${i * 0.04}s` }}
            aria-label="Fotoğrafı büyüt"
          >
            <Image
              src={src}
              alt=""
              width={600}
              height={400}
              style={{ width: "100%", height: "auto", display: "block", borderRadius: "12px" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {index !== null && active && activeMeta && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.18s ease",
          }}
          onClick={close}
        >

          {/* Sol üst: fotoğraf adı + tarih */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              display: "flex",
              flexDirection: "column",
              gap: "3px",
            }}
          >
            {activeMeta.name && (
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>
                {activeMeta.name}
              </p>
            )}
            {activeMeta.date && (
              <p className="mono" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>
                {activeMeta.date}
              </p>
            )}
            <p className="mono" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>
              {index + 1} / {photos.length}
            </p>
          </div>

          {/* Sağ üst: indir + kapat */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "flex",
              gap: "8px",
            }}
          >
            <a
              href={active}
              download
              title="İndir"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "999px",
                color: "#fff",
                fontSize: "0.85rem",
                width: 36,
                height: 36,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              ↓
            </a>
            <button
              onClick={close}
              title="Kapat (Esc)"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "999px",
                color: "#fff",
                fontSize: "1rem",
                width: 36,
                height: 36,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              ✕
            </button>
          </div>

          {/* Sol ok */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            title="Önceki (←)"
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "999px",
              color: "#fff",
              fontSize: "1.1rem",
              width: 44,
              height: 44,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
              zIndex: 10,
            }}
          >
            ‹
          </button>

          {/* Sağ ok */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            title="Sonraki (→)"
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "999px",
              color: "#fff",
              fontSize: "1.1rem",
              width: 44,
              height: 44,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
              zIndex: 10,
            }}
          >
            ›
          </button>

          {/* Görsel */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(88vw, 1000px)",
              maxHeight: "80vh",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
              cursor: "default",
            }}
          >
            <Image
              key={active}
              src={active}
              alt={activeMeta.name}
              width={1200}
              height={800}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
                display: "block",
                animation: "fadeIn 0.15s ease",
              }}
              priority
            />
          </div>
        </div>
      )}

      <style>{`
        .masonry-grid {
          columns: 3;
          column-gap: 14px;
        }
        .masonry-item {
          break-inside: avoid;
          display: block;
          width: 100%;
          margin-bottom: 14px;
          background: none;
          border: none;
          padding: 0;
          cursor: zoom-in;
          border-radius: 12px;
          overflow: hidden;
        }
        .masonry-item img {
          transition: transform 0.3s var(--spring), filter 0.3s ease;
        }
        .masonry-item:hover img {
          transform: scale(1.03);
          filter: brightness(1.06);
        }
        @media (max-width: 768px) {
          .masonry-grid { columns: 2; }
        }
        @media (max-width: 480px) {
          .masonry-grid { columns: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
