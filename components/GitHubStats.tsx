/* Mock GitHub istatistikleri — API bağlantısı hazır olunca gerçek veriyle değiştirilir */

const stats = [
  { value: "42",  label: "Repo" },
  { value: "12",  label: "Yıldız" },
  { value: "8",   label: "Fork" },
  { value: "156", label: "Takipçi" },
  { value: "94",  label: "Takip" },
  { value: "1.2k", label: "Commit" },
];

/* Seeded LCG — server/client aynı değeri üretir, hydration mismatch olmaz */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function mockContrib() {
  const rand = seededRand(42);
  const cells = [];
  for (let i = 0; i < 52 * 7; i++) {
    const r = rand();
    const level = r > 0.85 ? 4 : r > 0.7 ? 3 : r > 0.55 ? 2 : r > 0.4 ? 1 : 0;
    cells.push(level);
  }
  return cells;
}

const CELLS = mockContrib();

export default function GitHubStats() {
  return (
    <section style={{ marginTop: "60px" }} id="github">
      <div
        className="glass anim-fade-up"
        style={{
          padding: "32px",
          borderRadius: "20px",
        }}
      >
        {/* Başlık */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.4rem" }}>⌨️</span>
            <div>
              <h2
                className="mono"
                style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}
              >
                trs-1342
              </h2>
              <p
                className="mono"
                style={{ fontSize: "0.72rem", color: "var(--text-3)" }}
              >
                github.com/trs-1342
              </p>
            </div>
          </div>

          <span
            className="mono"
            style={{
              fontSize: "0.7rem",
              color: "var(--text-3)",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid var(--border)",
            }}
          >
            mock data
          </span>
        </div>

        {/* İstatistikler */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Katkı grafiği */}
        <div>
          <p
            className="mono"
            style={{
              fontSize: "0.7rem",
              color: "var(--text-3)",
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Son 1 yıl katkı
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(52, 1fr)",
              gridTemplateRows: "repeat(7, 1fr)",
              gap: "3px",
              width: "100%",
            }}
          >
            {CELLS.map((level, i) => (
              <div
                key={i}
                className="contrib-cell"
                data-l={level > 0 ? String(level) : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
