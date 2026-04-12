import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProjectsServer } from "@/lib/site-server";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ── Static params ── */
export async function generateStaticParams() {
  const projects = await getProjectsServer();
  return projects.map((p) => ({ slug: p.slug || toSlug(p.title) }));
}

/* ── Metadata ── */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getProjectsServer();
  const project = projects.find((p) => (p.slug || toSlug(p.title)) === slug);
  if (!project) return { title: "Proje bulunamadı — trs" };

  const ogUrl = `${BASE_URL}/api/og?` + new URLSearchParams({
    title: project.title,
    desc:  project.desc,
    type:  "project",
    meta:  project.lang,
  }).toString();

  return {
    title:       `${project.title} — trs`,
    description: project.desc,
    openGraph: {
      title: `${project.title} — trs`, description: project.desc,
      url: `${BASE_URL}/my-projects/${slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" as const, title: `${project.title} — trs`, images: [ogUrl] },
  };
}

/* ── TAG renk haritası ── */
const TAG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  "Next.js":  "#ffffff",
  Firebase:   "#ffca28",
  CSS:        "#264de4",
  Canvas:     "#10B981",
  "React Native": "#61dafb",
  "Node.js":  "#68a063",
  MongoDB:    "#4db33d",
  C:          "#a8b9cc",
  Linux:      "#fcc624",
  ncurses:    "#888",
};
function tagColor(tag: string) { return TAG_COLORS[tag] ?? "#10B981"; }

/* ── Sayfa ── */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getProjectsServer();
  const project = projects.find((p) => (p.slug || toSlug(p.title)) === slug);
  if (!project) notFound();

  const highlights = project.highlights ?? [];
  const longDesc   = project.longDesc   || project.desc;

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px", paddingBottom: "80px" }}>

        <Link href="/my-projects" className="mono" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-3)", textDecoration: "none", marginBottom: "40px", transition: "color 0.15s" }}>
          ← my-projects
        </Link>

        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          {/* Başlık bölümü */}
          <header style={{ marginBottom: "48px" }}>
            <div className="anim-fade-up" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                /my-projects
              </span>
              <span style={{ color: "var(--border)" }}>·</span>
              {project.active ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                  <span className="pulse-dot" /> aktif
                </span>
              ) : (
                <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>bakımda değil</span>
              )}
            </div>

            {/* Kapak görseli */}
            {project.imageUrl && (
              <div className="glass anim-fade-up" style={{ borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", position: "relative", marginBottom: "28px" }}>
                <Image src={project.imageUrl} alt={project.title} fill style={{ objectFit: "cover" }} />
              </div>
            )}

            <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "18px" }}>
              {project.title}
            </h1>

            <div className="anim-fade-up d3" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
              {(project.stack ?? []).map((tag) => (
                <span key={tag} className="mono" style={{ padding: "5px 12px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600, border: `1px solid ${tagColor(tag)}40`, background: `${tagColor(tag)}12`, color: tagColor(tag) }}>
                  {tag}
                </span>
              ))}
            </div>

            <p className="anim-fade-up d4" style={{ fontSize: "1.05rem", color: "var(--text-2)", lineHeight: 1.7, borderLeft: "3px solid var(--accent)", paddingLeft: "16px" }}>
              {project.desc}
            </p>
          </header>

          <div className="anim-fade-up d4" style={{ height: "1px", background: "linear-gradient(90deg, var(--accent) 0%, var(--border) 60%, transparent 100%)", marginBottom: "48px" }} />

          <div className="anim-fade-up d5" style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "24px", alignItems: "start" }}>
            {/* Sol: uzun açıklama */}
            <div className="glass" style={{ borderRadius: "20px", padding: "clamp(20px, 4vw, 36px)" }}>
              <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Hakkında</p>
              <p style={{ fontSize: "0.95rem", color: "var(--text-2)", lineHeight: 1.85 }}>{longDesc}</p>
            </div>

            {/* Sağ: öne çıkanlar + linkler */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {highlights.length > 0 && (
                <div className="glass" style={{ borderRadius: "16px", padding: "20px" }}>
                  <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>Öne Çıkanlar</p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {highlights.map((h, i) => (
                      <li key={i} style={{ display: "flex", gap: "8px", fontSize: "0.8rem", color: "var(--text-2)", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--accent)", flexShrink: 0 }}>›</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {project.live && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{ justifyContent: "center", fontSize: "0.85rem", padding: "11px" }}>
                    ↗ Canlı Demo
                  </a>
                )}
                <a href={project.repo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ justifyContent: "center", fontSize: "0.85rem", padding: "11px" }}>
                  ⌨️ Kaynak Kod
                </a>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px", paddingTop: "24px", borderTop: "1px solid var(--border)", flexWrap: "wrap", gap: "12px" }}>
            <Link href="/my-projects" className="btn btn-ghost" style={{ fontSize: "0.82rem" }}>
              ← Tüm Projeler
            </Link>
          </div>

        </div>

        <Footer />
      </div>

      <style>{`
        @media (max-width: 640px) {
          div[style*="240px"] { grid-template-columns: 1fr !important; }
        }
        a[href="/my-projects"]:not(.btn):hover { color: var(--accent); }
      `}</style>
    </>
  );
}
