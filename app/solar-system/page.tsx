'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Astronomy from 'astronomy-engine';

type PlanetKey =
  | 'Mercury'
  | 'Venus'
  | 'Earth'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune';

type PlanetMeta = {
  key: PlanetKey;
  label: string;
  color: string;
  size: number;
  orbitAU: number;
  glow: string;
  description: string;
};

type PlanetState = PlanetMeta & {
  x: number;
  y: number;
  z: number;
  distanceFromSunAU: number;
  angleRad: number;
  speedHint: string;
};

const PLANETS: PlanetMeta[] = [
  {
    key: 'Mercury',
    label: 'Merkür',
    color: '#a8b0bb',
    size: 6,
    orbitAU: 0.39,
    glow: 'rgba(168,176,187,.45)',
    description: 'Güneş\'e en yakın gezegen.',
  },
  {
    key: 'Venus',
    label: 'Venüs',
    color: '#d9b38c',
    size: 8,
    orbitAU: 0.72,
    glow: 'rgba(217,179,140,.42)',
    description: 'Yoğun atmosferiyle parlak görünür.',
  },
  {
    key: 'Earth',
    label: 'Dünya',
    color: '#61b7ff',
    size: 8.5,
    orbitAU: 1,
    glow: 'rgba(97,183,255,.45)',
    description: 'Yaşam barındırdığı bilinen tek gezegen.',
  },
  {
    key: 'Mars',
    label: 'Mars',
    color: '#cf6d4f',
    size: 7,
    orbitAU: 1.52,
    glow: 'rgba(207,109,79,.4)',
    description: 'Kızıl yüzeyiyle tanınır.',
  },
  {
    key: 'Jupiter',
    label: 'Jüpiter',
    color: '#d7b18a',
    size: 14,
    orbitAU: 5.2,
    glow: 'rgba(215,177,138,.35)',
    description: 'Güneş Sistemi\'nin en büyük gezegeni.',
  },
  {
    key: 'Saturn',
    label: 'Satürn',
    color: '#dbc58d',
    size: 12,
    orbitAU: 9.58,
    glow: 'rgba(219,197,141,.3)',
    description: 'Halkalarıyla ayırt edilir.',
  },
  {
    key: 'Uranus',
    label: 'Uranüs',
    color: '#8ed9e6',
    size: 10,
    orbitAU: 19.22,
    glow: 'rgba(142,217,230,.28)',
    description: 'Yan yatmış ekseniyle dikkat çeker.',
  },
  {
    key: 'Neptune',
    label: 'Neptün',
    color: '#5f87ff',
    size: 10,
    orbitAU: 30.05,
    glow: 'rgba(95,135,255,.28)',
    description: 'Derin mavi tonu ve uzaklığıyla öne çıkar.',
  },
];

function scaleOrbit(au: number, maxRadius: number) {
  const normalized = Math.sqrt(au / 30.05);
  return 48 + normalized * (maxRadius - 48);
}

function formatAU(n: number) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(n);
}

function getPlanetStates(date: Date): PlanetState[] {
  return PLANETS.map((planet) => {
    const vec = Astronomy.HelioVector(planet.key, date);
    const x = vec.x;
    const y = vec.y;
    const z = vec.z;
    const distanceFromSunAU = Math.sqrt(x * x + y * y + z * z);
    const angleRad = Math.atan2(y, x);

    const speedHint =
      planet.orbitAU < 1
        ? 'Hızlı iç yörünge'
        : planet.orbitAU < 2
          ? 'Karasal dış yörünge'
          : planet.orbitAU < 10
            ? 'Gaz devi yörüngesi'
            : 'Uzak dış yörünge';

    return {
      ...planet,
      x,
      y,
      z,
      distanceFromSunAU,
      angleRad,
      speedHint,
    };
  });
}

