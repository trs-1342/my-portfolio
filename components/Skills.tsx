const skills = [
  { icon: "🐧", name: "Linux",      desc: "Arch, Debian" },
  { icon: "⚙️", name: "C",          desc: "System" },
  { icon: "🟨", name: "JavaScript", desc: "ES2024" },
  { icon: "🔷", name: "TypeScript", desc: "4.x" },
  { icon: "⚛️", name: "React",      desc: "Next.js" },
  { icon: "🟩", name: "Node.js",    desc: "Runtime" },
  { icon: "🐳", name: "Docker",     desc: "Temel" },
  { icon: "🗄️", name: "SQL",        desc: "Postgres" },
  { icon: "🔀", name: "Git",        desc: "VCS" },
];

export default function Skills() {
  return (
    <div>
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
        Yetenekler
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {skills.map((s, i) => (
          <div
            key={s.name}
            className={`glass glass-hover anim-fade-up d${Math.min(i + 1, 8)}`}
            style={{
              padding: "16px 10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              cursor: "default",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{s.icon}</span>
            <span className="skill-name">{s.name}</span>
            <span
              style={{
                fontSize: "0.68rem",
                color: "var(--text-3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {s.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
