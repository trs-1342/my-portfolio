import ThemeToggle from "@/components/ThemeToggle";
import CustomCursor from "@/components/CustomCursor";
import Gallery from "@/components/Gallery";
import GithubTable from "@/components/GithubTable";
// import ProjectsGrid from "@/components/ProjectsGrid";
import FeaturedProjects from "@/components/FeaturedProjects";
import SkillsIcons from "@/components/SkillsIcons";
import Nav from "@/components/Nav";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div className="container">
      <CustomCursor />
      <ThemeToggle />
      <Gallery />

      <main className="right">
        <Nav />
        {/* Intro */}
        <section className="intro">
          <h1>Halil Hattab</h1>
          <h6>yakinda buralar guzellesecek...</h6>
          <h2>Full-Stack Developer</h2>
          <p className="stack">
            React • React Native • Node.js • Next.js • WordPress • Firebase •
            MySQL • Linux • AI
          </p>
        </section>

        {/* GitHub */}
        <GithubTable user="trs-1342" limit={8} />

        <div className="about-panel" id="hakkimda">
          <div className="about-left">
            <h2>Hakkımda</h2>
            <p>
              Selam, ben <strong>Halil Hattab</strong>. 19 yaşındayım; ŞBBKMTAL
              Bilişim mezunuyum. Şu an İstanbul Gelişim Üniversitesi’nde 1.
              sınıf <strong>Yazılım Mühendisliği</strong> öğrencisiyim.
            </p>
            <p>
              Amacım; hızla değişen teknoloji çağında{" "}
              <strong>ahlaki değerleri koruyarak</strong> üretmek ve yeni
              fikirlerle insanların hayatına dokunan projeler geliştirmek.
            </p>
            <blockquote>I defend the moral concept in software.</blockquote>
            <div className="about-tags">
              <span className="tag">
                <i className="fa-solid fa-layer-group"></i> Full-Stack
              </span>
              <span className="tag">
                <i className="fa-solid fa-shield-halved"></i> Cybersecurity
              </span>
              <span className="tag">
                <i className="fa-solid fa-wand-magic-sparkles"></i> Creative
                Projects
              </span>
            </div>
          </div>

          <div className="about-right">
            <ul className="about-meta">
              <li>
                <i className="fa-solid fa-graduation-cap"></i> 1. sınıf •
                İstanbul Gelişim Üniversitesi
              </li>
              <li>
                <i className="fa-solid fa-school"></i> ŞBBKMTAL • Bilişim
              </li>
              <li>
                <i className="fa-solid fa-heart"></i> İlgi: Full-Stack,
                Güvenlik, Üretkenlik
              </li>
              <li>
                <i className="fa-solid fa-flag-checkered"></i> Hedef: etik
                değerlerle unutulmaz yazılımlar
              </li>
            </ul>
          </div>
          <div style={{ marginTop: "12px" }}>
            <Link
              href="/about"
              className="chip"
              style={{ textDecoration: "none" }}
            >
              <span>Daha Fazla Detay</span> ↗︎
            </Link>
          </div>
        </div>

        {/* Projeler */}
        {/* <ProjectsGrid /> */}
        <FeaturedProjects />

        <SkillsIcons />

        {/* İletişim */}
        <section>
          <h2>📬 İletişim</h2>
          <div className="chip">
            <i className="fa-regular fa-envelope"></i>
            <a href="mailto:hattab1342@gmail.com">hattab1342@gmail.com</a>
          </div>
          <div className="chip mr-1">
            <i className="fa-solid fa-location-dot"></i>
            <span>İstanbul</span>
          </div>
        </section>

        <section className="support-section">
          <div className="support-title">
            ☕ Bana bir kahve ısmarlayarak destek olabilirsin!
          </div>
          <a
            className="bmc-btn"
            href="https://www.buymeacoffee.com/trs1342"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
              width={124}
              height={32}
              unoptimized
            />
          </a>
        </section>

        <footer>
          <p className="motto">“I defend the moral concept in software.”</p>
          <div className="footer-socials">
            <a
              href="https://github.com/trs-1342"
              target="_blank"
              aria-label="GitHub"
            >
              <i className="fa-brands fa-github"></i>
            </a>
            <a
              href="https://instagram.com/trs.1342"
              target="_blank"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://www.linkedin.com/in/halil-h-b961b127a/"
              target="_blank"
              aria-label="LinkedIn"
            >
              <i className="fa-brands fa-linkedin"></i>
            </a>
          </div>
          <p className="copy">
            <i className="fa-regular fa-copyright"></i>{" "}
            {new Date().getFullYear()} trs-1342
          </p>
        </footer>
      </main>
    </div>
  );
}