function OrbitScene({
  planets,
  showInfo,
  setShowInfo,
}: {
  planets: PlanetState[];
  showInfo: boolean;
  setShowInfo: (value: boolean) => void;
}) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(820);

  useEffect(() => {
    const update = () => {
      const width = sceneRef.current?.clientWidth ?? 820;
      setSize(width);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const center = size / 2;
  const maxRadius = size * 0.46;

  return (
    <div className="orbit-panel">
      <div className="scene-header compact-header">
        <button
          type="button"
          aria-label="Bilgilendirme"
          className="info-icon"
          onClick={() => setShowInfo(!showInfo)}
        >
          i
        </button>
      </div>

      {showInfo && (
        <div className="info-popover">
          <p>
            Gezegen konumları anlık heliosentrik veriye göre hesaplanır. Görsel ölçüler ekrana sığması için
            sıkıştırılmıştır; yani uzaklık oranları bire bir değildir ama açısal yerleşim gerçek veriye dayanır.
          </p>
        </div>
      )}

      <div className="scene-shell" ref={sceneRef}>
        <div className="deep-space" />

        <div
          className="sun-core"
          style={{
            left: `${center.toFixed(3)}px`,
            top: `${center.toFixed(3)}px`,
          }}
        >
          <div className="sun-glow" />
          <div className="sun-surface" />
        </div>

        {PLANETS.map((planet) => {
          const r = scaleOrbit(planet.orbitAU, maxRadius);

          return (
            <div
              key={`orbit-${planet.key}`}
              className="orbit-ring"
              style={{
                width: `${(r * 2).toFixed(3)}px`,
                height: `${(r * 2).toFixed(3)}px`,
                left: `${(center - r).toFixed(3)}px`,
                top: `${(center - r).toFixed(3)}px`,
              }}
            />
          );
        })}

        {planets.map((planet) => {
          const r = scaleOrbit(planet.orbitAU, maxRadius);
          const px = center + Math.cos(planet.angleRad) * r;
          const py = center + Math.sin(planet.angleRad) * r;

          return (
            <div
              key={planet.key}
              className="planet-wrap"
              style={{
                left: `${px.toFixed(3)}px`,
                top: `${py.toFixed(3)}px`,
                ['--planet-color' as string]: planet.color,
                ['--planet-glow' as string]: planet.glow,
                ['--planet-size' as string]: `${planet.size}px`,
              }}
            >
              {planet.key === 'Saturn' && <div className="saturn-ring" />}
              <div className="planet" />
              <div className="planet-tooltip">
                <strong>{planet.label}</strong>
                <span>{planet.description}</span>
                <small>Güneş uzaklığı: {formatAU(planet.distanceFromSunAU)} AU</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlanetTable({ planets }: { planets: PlanetState[] }) {
  return (
    <div className="glass-card table-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Veri Özeti</p>
          <h2>Gezegen detayları</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Gezegen</th>
              <th>Yörünge</th>
              <th>Güneş Uzaklığı</th>
              <th>X (AU)</th>
              <th>Y (AU)</th>
              <th>Z (AU)</th>
            </tr>
          </thead>
          <tbody>
            {planets.map((planet) => (
              <tr key={`row-${planet.key}`}>
                <td>
                  <div className="planet-name-cell">
                    <span
                      className="legend-dot"
                      style={{ background: planet.color, boxShadow: `0 0 18px ${planet.glow}` }}
                    />
                    {planet.label}
                  </div>
                </td>
                <td>{planet.speedHint}</td>
                <td>{formatAU(planet.distanceFromSunAU)} AU</td>
                <td>{formatAU(planet.x)}</td>
                <td>{formatAU(planet.y)}</td>
                <td>{formatAU(planet.z)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanetCards({ planets }: { planets: PlanetState[] }) {
  return (
    <div className="cards-grid">
      {planets.map((planet) => (
        <article key={`card-${planet.key}`} className="glass-card planet-card">
          <div className="planet-card-top">
            <div>
              <p className="eyebrow">{planet.speedHint}</p>
              <h3>{planet.label}</h3>
            </div>
            <span
              className="planet-chip"
              style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${planet.color})` }}
            />
          </div>

          <p className="card-text">{planet.description}</p>

          <div className="metric-list">
            <div>
              <span>Yörünge yarıçapı</span>
              <strong>{formatAU(planet.orbitAU)} AU</strong>
            </div>
            <div>
              <span>Anlık uzaklık</span>
              <strong>{formatAU(planet.distanceFromSunAU)} AU</strong>
            </div>
            <div>
              <span>Heliosentrik açı</span>
              <strong>{((planet.angleRad * 180) / Math.PI).toFixed(1)}°</strong>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function LoadingScene() {
  return (
    <div className="orbit-panel loading-panel">
      <div className="scene-header compact-header">
        <div className="info-icon info-placeholder">i</div>
      </div>
      <div className="scene-shell skeleton-shell">
        <div className="deep-space" />
        <div className="skeleton-orbit orbit-1" />
        <div className="skeleton-orbit orbit-2" />
        <div className="skeleton-orbit orbit-3" />
        <div className="skeleton-orbit orbit-4" />
        <div className="sun-skeleton" />
      </div>
    </div>
  );
}

export default function SolarSystemPage() {
  const [mounted, setMounted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const initial = new Date();
    setMounted(true);
    setNow(initial);

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  const planets = useMemo(() => {
    if (!now) return [];
    return getPlanetStates(now);
  }, [now]);

  return (
    <main className="solar-page">
      <div className="background-layer background-layer-1" />
      <div className="background-layer background-layer-2" />

      <section className="hero-layout">
        {!mounted || !now ? (
          <LoadingScene />
        ) : (
          <OrbitScene planets={planets} showInfo={showInfo} setShowInfo={setShowInfo} />
        )}
      </section>

      {mounted && now && planets.length > 0 && (
        <section className="content-stack">
          <PlanetCards planets={planets} />
          <PlanetTable planets={planets} />
        </section>
      )}

      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }

        .solar-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 20% 20%, rgba(69, 92, 179, 0.12), transparent 24%),
            radial-gradient(circle at 80% 10%, rgba(255, 184, 77, 0.14), transparent 20%),
            radial-gradient(circle at 50% 60%, rgba(0, 140, 255, 0.08), transparent 28%),
            linear-gradient(180deg, #04070d 0%, #07111f 42%, #050810 100%);
          color: #e7edf7;
          padding: 32px 20px 80px;
        }

        .background-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .background-layer-1 {
          background-image:
            radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,.8), transparent 60%),
            radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,.55), transparent 60%),
            radial-gradient(1.5px 1.5px at 70% 40%, rgba(255,255,255,.6), transparent 60%),
            radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,.45), transparent 60%),
            radial-gradient(1px 1px at 55% 14%, rgba(255,255,255,.45), transparent 60%),
            radial-gradient(1px 1px at 82% 24%, rgba(255,255,255,.35), transparent 60%);
          opacity: 0.65;
        }

        .background-layer-2 {
          background:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(circle at center, black 35%, transparent 95%);
          opacity: 0.22;
        }

        .hero-layout,
        .content-stack {
          position: relative;
          z-index: 1;
          width: min(1280px, 100%);
          margin: 0 auto;
        }

        .content-stack {
          margin-top: 26px;
          display: grid;
          gap: 22px;
        }

        .orbit-panel,
        .glass-card {
          border: 1px solid rgba(255,255,255,.09);
          background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
          box-shadow:
            0 12px 40px rgba(0,0,0,.34),
            inset 0 1px 0 rgba(255,255,255,.06);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .orbit-panel {
          border-radius: 28px;
          padding: 24px;
        }

        .loading-panel {
          min-height: 300px;
        }

        .scene-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .compact-header {
          align-items: center;
          margin-bottom: 14px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.06);
          color: #eef4ff;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 10px 30px rgba(0,0,0,.24),
            inset 0 1px 0 rgba(255,255,255,.08);
          transition: .2s ease;
        }

        .info-placeholder {
          opacity: .45;
          cursor: default;
        }

        .info-icon:hover {
          background: rgba(255,255,255,.1);
          transform: translateY(-1px);
        }

        .info-popover {
          margin-bottom: 16px;
          max-width: 680px;
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(8, 14, 26, .72);
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 12px 30px rgba(0,0,0,.28);
        }

        .info-popover p {
          margin: 0;
          color: rgba(231,237,247,.8);
          line-height: 1.65;
          font-size: 14px;
        }

        .section-head h2,
        .planet-card h3 {
          margin: 0;
          letter-spacing: -0.03em;
        }

        .eyebrow {
          margin: 0 0 10px;
          text-transform: uppercase;
          letter-spacing: .18em;
          font-size: 11px;
          color: rgba(255,255,255,.56);
        }

        .scene-shell {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          min-height: 360px;
          border-radius: 28px;
          overflow: hidden;
          background:
            radial-gradient(circle at center, rgba(255,255,255,.03), transparent 42%),
            radial-gradient(circle at center, rgba(255,172,64,.08), transparent 16%),
            linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01));
          border: 1px solid rgba(255,255,255,.06);
        }

        .skeleton-shell {
          position: relative;
        }

        .deep-space {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 50%, rgba(255, 191, 71, .08), transparent 10%),
            radial-gradient(circle at 50% 50%, rgba(103, 157, 255, .05), transparent 28%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,.05), transparent 42%);
        }

        .sun-core {
          position: absolute;
          width: 0;
          height: 0;
          transform: translate(-50%, -50%);
        }

        .sun-glow,
        .sun-surface,
        .sun-skeleton {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 999px;
        }

        .sun-glow {
          width: 110px;
          height: 110px;
          background: radial-gradient(circle, rgba(255,196,92,.5), rgba(255,144,0,.14), transparent 70%);
          filter: blur(4px);
          animation: pulse 4s ease-in-out infinite;
        }

        .sun-surface,
        .sun-skeleton {
          width: 34px;
          height: 34px;
          background:
            radial-gradient(circle at 30% 30%, #fff4c4, #ffca63 38%, #ff9a1f 70%, #c46000 100%);
          box-shadow:
            0 0 30px rgba(255, 180, 54, .65),
            0 0 80px rgba(255, 148, 0, .28);
        }

        .sun-skeleton {
          left: 50%;
          top: 50%;
          animation: pulse 4s ease-in-out infinite;
        }

        .skeleton-orbit {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.08);
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .orbit-1 { width: 22%; height: 22%; }
        .orbit-2 { width: 38%; height: 38%; }
        .orbit-3 { width: 58%; height: 58%; }
        .orbit-4 { width: 82%; height: 82%; }

        .orbit-ring {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: inset 0 0 40px rgba(255,255,255,.02);
        }

        .planet-wrap {
          position: absolute;
          transform: translate(-50%, -50%);
          z-index: 3;
        }

        .planet {
          position: relative;
          width: var(--planet-size);
          height: var(--planet-size);
          border-radius: 999px;
          background:
            radial-gradient(circle at 30% 25%, rgba(255,255,255,.88), var(--planet-color) 42%, rgba(0,0,0,.24) 100%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,.12),
            0 0 18px var(--planet-glow),
            0 0 32px var(--planet-glow);
        }

        .saturn-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: calc(var(--planet-size) * 2.4);
          height: calc(var(--planet-size) * 0.9);
          transform: translate(-50%, -50%) rotate(-25deg);
          border-radius: 999px;
          border: 1px solid rgba(227, 211, 164, .6);
          box-shadow: 0 0 18px rgba(219,197,141,.22);
        }

        .planet-tooltip {
          position: absolute;
          left: 16px;
          top: 16px;
          min-width: 160px;
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
          transition: .24s ease;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(8, 14, 26, .88);
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 14px 30px rgba(0,0,0,.3);
        }

        .planet-tooltip strong,
        .planet-tooltip span,
        .planet-tooltip small {
          display: block;
        }

        .planet-tooltip span {
          margin: 6px 0;
          color: rgba(255,255,255,.72);
          font-size: 12px;
          line-height: 1.45;
        }

        .planet-tooltip small {
          color: rgba(255,255,255,.58);
          font-size: 11px;
        }

        .planet-wrap:hover .planet-tooltip {
          opacity: 1;
          transform: translateY(0);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .planet-card,
        .table-card {
          border-radius: 24px;
          padding: 18px;
        }

        .planet-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .planet-chip {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          box-shadow: 0 0 18px rgba(255,255,255,.18);
        }

        .card-text {
          margin: 0 0 16px;
          color: rgba(255,255,255,.74);
          line-height: 1.6;
          min-height: 48px;
        }

        .metric-list {
          display: grid;
          gap: 10px;
        }

        .metric-list div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .metric-list span {
          color: rgba(255,255,255,.56);
          font-size: 13px;
        }

        .metric-list strong {
          font-size: 13px;
        }

        .section-head {
          margin-bottom: 16px;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 780px;
        }

        th,
        td {
          text-align: left;
          padding: 14px 12px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          font-size: 14px;
        }

        th {
          color: rgba(255,255,255,.55);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .planet-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          display: inline-block;
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: .8; }
          50% { transform: translate(-50%, -50%) scale(1.06); opacity: 1; }
        }

        @media (max-width: 1100px) {
          .cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 680px) {
          .solar-page {
            padding-inline: 14px;
            padding-top: 16px;
          }

          .orbit-panel,
          .planet-card,
          .table-card {
            border-radius: 20px;
            padding: 16px;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }

          .scene-shell {
            min-height: 320px;
          }
        }
      `}</style>
    </main>
  );
}
