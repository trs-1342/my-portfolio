import Nav from "@/components/Nav";

// app/about/page.js
export const metadata = { title: "Hakkımda — Halil Hattab" };

const skills = [
  { name: "JavaScript", level: 85, icon: "fa-brands fa-js" },
  { name: "TypeScript", level: 70, icon: "fa-solid fa-code" },
  { name: "Node.js", level: 80, icon: "fa-brands fa-node-js" },
  { name: "React / Next.js", level: 78, icon: "fa-brands fa-react" },
  { name: "SQL", level: 65, icon: "fa-solid fa-database" },
  { name: "Linux", level: 60, icon: "fa-brands fa-linux" },
];

const donuts = [
  { label: "Frontend", pct: 78 },
  { label: "Backend", pct: 82 },
  { label: "DB", pct: 65 },
  { label: "Security", pct: 55 },
];

const tools = [
  "Git",
  "GitHub",
  "Tailwind/CSS",
  "Postman",
  "Docker (temel)",
  "Prisma/Sequelize",
  "Express",
  "MongoDB",
  "PostgreSQL",
];

export default function About() {
  return (
    <main className="page about-page">
      <Nav />
      {/* HERO */}
      <section className="about-hero">
        <h1>Hakkımda</h1>
        <p>
          Selam, ben <strong>Halil Hattab</strong>. ŞBBKMTAL Bilişim mezunuyum;
          İstanbul Gelişim Üniversitesi’nde 1. sınıf{" "}
          <strong>Yazılım Mühendisliği</strong> öğrencisiyim.
        </p>
        <p>
          Amacım; hızla değişen teknoloji çağında{" "}
          <strong>ahlaki değerleri koruyarak</strong> üretmek ve insanların
          hayatına dokunan projeler geliştirmek.
        </p>
        <blockquote>I defend the moral concept in software.</blockquote>
      </section>

      {/* KISA ÖZET DONUTLAR */}
      <section className="about-stats" aria-label="Uzmanlık Özeti">
        {donuts.map((d) => (
          <div className="donut" style={{ ["--p"]: `${d.pct}%` }} key={d.label}>
            <div className="donut-ring" />
            <div className="donut-center">
              <b>{d.pct}%</b>
              <span>{d.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* DİLLER & SEVİYELER (ikon + bar) */}
      <section className="about-skills">
        <h2>🧠 Diller & Seviyeler</h2>
        <div className="skill-list">
          {skills.map((s) => (
            <div
              className="skill-row"
              key={s.name}
              style={{ ["--val"]: `${s.level}%` }}
            >
              <div className="skill-label">
                <i className={s.icon} aria-hidden="true" />
                <span>{s.name}</span>
              </div>
              <div
                className="skill-bar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={s.level}
                role="meter"
              >
                <span className="skill-fill" />
                <b className="skill-pct">{s.level}%</b>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ARAÇLAR / TEKNOLOJİLER */}
      <section className="about-tools">
        <h2>🧰 Araçlar & Teknolojiler</h2>
        <div className="tool-chips">
          {tools.map((t) => (
            <span className="chip" key={t}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* EĞİTİM / ZAMAN ÇİZELGESİ */}
      <section className="about-timeline">
        <h2>📅 Eğitim</h2>
        <ul className="timeline">
          <li>
            <div className="tl-dot" />
            <div className="tl-body">
              <strong>İstanbul Gelişim Üniversitesi</strong> — Yazılım
              Mühendisliği (1. Sınıf)
              <small>2025 — …</small>
            </div>
          </li>
          <li>
            <div className="tl-dot" />
            <div className="tl-body">
              <strong>ŞBBKMTAL</strong> — Bilişim Alanı
              <small>Mezun</small>
            </div>
          </li>
        </ul>
      </section>
    </main>
  );
}
