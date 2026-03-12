const projects = [
  {
    emoji: "🌐",
    title: "my-portfolio",
    desc: "Kişisel portfolyo ve blog platformu. Firebase Auth, Firestore, Next.js.",
    lang: "TypeScript",
    repo: "https://github.com/trs-1342/my-portfolio",
    live: null,
  },
  {
    emoji: "🎵",
    title: "HSounds",
    desc: "Müzik ve içerik platformu. Özel RSS feed sistemi.",
    lang: "JavaScript",
    repo: "#",
    live: null,
  },
  {
    emoji: "🔒",
    title: "auth-kit",
    desc: "Firebase tabanlı auth altyapısı. Google + Email, session cookie.",
    lang: "TypeScript",
    repo: "#",
    live: null,
  },
  {
    emoji: "📡",
    title: "rss-reader",
    desc: "Terminal tabanlı RSS okuyucu. C ile yazılmış.",
    lang: "C",
    repo: "#",
    live: null,
  },
];

export default function FeaturedProjects() {
  return (
    <div>
      <h2
        className="mono"
        style={{
          fontSize: "0.78rem",
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "16px",
        }}
      >
        Sabitlenmiş Projeler
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "14px",
        }}
      >
        {projects.map((p, i) => (
          <article
            key={p.title}
            className={`glass glass-hover anim-fade-up d${Math.min(i + 1, 6)}`}
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Kapak */}
            <div className="project-cover">
              <span>{p.emoji}</span>
            </div>

            {/* Üst butonlar */}
            <div style={{ display: "flex", gap: "8px" }}>
              {p.live && (
                <a href={p.live} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                  ↗ Canlı
                </a>
              )}
              <a
                href={p.repo}
                className="btn btn-accent"
                style={{ flex: 1, justifyContent: "center" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                ⌥ Repoya Git
              </a>
            </div>

            {/* İçerik */}
            <div>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: "6px",
                  color: "var(--text)",
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-2)",
                  lineHeight: 1.6,
                  marginBottom: "10px",
                }}
              >
                {p.desc}
              </p>
              <span className="project-lang-badge">{p.lang}</span>
            </div>

            {/* Detay butonu */}
            <a
              href="#"
              className="btn btn-ghost btn-full"
              style={{ marginTop: "auto" }}
            >
              Detaylar →
            </a>
          </article>
        ))}
      </div>

      {/* Mobil: tek sütun */}
      <style>{`
        @media (max-width: 600px) {
          #projects .projects-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
