import ThemeToggle from "@/components/ThemeToggle";
import CustomCursor from "@/components/CustomCursor";
import Gallery from "@/components/Gallery";
import GithubTable from "@/components/GithubTable";
import ProjectsGrid from "@/components/ProjectsGrid";

export default function Page() {
  return (
    <div className="container">
      <CustomCursor />
      <ThemeToggle />
      <Gallery />

      <main className="right">
        {/* Intro */}
        <section className="intro">
          <h1>Halil Hattab</h1>
          <h2>Full-Stack Developer</h2>
          <p className="stack">
            React • React Native • Node.js • Next.js • WordPress • Firebase •
            MySQL • Linux • AI
          </p>
        </section>

        {/* GitHub */}
        <GithubTable user="trs-1342" limit={8} />

        {/* Projeler */}
        <ProjectsGrid />

        {/* Yetenekler */}
        <section>
          <h2>💼 Yetenekler</h2>
          <ul className="skills">
            <li>HTML, CSS, JavaScript</li>
            <li>Python, C#, PHP</li>
            <li>Bootstrap, jQuery</li>
            <li>React, React Native, Next.js, Node.js, WordPress</li>
            <li>Firebase, MySQL, Express.js</li>
            <li>Linux, Portainer, SEO</li>
            <li>WebSocket, Git</li>
          </ul>
        </section>

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

        {/* Footer */}
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
              href="https://www.linkedin.com/in/halil-hattab-b961b127a/"
              target="_blank"
              aria-label="LinkedIn"
            >
              <i className="fa-brands fa-linkedin"></i>
            </a>
            <a
              href="https://instagram.com/hhattabh"
              target="_blank"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>
          <p className="copy">
            <i className="fa-regular fa-copyright"></i>{" "}
            {new Date().getFullYear()} trs-1342 — Tüm hakları saklıdır.
          </p>
        </footer>
      </main>
    </div>
  );
}
