"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MatrixOverlay from "./MatrixOverlay";
import type { LifeEvent } from "@/lib/firestore";

// Matrix overlay'in beklediği Event tipi
interface Event {
  id: number;
  date: string;
  title: string;
  desc: string;
  log: string;
  isCurrent?: boolean;
}

interface Props {
  events: LifeEvent[];
}

/* Olayların sayısına göre pozisyonları dinamik hesapla */
function buildPositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: count === 1 ? 50 : 8 + (84 / Math.max(count - 1, 1)) * i,
    y: i % 2 === 0 ? 40 : 65,
  }));
}

const FLOAT_OFFSETS_POOL = [
  { ax: 0.6, ay: 0.8, px: 0.7, py: 1.1 },
  { ax: 0.9, ay: 0.5, px: 1.3, py: 0.8 },
  { ax: 0.7, ay: 0.9, px: 1.0, py: 0.5 },
  { ax: 0.5, ay: 1.0, px: 0.9, py: 0.6 },
  { ax: 0.8, ay: 0.7, px: 0.6, py: 1.2 },
];

export default function ConstellationTimeline({ events }: Props) {
  const EVENTS: Event[] = [...events]
    .sort((a, b) => a.order - b.order)
    .map((ev, i) => ({
      id:        i,
      date:      ev.date,
      title:     ev.title,
      desc:      ev.desc,
      log:       ev.log,
      isCurrent: ev.isCurrent,
    }));

  const BASE_POSITIONS = buildPositions(EVENTS.length);
  const FLOAT_OFFSETS  = EVENTS.map((_, i) => FLOAT_OFFSETS_POOL[i % FLOAT_OFFSETS_POOL.length]);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const pausedNodes = useRef<Set<number>>(new Set());
  const pauseTime = useRef<Record<number, number>>({});

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeMatrix, setActiveMatrix] = useState<Event | null>(null);

  /* Canvas'a bağlantı çizgilerini çiz */
  const drawLines = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cRect = container.getBoundingClientRect();
    canvas.width = cRect.width;
    canvas.height = cRect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const positions: { x: number; y: number }[] = [];

    nodeRefs.current.forEach((node) => {
      if (!node) return;
      const r = node.getBoundingClientRect();
      positions.push({
        x: r.left - cRect.left + r.width / 2,
        y: r.top - cRect.top + r.height / 2,
      });
    });

    // Noktalar arası çizgiler
    for (let i = 0; i < positions.length - 1; i++) {
      const a = positions[i];
      const b = positions[i + 1];
      if (!a || !b) continue;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);

      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, "rgba(16,185,129,0.25)");
      grad.addColorStop(0.5, "rgba(16,185,129,0.4)");
      grad.addColorStop(1, "rgba(16,185,129,0.25)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
    }
  }, []);

  /* Float animasyonu — requestAnimationFrame döngüsü */
  useEffect(() => {
    const SPEED = 0.0007;
    const AMPLITUDE = 13; // px

    const animate = (ts: number) => {
      timeRef.current = ts;

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        const base = BASE_POSITIONS[i];
        const off = FLOAT_OFFSETS[i];

        let t = ts * SPEED;

        // Pause: zaman dondurulmuş
        if (pausedNodes.current.has(i)) {
          t = (pauseTime.current[i] ?? ts) * SPEED;
        }

        const dx = Math.sin(t * off.ax + off.px) * AMPLITUDE;
        const dy = Math.cos(t * off.ay + off.py) * AMPLITUDE;

        node.style.left = `calc(${base.x}% + ${dx}px)`;
        node.style.top  = `calc(${base.y}% + ${dy}px)`;
      });

      drawLines();
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawLines]);

  const handleHoverEnter = (id: number) => {
    pausedNodes.current.add(id);
    pauseTime.current[id] = timeRef.current;
    setHoveredId(id);
  };

  const handleHoverLeave = (id: number) => {
    pausedNodes.current.delete(id);
    delete pauseTime.current[id];
    setHoveredId(null);
  };

  return (
    <section style={{ marginTop: "0", paddingBottom: "80px" }}>
      {/* Başlık */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <p
          className="mono anim-fade-up"
          style={{
            fontSize: "0.72rem",
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: "10px",
          }}
        >
          — Yıldız Haritası —
        </p>
        <h2
          className="anim-fade-up d2"
          style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}
        >
          Hayatı Değiştiren Günler
        </h2>
      </div>

      {/* Constellation Container */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "360px",
          borderRadius: "20px",
          overflow: "visible",
        }}
      >
        {/* Canvas — bağlantı çizgileri */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Neon orbs */}
        {EVENTS.map((ev, i) => (
          <div
            key={ev.id}
            ref={(el) => { nodeRefs.current[i] = el; }}
            style={{
              position: "absolute",
              zIndex: 10,
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
            }}
            onMouseEnter={() => handleHoverEnter(i)}
            onMouseLeave={() => handleHoverLeave(i)}
            onClick={() => setActiveMatrix(ev)}
          >
            {/* Orb */}
            <div
              style={{
                width: ev.isCurrent ? 22 : 16,
                height: ev.isCurrent ? 22 : 16,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: `0 0 ${ev.isCurrent ? 24 : 14}px var(--accent), 0 0 ${ev.isCurrent ? 40 : 24}px var(--accent-glow)`,
                animation: ev.isCurrent ? "statusPulse 2s ease-in-out infinite" : "none",
                transition: "transform 0.2s var(--spring)",
                transform: hoveredId === i ? "scale(1.5)" : "scale(1)",
              }}
            />

            {/* Hover kart + SVG bağlantı çizgisi */}
            {hoveredId === i && (() => {
              const orbR = ev.isCurrent ? 11 : 8;
              const LINE_H = 28;
              const CARD_W = 330;
              return (
                <>
                  {/* SVG: orb merkezinden kart altına esnek çizgi */}
                  <svg
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      bottom: `${orbR}px`,
                      width: CARD_W,
                      height: LINE_H,
                      overflow: "visible",
                      pointerEvents: "none",
                      zIndex: 18,
                    }}
                    viewBox={`0 0 ${CARD_W} ${LINE_H}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id={`lg-${i}`} x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <line
                      x1={CARD_W / 2} y1={LINE_H}
                      x2={CARD_W / 2} y2={0}
                      stroke={`url(#lg-${i})`}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx={CARD_W / 2} cy={LINE_H}
                      r="3" fill="#10B981" opacity="0.6"
                    />
                  </svg>

                  {/* Kart — SVG'nin hemen üstünde */}
                  <div
                    className="glass"
                    style={{
                      position: "absolute",
                      bottom: `${orbR + LINE_H}px`,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: `${CARD_W}px`,
                      padding: "14px 16px",
                      zIndex: 20,
                      animation: "fadeInUp 0.25s var(--ease-out) both",
                      pointerEvents: "none",
                    }}
                  >
                    <p className="mono" style={{ fontSize: "0.68rem", color: "var(--accent)", marginBottom: "4px", letterSpacing: "0.04em" }}>
                      {ev.date}
                    </p>
                    <h3 style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", marginBottom: "6px" }}>
                      {ev.title}
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-2)", lineHeight: 1.5 }}>
                      {ev.desc}
                    </p>
                    <p className="mono" style={{ fontSize: "0.65rem", color: "var(--text-3)", marginTop: "8px" }}>
                      Detay için tıkla →
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Matrix terminal overlay */}
      {activeMatrix && (
        <MatrixOverlay
          event={activeMatrix}
          onClose={() => setActiveMatrix(null)}
        />
      )}
    </section>
  );
}
