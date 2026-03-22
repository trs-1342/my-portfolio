"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { togglePhotoFavorite } from "@/lib/firestore";
import type { PhotoItem } from "@/lib/firestore";

interface Props {
  photos: PhotoItem[];
  uid: string;
}

export default function MasonryGallery({ photos, uid }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [localPhotos, setLocalPhotos] = useState<PhotoItem[]>(photos);

  useEffect(() => { setLocalPhotos(photos); }, [photos]);

  const prev = useCallback(() => {
    setIndex((i) => (i === null ? null : (i - 1 + localPhotos.length) % localPhotos.length));
  }, [localPhotos.length]);

  const next = useCallback(() => {
    setIndex((i) => (i === null ? null : (i + 1) % localPhotos.length));
  }, [localPhotos.length]);

  const close = useCallback(() => setIndex(null), []);

  /* Favori toggle */
  const handleFavorite = async (photo: PhotoItem) => {
    const isFav = photo.favorites?.includes(uid) ?? false;
    /* Optimistic update */
    setLocalPhotos((prev) =>
      prev.map((p) =>
        p.id === photo.id
          ? {
              ...p,
              favorites: isFav
                ? p.favorites.filter((u) => u !== uid)
                : [...(p.favorites ?? []), uid],
            }
          : p
      )
    );
    await togglePhotoFavorite(photo.id, uid, !isFav);
  };

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

  if (localPhotos.length === 0) {
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
          Henüz fotoğraf yok.
        </p>
      </div>
    );
  }

  const active = index !== null ? localPhotos[index] : null;

  return (
    <>
      {/* Masonry grid */}
      <div className="masonry-grid">
        {localPhotos.map((photo, i) => {
          const isFav = photo.favorites?.includes(uid) ?? false;
          return (
            <div
              key={photo.id}
              className="masonry-item anim-fade-up"
              style={{ animationDelay: `${i * 0.04}s`, position: "relative" }}
            >
              <button
                onClick={() => setIndex(i)}
                style={{
                  display: "block", width: "100%",
                  background: "none", border: "none", padding: 0, cursor: "zoom-in",
                }}
                aria-label="Fotoğrafı büyüt"
              >
                <Image
                  src={photo.url}
                  alt={photo.title || ""}
                  width={600}
                  height={400}
                  style={{ width: "100%", height: "auto", display: "block", borderRadius: "12px" }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </button>

              {/* Favori butonu */}
              <button
                onClick={() => handleFavorite(photo)}
                title={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  background: "rgba(0,0,0,0.55)",
                  border: "none",
                  borderRadius: "999px",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                  transition: "transform 0.15s",
                }}
              >
                {isFav ? "❤️" : "🤍"}
              </button>

              {/* Başlık */}
              {photo.title && (
                <p style={{
                  fontSize: "0.75rem",
                  color: "var(--text-2)",
                  marginTop: "6px",
                  paddingLeft: "2px",
                  fontWeight: 500,
                }}>
                  {photo.title}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {index !== null && active && (
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
          {/* Sol üst: başlık + caption */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              maxWidth: "40vw",
            }}
          >
            {active.title && (
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>
                {active.title}
              </p>
            )}
            {active.caption && (
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
                {active.caption}
              </p>
            )}
            <p className="mono" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>
              {index + 1} / {localPhotos.length}
            </p>
          </div>

          {/* Sağ üst: favori + indir + kapat */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: "8px" }}
          >
            <button
              onClick={() => handleFavorite(active)}
              title={active.favorites?.includes(uid) ? "Favorilerden çıkar" : "Favorilere ekle"}
              style={lightboxBtnStyle}
            >
              {active.favorites?.includes(uid) ? "❤️" : "🤍"}
            </button>
            <a
              href={active.url}
              download
              title="İndir"
              style={{ ...lightboxBtnStyle, textDecoration: "none", color: "#fff" }}
            >
              ↓
            </a>
            <button onClick={close} title="Kapat (Esc)" style={lightboxBtnStyle}>
              ✕
            </button>
          </div>

          {/* Sol ok */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            title="Önceki (←)"
            style={{ ...arrowStyle, left: 20 }}
          >
            ‹
          </button>

          {/* Sağ ok */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            title="Sonraki (→)"
            style={{ ...arrowStyle, right: 20 }}
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
              key={active.id}
              src={active.url}
              alt={active.title || ""}
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

const lightboxBtnStyle: React.CSSProperties = {
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
  transition: "background 0.15s",
};

const arrowStyle: React.CSSProperties = {
  position: "absolute",
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
};
