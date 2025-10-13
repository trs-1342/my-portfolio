export default function SkillsIcons() {
  const categories = [
    {
      title: "Frontend",
      items: [
        { name: "HTML5", icon: "devicon-html5-plain colored" },
        { name: "CSS3", icon: "devicon-css3-plain colored" },
        { name: "JavaScript", icon: "devicon-javascript-plain colored" },
      ],
    },
    {
      title: "Backend (Diller & Runtime)",
      items: [
        { name: "Node.js", icon: "devicon-nodejs-plain colored" },
        { name: "Python", icon: "devicon-python-plain colored" },
        { name: "C#", icon: "devicon-csharp-plain colored" },
        { name: "PHP", icon: "devicon-php-plain colored" },
      ],
    },
    {
      title: "Framework & Kütüphaneler",
      items: [
        { name: "React", icon: "devicon-react-original colored" },
        { name: "React Native", icon: "devicon-react-original colored" },
        { name: "Next.js", icon: "devicon-nextjs-plain" },
        { name: "Express.js", icon: "devicon-express-original" },
        { name: "Bootstrap", icon: "devicon-bootstrap-plain colored" },
        { name: "jQuery", icon: "devicon-jquery-plain colored" },
        { name: "WordPress", icon: "devicon-wordpress-plain colored" },
      ],
    },
    {
      title: "Veritabanı & Servisler",
      items: [
        { name: "MySQL", icon: "devicon-mysql-plain colored" },
        { name: "Firebase", icon: "devicon-firebase-plain colored" },
      ],
    },
    {
      title: "Araçlar & Platform",
      items: [
        { name: "Linux", icon: "devicon-linux-plain" },
        { name: "Git", icon: "devicon-git-plain colored" },
        // Portainer için Docker ikonu temsil
        { name: "Portainer (Docker)", icon: "devicon-docker-plain colored" },
      ],
    },
  ];

  return (
    <section className="skills-section">
      <h2>💼 Yetenekler</h2>

      <div className="skills-grid">
        {categories.map((cat) => (
          <div className="skills-card" key={cat.title}>
            <h3>{cat.title}</h3>
            <ul className="icon-list" aria-label={`${cat.title} ikonları`}>
              {cat.items.map((item) => (
                <li className="icon-badge" key={item.name} title={item.name}>
                  <i
                    className={`${item.icon} icon`}
                    aria-label={item.name}
                    role="img"
                  />
                  <span className="sr-only">{item.name}</span>
                </li>
              ))}

              {/* WebSocket/Socket.IO */}
              {cat.title === "Araçlar & Platform" && (
                <li className="icon-badge" title="WebSocket / Socket.IO">
                  <i
                    className="devicon-socketio-original icon"
                    aria-label="WebSocket / Socket.IO"
                    role="img"
                  />
                  <span className="sr-only">WebSocket / Socket.IO</span>
                </li>
              )}

              {/* SEO — basit büyüteç SVG */}
              {cat.title === "Araçlar & Platform" && (
                <li className="icon-badge" title="SEO">
                  <svg
                    className="icon"
                    viewBox="0 0 24 24"
                    aria-label="SEO"
                    role="img"
                  >
                    <path
                      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">SEO</span>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <style>{`
        .skills-section { padding: 24px 0; }
        .skills-section h2 { margin: 0 0 16px 0; font-size: 1.8rem; }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }

        /* Temel (varsayılan) stiller */
        .skills-card {
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          padding: 16px;
          background: var(--card-bg, #fff);
          box-shadow: 0 4px 14px rgba(0,0,0,0.05);
        }
        .skills-card h3 { margin: 0 0 12px 0; font-size: 1.05rem; opacity: .9; }

        .icon-list { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; padding: 0; margin: 0; }
        .icon-badge {
          width: 56px; height: 56px; display: grid; place-items: center;
          border-radius: 14px; background: var(--icon-bg, #f7f7f9);
          border: 1px solid rgba(0,0,0,0.06);
        }
        .icon { font-size: 32px; width: 32px; height: 32px; line-height: 1; color: currentColor; }

        /* —— TEMA-BAĞLI STİLLER ———————————————————————————— */
        /* AÇIK TEMA */
        html.light .skills-card {
          background: #ffffff;
          border-color: rgba(0,0,0,.08);
          box-shadow: 0 4px 14px rgba(0,0,0,.06);
        }
        html.light .skills-card h3 { color: #111; opacity: .95; }
        html.light .icon-badge {
          background: #f7f7f9;
          border-color: rgba(0,0,0,.06);
        }
        /* Monokrom logolar açık temada normal kalsın */
        html.light .devicon-nextjs-plain.icon,
        html.light .devicon-express-original.icon,
        html.light .devicon-linux-plain.icon,
        html.light .devicon-socketio-original.icon { filter: none; }

        /* KOYU TEMA (html.light yoksa) */
        html:not(.light) .skills-card {
          background: #0f1115;
          border-color: rgba(255,255,255,.08);
          box-shadow: 0 8px 24px rgba(0,0,0,.35);
        }
        html:not(.light) .skills-card h3 { color: #e8eefb; opacity: .95; }
        html:not(.light) .icon-badge {
          background: #11151c;
          border-color: rgba(255,255,255,.06);
        }
        /* Monokrom logoları koyuda görünür kıl */
        html:not(.light) .devicon-nextjs-plain.icon,
        html:not(.light) .devicon-express-original.icon,
        html:not(.light) .devicon-linux-plain.icon,
        html:not(.light) .devicon-socketio-original.icon { filter: invert(1) brightness(1.1); }

        /* Erişilebilirlik yardımcı sınıfı */
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }

      `}</style>
    </section>
  );
}
