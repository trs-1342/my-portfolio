const projects = [
  {
    emoji: "🌐",
    title: "mnp",
    desc: "Kişisel portfolyo ve blog platformum.",
    lang: "TypeScript | NextJS | Firebase Auth | Firestore | Vercel",
    repo: "https://github.com/trs-1342/mnp",
    live: "https://hllhttb.vercel.app",
  },
  {
    emoji: "🎨",
    title: "budu",
    desc: "İçerik üreticilerinin üyerine üyelik karşılığında kurs satabildikleri platform.",
    lang: "TypeScript | JavaScript | CSS",
    repo: "https://github.com/trs-1342/budu",
    live: "https://bushradukhan.com/",
  },
  {
    emoji: "🎓",
    title: "OpenUni",
    desc: "İstanbul Gelişim Üniversitesi öğrencileri için kanal tabanlı topluluk platformu.",
    lang: "NextJS | Firebase Firestore & Authentication & Storage | Tailwind CSS | Vercel",
    repo: "https://github.com/trs-1342/openuni",
    live: "https://openigu.vercel.app",
  },
  {
    emoji: "📃",
    title: "Souq",
    desc: "Bilinen ilan uygulamalarının alternatifi.",
    lang: "React Native | TypeScript | Expo & EAS & APK",
    repo: "https://github.com/trs-1342/souq",
    live: null,
  },
  {
    emoji: "⚙️",
    title: "c-dersleri",
    desc: "Üniversiteden alınan eğitim ile öğrencilerin topluluk oluşturup C dili ile geliştirdikleri repo.",
    lang: "C",
    repo: "https://github.com/IGU-Software-Community/c-dersleri",
    live: "https://cdws.vercel.app/",
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
        className="featured-grid"
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

    </div>
  );
}
