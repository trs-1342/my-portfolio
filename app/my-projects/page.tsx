import { readFileSync } from "fs";
import { join } from "path";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Terminal from "@/components/projects/Terminal";
import ProjectCard from "@/components/projects/ProjectCard";

export const metadata = {
  title: "Projeler — trs",
  description: "trs'nin açık kaynak ve kişisel projeleri.",
};

interface Project {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  live_url: string | null;
  repo_url: string;
  is_active: boolean;
  tags: string[];
}

function getProjects(): Project[] {
  const raw = readFileSync(join(process.cwd(), "data", "projects.json"), "utf-8");
  return JSON.parse(raw);
}

export default function ProjectsPage() {
  const projects = getProjects();
  const activeProjects = projects.filter((p) => p.is_active);
  const allProjects = projects;

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px" }}>
        {/* Sayfa başlığı */}
        <header style={{ marginBottom: "40px" }}>
          <p
            className="mono anim-fade-up d1"
            style={{
              fontSize: "0.72rem",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "10px",
            }}
          >
            /my-projects
          </p>
          <h1
            className="anim-fade-up d2"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text)",
              marginBottom: "12px",
            }}
          >
            Projelerim
          </h1>
          <p
            className="anim-fade-up d3"
            style={{ color: "var(--text-2)", fontSize: "0.96rem", maxWidth: "540px", lineHeight: 1.7 }}
          >
            Açık kaynak çalışmalarım, kişisel projelerim ve aktif geliştirmeler.
            Terminali kullanarak projeleri keşfedebilirsin.
          </p>
        </header>

        {/* Aktif Geliştirilen Projeler */}
        {activeProjects.length > 0 && (
          <section style={{ marginBottom: "60px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <span className="pulse-dot" />
              <h2
                className="mono"
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Aktif Geliştirilen Projeler
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              {activeProjects.map((p, i) => (
                <div key={p.id} className={`anim-fade-up d${Math.min(i + 1, 6)}`}>
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tüm Projeler */}
        <section>
          <h2
            className="mono"
            style={{
              fontSize: "0.78rem",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "20px",
            }}
          >
            Tüm Projeler
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            {allProjects.map((p, i) => (
              <div key={p.id} className={`anim-fade-up d${Math.min(i + 1, 8)}`}>
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </section>

        {/* İnteraktif Terminal — footer'ın hemen üstünde */}
        <div className="anim-fade-up" style={{ marginTop: "60px" }}>
          <h2
            className="mono"
            style={{
              fontSize: "0.78rem",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "20px",
            }}
          >
            Terminal
          </h2>
          <Terminal projects={projects} />
        </div>

        <Footer />
      </div>

      {/* Mobil: tek sütun */}
      <style>{`
        @media (max-width: 640px) {
          section div[style*="repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
