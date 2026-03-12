"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Props {
  photos: string[];
}

const INTERVAL   = 6500;
const LONG_PRESS = 420; // ms — bu süreden uzun basış = long press

export default function PhotoSlider({ photos }: Props) {
  const [current, setCurrent]   = useState(0);
  const [paused, setPaused]     = useState(false);

  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongRef    = useRef(false);

  /* Otomatik geçiş — paused ise durur */
  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [photos.length, paused]);

  const next = () => setCurrent((prev) => (prev + 1) % photos.length);

  /* Dokunuş başladı */
  const handlePointerDown = () => {
    isLongRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongRef.current = true;
      setPaused(true);          // uzun basış → dondur
    }, LONG_PRESS);
  };

  /* Dokunuş bitti */
  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isLongRef.current) {
      /* Kısa dokunuş: eğer dondurulmuşsa devam et + ilerle */
      setPaused(false);
      next();
    }
    /* Long press ise zaten donduruldu, bir şey yapmıyoruz */
  };

  /* Pointer dışarı çıkınca timer'ı temizle */
  const handlePointerLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  if (photos.length === 0) {
    return (
      <div className="photo-placeholder">
        <span style={{ fontSize: "3rem" }}>🧑‍💻</span>
        <span
          className="mono"
          style={{ fontSize: "0.8rem", color: "var(--text-3)", textAlign: "center" }}
        >
          /public/myphotos/<br />klasörüne fotoğraf ekle
        </span>
      </div>
    );
  }

  return (
    <>
      {photos.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          className="photo-slot"
          style={{
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.8s ease",
            cursor: "pointer",
          }}
          sizes="(max-width: 768px) 100vw, 480px"
          priority={i === 0}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          draggable={false}
        />
      ))}

      {/* Donduruldu göstergesi */}
      {paused && (
        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 14,
            zIndex: 10,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--border)",
            borderRadius: "999px",
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.06em", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
            ⏸ donduruldu
          </span>
        </div>
      )}
    </>
  );
}
