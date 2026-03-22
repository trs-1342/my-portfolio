"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { getMenuItems } from "@/lib/firestore";
import type { MenuItem } from "@/lib/firestore";

const DEFAULT_LINKS: MenuItem[] = [
  { id: "m1", href: "/about",       label: "Hakkımda",    icon: "👤", order: 0 },
  { id: "m2", href: "/my-projects", label: "Projeler",    icon: "⚡", order: 1 },
  { id: "m3", href: "/photos",      label: "Fotoğraflar", icon: "📷", order: 2 },
  { id: "m4", href: "/hsounds",     label: "Hsounds",     icon: "🎵", order: 3 },
  { id: "m5", href: "/thanks",      label: "Teşekkürler", icon: "💫", order: 4 },
  { id: "m6", href: "/contact",     label: "İletişim",    icon: "✉️", order: 5 },
  { id: "m7", href: "/solar-system",     label: "Güneş Sistemi",    icon: "🌍", order: 6 },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const hideProgress = useRef(0);
  const lastY = useRef(0);
  const [style, setStyle]     = useState<React.CSSProperties>({});
  const [links, setLinks]     = useState<MenuItem[]>(DEFAULT_LINKS);

  /* Menü öğelerini Firestore'dan yükle (varsa override et) */
  useEffect(() => {
    getMenuItems().then((items) => {
      if (items && items.length > 0) {
        setLinks([...items].sort((a, b) => a.order - b.order));
      }
    });
  }, []);

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
      setStyle({
        opacity: 1 - p * 0.95,
        transform: `translateX(-50%) translateY(${-p * 18}px) scale(${1 - p * 0.06})`,
        pointerEvents: p > 0.85 ? "none" : "auto",
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="navbar" style={style} aria-label="Ana navigasyon">
      <div className="navbar-pill">
        {/* Site adı / logo */}
        <Link
          href="/"
          style={{
            padding: "7px 12px",
            borderRadius: "999px",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "var(--accent)",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          trs
        </Link>

        <div className="nav-divider" />

        {links
          .filter((l) => !(l.href === "/photos" && !user))
          .map((l) => {
            const isActive = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <a
                key={l.id}
                href={l.href}
                className={`nav-link${isActive ? " nav-link--active" : ""}`}
              >
                <span className="nav-icon">{l.icon}</span>
                <span className="nav-label">{l.label}</span>
              </a>
            );
          })}

        <div className="nav-divider" />

        <ThemeToggle />

        {/* Auth butonu */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Link
              href="/profile"
              className="mono"
              style={{
                padding: "6px 11px",
                borderRadius: "999px",
                fontSize: "0.75rem",
                color: "var(--accent)",
                textDecoration: "none",
                border: "1px solid rgba(16,185,129,0.3)",
                background: "var(--accent-dim)",
              }}
            >
              {profile?.username ?? "profil"}
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="mono nav-link"
            style={{ fontSize: "0.78rem" }}
          >
            Giriş
          </Link>
        )}
      </div>
    </nav>
  );
}
