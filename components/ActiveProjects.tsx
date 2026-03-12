const active = [
  {
    emoji: "🌐",
    title: "mnp",
    desc: "Kişisel portfolyo ve blog platformum.",
    status: "Geliştiriliyor",
    stack: ["Next.js", "Firebase", "TypeScript", "Firebase Auth", "Vercel"],
  },
  {
    emoji: "🎓",
    title: "OpenUni",
    desc: "Üniversite kaynak ve not yönetimi platformu.",
    status: "Geliştiriliyor",
    stack: ["Next.js", "Firebase"],
  },
  {
    emoji: "🛒",
    title: "Souq",
    desc: "Yerel pazar dijitalleştirme uygulaması.",
    status: "Planlama",
    stack: ["React Native", "Node.js"],
  },
];

export default function ActiveProjects() {
  return (
    <section style={{ marginTop: "60px" }}>
      <h2
        className="mono anim-fade-up"
        style={{
          fontSize: "0.78rem",
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "16px",
        }}
      >
        Aktif Geliştirdiğim Projeler
      </h2>

      {/* Yatay kaydırılabilir konteyner */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          paddingBottom: "12px",
          scrollbarWidth: "none",
        }}
      >
        {active.map((p, i) => (
          <article
            key={p.title}
            className={`glass glass-hover anim-fade-up d${Math.min(i + 1, 6)}`}
            style={{
              minWidth: "260px",
              maxWidth: "280px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            {/* Başlık + status indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>{p.emoji}</span>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "3px",
                  }}
                >
                  <span className="pulse-dot" />
                  <span
                    className="mono"
                    style={{ fontSize: "0.7rem", color: "var(--accent)" }}
                  >
                    {p.status}
                  </span>
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--text)",
                  }}
                >
                  {p.title}
                </h3>
              </div>
            </div>

            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--text-2)",
                lineHeight: 1.6,
              }}
            >
              {p.desc}
            </p>

            {/* Stack etiketleri */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "auto" }}>
              {p.stack.map((s) => (
                <span key={s} className="project-lang-badge">
                  {s}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <style>{`
        /* Scrollbar gizle — Webkit */
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
