"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const items = [
  { href: "/", label: "Anasayfa", icon: "fa-solid fa-house" },
  { href: "/my-projects", label: "Projelerim", icon: "fa-solid fa-diagram-project" },
  { href: "/about", label: "Hakkımda", icon: "fa-solid fa-user" },
  {
    href: "/thanks",
    label: "Teşekkürler",
    icon: "fa-solid fa-heart", // Yeni ikon eklendi
  },
];

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  // Rota değişince menüyü kapat
  useEffect(() => setOpen(false), [pathname]);

  // Esc ile kapat
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <nav ref={navRef} className={`site-nav ${isHome ? "home" : "page"}`}>
      {/* Mobil hamburger */}
      <button
        type="button"
        className="site-nav__menu-btn"
        aria-label="Menüyü aç/kapat"
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <i
          className={open ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
          aria-hidden="true"
        />
      </button>

      <ul
        id="primary-nav"
        className={`site-nav__list${open ? " is-open" : ""}`}
      >
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/" && pathname.startsWith(it.href));
          return (
            <li key={it.href} className="site-nav__item">
              <Link
                href={it.href}
                className={`site-nav__link${active ? " is-active" : ""}`}
                prefetch
              >
                <i className={it.icon} aria-hidden="true" />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
