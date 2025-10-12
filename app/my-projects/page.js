// app/my-projects/page.js
import Link from "next/link";
import { projects } from "@/lib/projects";
import ThemeToggle from "@/components/ThemeToggle";
import Nav from "@/components/Nav";

export const metadata = { title: "Tüm Projeler — Halil Hattab" };

export default function MyProjects() {
  const items = projects; // tamamını göster

  return (
    <main className="page">
      <ThemeToggle />
      <Nav />
      <h1 className="page-title">Tüm Projeler</h1>

      <div className="projects-grid">
        {items.map((p) => (
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
                <div className="meta">
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
    </main>
  );
}
