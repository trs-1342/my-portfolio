// components/Gallery.js
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const IMAGES = [
  { src: "/halil.png", fit: "cover", pos: "center 30%" },
  { src: "/halil2.png", fit: "cover", pos: "center center" },
  { src: "/halil3.png", fit: "cover", pos: "center center" },
  { src: "/halil4.png", fit: "cover", pos: "center center" },
  { src: "/favicon.ico", fit: "cover", pos: "center center" },
];

const FADE_MS = 450; // crossfade süresi
const INTERVAL_MS = 7000; // 7 sn

export default function Gallery() {
  const [idx, setIdx] = useState(0); // aktif görsel
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);

  const cur = IMAGES[idx];
  const nextIdx = (idx + 1) % IMAGES.length;
  const nxt = IMAGES[nextIdx];

  // Bir adım ilerle (crossfade)
  const advanceOne = useCallback(() => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setIdx((i) => (i + 1) % IMAGES.length);
      setFading(false);
    }, FADE_MS);
  }, [fading]);

  // Otomatik geçiş (her 7 sn). Her değişimde zamanlayıcıyı sıfırla.
  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(advanceOne, INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [idx, advanceOne]);

  // Tıklayınca sadece bir sonraki görsele geç
  function handleClick() {
    advanceOne(); // timer kendini idx değişince zaten 7sn’ye sıfırlar
  }

  return (
    <aside className="left" aria-label="Profil görseli">
      <div
        className="left-img-wrap"
        onClick={handleClick}
        role="button"
        title="Bir sonraki görsele geç"
      >
        {/* Alt katman: mevcut */}
        <Image
          key={cur.src + "-base"}
          src={cur.src}
          alt="Halil Hattab (trs-1342)"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 50vw"
          className="left-img layer base"
          style={{
            objectFit: cur.fit,
            objectPosition: cur.pos,
            backgroundColor: "var(--bg)",
          }}
        />
        {/* Üst katman: sıradaki (fade ile görünür) */}
        <Image
          key={nxt.src + "-top-" + idx}
          src={nxt.src}
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
          className={`left-img layer top ${fading ? "visible" : ""}`}
          style={{ objectFit: nxt.fit, objectPosition: nxt.pos }}
        />
      </div>
    </aside>
  );
}
