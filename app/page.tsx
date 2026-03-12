import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import FeaturedProjects from "@/components/FeaturedProjects";
import ActiveProjects from "@/components/ActiveProjects";
import GitHubStats from "@/components/GitHubStats";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Arka plan ambient glow */}
      <AmbientGlow />

      {/* Glassmorphism navbar */}
      <Navbar />

      <div className="page-content">
        {/* Hero — iki sütunlu karşılama */}
        <Hero />

        {/* Yetenekler + Sabitlenmiş Projeler — asimetrik grid */}
        <section
          id="projects"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "24px",
          }}
        >
          {/* Sol: Skill kartları */}
          <Skills />

          {/* Sağ: Proje kartları */}
          <FeaturedProjects />
        </section>

        {/* Aktif projeler — yatay scroll */}
        <ActiveProjects />

        {/* Mock GitHub istatistikleri */}
        <GitHubStats />

        {/* Footer + iletişim */}
        <Footer />
      </div>

      {/* Mobil: tek sütun */}
      <style>{`
        @media (max-width: 900px) {
          #projects {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
