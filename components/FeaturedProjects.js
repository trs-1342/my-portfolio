// components/FeaturedProjects.js
import Link from "next/link";
import { projects } from "@/lib/projects";

export default function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured);

  return (
    <section id="projelerim">
      <h2>🧩 Projelerim (Seçki)</h2>

      <div className="projects-grid">
        {featured.map((p) => (
          <article className="card" key={p.slug}>
            <header>
              <h3 title={p.title}>{p.title}</h3>
            </header>

            <div
              className="card-content"
              style={{ maxHeight: "none", opacity: 1 }}
            >
              <p className="about">{p.description}</p>

              {p.tech?.length > 0 && (
                <div className="meta" aria-label="Teknolojiler">
                  {p.tech.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                {p.demo && p.demo !== "" && (
                  <Link
                    href={p.demo}
                    className="btn"
                    target="_blank"
                    rel="noopener"
                  >
                    Canlı
                  </Link>
                )}
                {p.repo && (
                  <Link
                    href={p.repo}
                    className="btn"
                    target="_blank"
                    rel="noopener"
                  >
                    Repo
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div style={{ marginTop: "12px" }}>
        <Link
          href="/my-projects"
          className="chip"
          style={{ textDecoration: "none" }}
        >
          <span>Daha Fazla Proje</span> ↗︎
        </Link>
      </div>
    </section>
  );
}
