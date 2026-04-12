import { getTranslations } from "next-intl/server";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Terminal from "@/components/projects/Terminal";
import ProjectCard from "@/components/projects/ProjectCard";
import { getProjectsServer, getProjectsPageConfigServer } from "@/lib/site-server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  const ogUrl = `${BASE_URL}/api/og?` + new URLSearchParams({ title: t("title"), desc: "trs", type: "project" }).toString();

  return {
    title: `${t("title")} — trs`,
    description: t("title"),
    openGraph: { title: `${t("title")} — trs`, description: t("title"), url: `${BASE_URL}/${locale}/my-projects`, images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" as const, title: `${t("title")} — trs`, images: [ogUrl] },
  };
}

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [projects, pageConfig, t] = await Promise.all([
    getProjectsServer(),
    getProjectsPageConfigServer(),
    getTranslations({ locale, namespace: "Projects" }),
  ]);

  const activeProjects = projects.filter((p) => p.active);
  const restProjects   = projects.filter((p) => !p.active);

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px" }}>
        <header style={{ marginBottom: "40px" }}>
          <p className="mono anim-fade-up d1" style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>
            /my-projects
          </p>
          <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "12px" }}>
            {t("title")}
          </h1>
          <p className="anim-fade-up d3" style={{ color: "var(--text-2)", fontSize: "0.96rem", maxWidth: "540px", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: pageConfig.subtitle.replace(/\n/g, "<br>") }}
          />
        </header>

        {activeProjects.length > 0 && (
          <section style={{ marginBottom: "60px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <span className="pulse-dot" />
              <h2 className="mono" style={{ fontSize: "0.78rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {t("active")}
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              {activeProjects.map((p, i) => (
                <div key={p.id} className={`anim-fade-up d${Math.min(i + 1, 6)}`}>
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {restProjects.length > 0 && (
          <section style={{ marginBottom: "60px" }}>
            <h2 className="mono" style={{ fontSize: "0.78rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
              {t("other")}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              {restProjects.map((p, i) => (
                <div key={p.id} className={`anim-fade-up d${Math.min(i + 1, 6)}`}>
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="anim-fade-up" style={{ marginTop: "60px" }}>
          <h2 className="mono" style={{ fontSize: "0.78rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
            {t("terminal")}
          </h2>
          <Terminal projects={projects} />
        </div>

        <Footer />
      </div>

      <style>{`
        @media (max-width: 640px) {
          section div[style*="repeat(2"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
