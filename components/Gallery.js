"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Her görsel için ideal objectFit / objectPosition seç.
 * - Foto: cover + yüz için dikey %30 odak
 * - Icon: contain
 */
const IMAGES = [
  { src: "/halil.png", fit: "cover", pos: "center 30%" },
  { src: "/halil2.png", fit: "cover", pos: "center center" },
  { src: "/halil3.png", fit: "cover", pos: "center center" },
  { src: "/favicon.ico", fit: "cover", pos: "center center" },
];

export default function Gallery() {
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(true);

  // 6 sn'de bir değiştir
  useEffect(() => {
    const id = setInterval(() => swap(), 6000);
    return () => clearInterval(id);
  }, [idx]);

  function swap() {
    setLoaded(false);
    setIdx((v) => (v + 1) % IMAGES.length);
  }

  const cur = IMAGES[idx];

  return (
    <aside className="left" aria-label="Profil görseli">
      <div
        className="left-img-wrap"
        onClick={swap}
        role="button"
        title="Görseli değiştir"
      >
        <Image
          key={cur.src} // her geçişte yeniden mount
          src={cur.src}
          alt="Halil Hattab"
          fill
          priority // LCP için
          sizes="(max-width: 900px) 100vw, 50vw"
          className={`left-img ${loaded ? "is-loaded" : ""}`}
          style={{
            objectFit: cur.fit,
            objectPosition: cur.pos,
            backgroundColor: "var(--bg)",
          }}
          onLoadingComplete={() => setLoaded(true)}
        />
      </div>
    </aside>
  );
}
