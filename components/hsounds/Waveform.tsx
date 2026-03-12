"use client";

import { useMemo } from "react";

const BAR_COUNT = 48;
const MAX_H = 40;
const MIN_H = 6;

/* Seeded LCG — client/server tutarlı */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export default function Waveform() {
  const bars = useMemo(() => {
    const rand = seeded(7);
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const h = MIN_H + rand() * (MAX_H - MIN_H);
      const dur = 0.7 + rand() * 0.9;
      const delay = rand() * 0.8;
      return { h, dur, delay, i };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "3px",
        height: `${MAX_H + 8}px`,
        opacity: 0.55,
      }}
    >
      {bars.map(({ h, dur, delay, i }) => (
        <div
          key={i}
          style={{
            width: "4px",
            height: `${h}px`,
            borderRadius: "999px",
            background: `linear-gradient(to top, var(--accent), #8B5CF6)`,
            animation: `waveBar ${dur}s ease-in-out ${delay}s infinite alternate`,
            flexShrink: 0,
          }}
        />
      ))}

      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.25); opacity: 0.4; }
          to   { transform: scaleY(1);    opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
