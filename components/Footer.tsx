"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getFooterConfig, FooterConfig, FooterLink } from "@/lib/firestore";

const DEFAULTS: FooterConfig = {
  motto:     "I defend the moral concept in software.",
  copyright: "© 2026 — trs.",
  socials: [
    { id: "gh", label: "GitHub",    href: "https://github.com/trs-1342",          icon: "⌨️", order: 0 },
    { id: "ig", label: "Instagram", href: "https://instagram.com/trs.1342",       icon: "📸", order: 1 },
    { id: "li", label: "LinkedIn",  href: "https://linkedin.com/in/halilhattabh", icon: "💼", order: 2 },
    { id: "em", label: "Email",     href: "mailto:hattab1342@gmail.com",           icon: "✉️", order: 3 },
  ],
  pages: [
    { id: "p1", label: "about",       href: "/about",       order: 0 },
    { id: "p2", label: "projects",    href: "/my-projects", order: 1 },
    { id: "p3", label: "photos",      href: "/photos",      order: 2 },
    { id: "p4", label: "hsounds",     href: "/hsounds",     order: 3 },
    { id: "p5", label: "thanks",      href: "/thanks",      order: 4 },
    { id: "p6", label: "contact",     href: "/contact",     order: 5 },
  ],
};

// Footer page label'larını çeviri sistemine bağla
const PAGE_KEY_MAP: Record<string, string> = {
  about:       "about",
  projects:    "projects",
  photos:      "photos",
  hsounds:     "hsounds",
  thanks:      "thanks",
  contact:     "contact",
};

function sorted(links: FooterLink[]) {
  return [...links].sort((a, b) => a.order - b.order);
}

export default function Footer() {
  const t  = useTranslations("Footer");
  const tn = useTranslations("Nav");
  const [cfg, setCfg] = useState<FooterConfig>(DEFAULTS);

  useEffect(() => {
    getFooterConfig().then((data) => setCfg(data));
  }, []);

  // Sayfa label'ını çeviri anahtarından al; bulunamazsa Firestore label'ını kullan
  const getPageLabel = (link: FooterLink): string => {
    const key = PAGE_KEY_MAP[link.label];
    if (key) {
      try { return tn(key as Parameters<typeof tn>[0]); } catch { /* bilinmeyen anahtar */ }
    }
    return link.label;
  };

  return (
    <footer
      id="contact"
      style={{ borderTop: "1px solid var(--border)", paddingTop: "48px", paddingBottom: "40px", marginTop: "80px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "32px", marginBottom: "40px" }}>

        {/* İmza + motto */}
        <div>
          <div className="mono" style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--accent)", marginBottom: "8px" }}>
            trs
          </div>
          <p style={{ fontSize: "0.83rem", color: "var(--text-3)", maxWidth: "260px", lineHeight: 1.6, fontStyle: "italic" }}>
            &quot;{cfg.motto}&quot;
          </p>
        </div>

        {/* Sayfalar */}
        {cfg.pages.length > 0 && (
          <div>
            <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              {t("pages")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sorted(cfg.pages).map((p) => (
                <a key={p.id} href={p.href} className="footer-link">{getPageLabel(p)}</a>
              ))}
            </div>
          </div>
        )}

        {/* Sosyal linkler */}
        {cfg.socials.length > 0 && (
          <div>
            <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              {t("contact")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sorted(cfg.socials).map((s) => (
                <a
                  key={s.id} href={s.href}
                  className="footer-link footer-social"
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  {s.icon && <span>{s.icon}</span>}
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alt şerit */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
        <p className="mono" style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
          {cfg.copyright} {t("allRightsReserved")}
        </p>
      </div>
    </footer>
  );
}
