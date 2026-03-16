import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/firestore";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ProjectCard({ project }: { project: Project }) {
  const slug = project.slug || toSlug(project.title);
  const { emoji, imageUrl, title, desc, live, repo, active, stack } = project;

  return (
    <article
      className="glass glass-hover"
      style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "16px" }}
    >
      {/* Kapak alanı */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          background: "linear-gradient(135deg, var(--bg-2) 0%, var(--bg) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.8rem",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill style={{ objectFit: "cover" }} />
        ) : (
          <span style={{ zIndex: 1 }}>{emoji}</span>
        )}

        {/* Alt vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, var(--bg) 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Aktif durum noktası */}
        {active && (
          <div
            style={{
              position: "absolute", top: 12, right: 12, zIndex: 3,
              display: "flex", alignItems: "center", gap: "6px",
              background: "var(--panel)", backdropFilter: "blur(12px)",
              padding: "4px 10px", borderRadius: "999px",
              border: "1px solid var(--border)",
            }}
          >
            <span className="pulse-dot" />
            <span className="mono" style={{ fontSize: "0.65rem", color: "var(--accent)" }}>aktif</span>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
            {title}
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.65 }}>{desc}</p>
        </div>

        {/* Etiketler */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {(stack ?? []).map((t) => (
            <span key={t} className="project-lang-badge">{t}</span>
          ))}
        </div>

        {/* Butonlar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
          <Link href={`/my-projects/${slug}`} className="btn btn-accent btn-full">
            Detaylar →
          </Link>
          <div style={{ display: "grid", gridTemplateColumns: live ? "1fr 1fr" : "1fr", gap: "8px" }}>
            {live && (
              <a href={live} className="btn btn-ghost btn-full" target="_blank" rel="noopener noreferrer">
                ↗ Canlı
              </a>
            )}
            <a href={repo} className="btn btn-ghost btn-full" target="_blank" rel="noopener noreferrer">
              ⌨️ Repo
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
