"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { getMenuItems } from "@/lib/firestore";
import type { MenuItem } from "@/lib/firestore";

export default function Navbar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const hideProgress = useRef(0);
  const lastY = useRef(0);
  const [navStyle, setNavStyle] = useState<React.CSSProperties>({});
  const [links, setLinks] = useState<MenuItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  /* Menü öğelerini Firestore'dan yükle */
  useEffect(() => {
    getMenuItems().then((items) => {
      if (items && items.length > 0) {
        setLinks([...items].sort((a, b) => a.order - b.order));
      } else {
        // Firestore boşsa çevrilmiş varsayılanları kullan
        setLinks([
          { id: "m1", href: "/about",        label: t("about"),       icon: "🪪", order: 0 },
          { id: "m2", href: "/my-projects",  label: t("projects"),    icon: "⚡", order: 1 },
          { id: "m3", href: "/photos",       label: t("photos"),      icon: "📷", order: 2 },
          { id: "m4", href: "/hsounds",      label: t("hsounds"),     icon: "🎵", order: 3 },
          { id: "m5", href: "/thanks",       label: t("thanks"),      icon: "💫", order: 4 },
          { id: "m6", href: "/contact",      label: t("contact"),     icon: "✉️", order: 5 },
          { id: "m7", href: "/solar-system", label: t("solarSystem"), icon: "🌍", order: 6 },
        ]);
      }
    });
  // t'yi dependency'e eklemiyoruz — locale değişince component zaten yeniden mount olur
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Route değişince mobil menüyü kapat */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  /* Menü açıkken body scroll kilitle */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  /* Scroll hide animasyonu */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      lastY.current = y;

      if (y < 60) {
        hideProgress.current = 0;
      } else if (delta > 0) {
        hideProgress.current = Math.min(1, hideProgress.current + delta / 90);
      } else {
        hideProgress.current = Math.max(0, hideProgress.current + delta / 55);
      }

      const p = hideProgress.current;
      setNavStyle({
        opacity: 1 - p * 0.95,
        transform: `translateX(-50%) translateY(${-p * 18}px) scale(${1 - p * 0.06})`,
        pointerEvents: p > 0.85 ? "none" : "auto",
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredLinks = links.filter((l) => !(l.href === "/photos" && !user));

  return (
    <>
      {/* ── Mobil tam ekran menü overlay ── */}
      <div className={`mob-menu${menuOpen ? " mob-menu--open" : ""}`} aria-hidden={!menuOpen}>
        {/* Üst bar: logo + kapat */}
        <div className="mob-menu__header">
          <Link href="/" className="mob-menu__logo" onClick={() => setMenuOpen(false)}>
            trs
          </Link>
          <button
            className="mob-menu__close"
            onClick={() => setMenuOpen(false)}
            aria-label={t("closeMenu")}
          >
            ✕
          </button>
        </div>

        {/* Nav linkleri */}
        <nav className="mob-menu__nav">
          {filteredLinks.map((l, i) => {
            const isActive = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.id}
                href={l.href as Parameters<typeof Link>[0]["href"]}
                className={`mob-menu__item${isActive ? " mob-menu__item--active" : ""}`}
                style={{ animationDelay: menuOpen ? `${i * 0.04}s` : "0s" }}
              >
                <span className="mob-menu__icon">{l.icon}</span>
                <span className="mob-menu__label">{l.label}</span>
                <span className="mob-menu__arrow">→</span>
              </Link>
            );
          })}
        </nav>

        {/* Alt: profil + tema + dil */}
        <div className="mob-menu__footer">
          {user ? (
            <Link
              href="/profile"
              className="mob-menu__profile"
              onClick={() => setMenuOpen(false)}
            >
              <span style={{ fontSize: "1rem" }}>👤</span>
              <span>{profile?.username ?? t("profile")}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="mob-menu__profile"
              onClick={() => setMenuOpen(false)}
            >
              <span style={{ fontSize: "1rem" }}>🔑</span>
              <span>{t("login")}</span>
            </Link>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Pill navbar ── */}
      <nav className="navbar" style={navStyle} aria-label="Ana navigasyon">
        <div className="navbar-pill">

          {/* Logo */}
          <Link href="/" className="nav-logo">trs</Link>

          <div className="nav-divider" />

          {/* Masaüstü linkler */}
          <div className="nav-desktop-links">
            {filteredLinks.map((l) => {
              const isActive = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.id}
                  href={l.href as Parameters<typeof Link>[0]["href"]}
                  title={l.label}
                  className={`nav-link${isActive ? " nav-link--active" : ""}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="nav-divider nav-divider--desktop" />

          {/* Dil seçici */}
          <LanguageSwitcher />

          <ThemeToggle />

          {/* Auth */}
          {user ? (
            <Link href="/profile" className="nav-profile-pill mono">
              {profile?.username ?? t("profile")}
            </Link>
          ) : (
            <Link href="/login" className="mono nav-link" style={{ fontSize: "0.78rem" }}>
              {t("login")}
            </Link>
          )}

          {/* Mobil: hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label={t("openMenu")}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <style>{`
        /* ── Logo ── */
        .nav-logo {
          padding: 7px 12px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--accent);
          text-decoration: none;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }

        /* ── Profil pill ── */
        .nav-profile-pill {
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 0.75rem;
          color: var(--accent);
          text-decoration: none;
          border: 1px solid var(--border-hover);
          background: var(--accent-dim);
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── Hamburger ── */
        .nav-hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          border-radius: 999px;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .nav-hamburger span {
          display: block;
          width: 16px;
          height: 1.5px;
          background: var(--text-2);
          border-radius: 2px;
          transition: background 0.15s;
        }
        .nav-hamburger:hover span { background: var(--text); }

        /* ── Masaüstü link grubu ── */
        .nav-desktop-links {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        /* ── Mobil overlay menü ── */
        .mob-menu {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          padding: 0;
          transform: translateY(100%);
          transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
          pointer-events: none;
        }
        .mob-menu--open {
          transform: translateY(0);
          pointer-events: auto;
        }

        .mob-menu__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .mob-menu__logo {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--accent);
          text-decoration: none;
          letter-spacing: 0.05em;
        }
        .mob-menu__close {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--panel);
          color: var(--text-2);
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mob-menu__nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px 20px;
          gap: 4px;
          overflow-y: auto;
        }
        .mob-menu__item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 18px;
          border-radius: 14px;
          text-decoration: none;
          border: 1px solid transparent;
          transition: background 0.15s, border-color 0.15s;
          animation: mobItemIn 0.3s var(--ease-out) both;
        }
        @keyframes mobItemIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mob-menu__item:hover {
          background: var(--panel-hover);
          border-color: var(--border);
        }
        .mob-menu__item--active {
          background: var(--accent-dim);
          border-color: var(--border-hover);
        }
        .mob-menu__icon {
          font-size: 1.4rem;
          width: 36px;
          text-align: center;
          flex-shrink: 0;
        }
        .mob-menu__label {
          flex: 1;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .mob-menu__item--active .mob-menu__label {
          color: var(--accent);
        }
        .mob-menu__arrow {
          font-size: 0.9rem;
          color: var(--text-3);
        }
        .mob-menu__item--active .mob-menu__arrow {
          color: var(--accent);
        }

        .mob-menu__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px 32px;
          border-top: 1px solid var(--border);
        }
        .mob-menu__profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid var(--border-hover);
          background: var(--accent-dim);
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--accent);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .nav-desktop-links   { display: none; }
          .nav-divider--desktop { display: none; }
          .nav-hamburger       { display: flex; }
          .nav-profile-pill    { display: none; }
          .navbar-pill .nav-link[href="/login"] { display: none; }
        }

        @media (min-width: 641px) {
          .mob-menu { display: none !important; }
          .nav-hamburger { display: none !important; }
        }
      `}</style>
    </>
  );
}
