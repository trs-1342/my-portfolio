const socials = [
  { label: "GitHub",    href: "https://github.com/trs-1342",                    icon: "⌨️" },
  { label: "Instagram", href: "https://instagram.com/trs.1342",                 icon: "📸" },
  { label: "LinkedIn",  href: "https://linkedin.com/in/halilhattabh",           icon: "💼" },
  { label: "Email",     href: "mailto:hattab1342@gmail.com",                    icon: "✉️" },
];

const pages = [
  { label: "Hakkımda",    href: "/about"       },
  { label: "Projeler",    href: "/my-projects" },
  { label: "Fotoğraflar", href: "/photos"      },
  { label: "Hsounds",     href: "/hsounds"     },
  { label: "Teşekkürler", href: "/thanks"      },
  { label: "İletişim",    href: "/contact"     },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "48px",
        paddingBottom: "40px",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "32px",
          marginBottom: "40px",
        }}
      >
        {/* İmza + motto */}
        <div>
          <div
            className="mono"
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "var(--accent)",
              marginBottom: "8px",
            }}
          >
            trs
          </div>
          <p
            style={{
              fontSize: "0.83rem",
              color: "var(--text-3)",
              maxWidth: "260px",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            &quot;I defend the moral concept in software.&quot;
          </p>
        </div>

        {/* Sayfalar */}
        <div>
          <p
            className="mono"
            style={{
              fontSize: "0.7rem",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "12px",
            }}
          >
            Sayfalar
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pages.map((p) => (
              <a key={p.href} href={p.href} className="footer-link">
                {p.label}
              </a>
            ))}
          </div>
        </div>

        {/* Sosyal linkler */}
        <div>
          <p
            className="mono"
            style={{
              fontSize: "0.7rem",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "12px",
            }}
          >
            İletişim
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="footer-link footer-social"
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
              >
                <span>{s.icon}</span>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Alt şerit */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "24px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p className="mono" style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
          © 2026 — trs. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
