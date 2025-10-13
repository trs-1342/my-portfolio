// components/Nav.js  (replace mevcut ile)
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const baseItems = [
  { href: "/", label: "Anasayfa", icon: "fa-solid fa-house" },
  {
    href: "/my-projects",
    label: "Projelerim",
    icon: "fa-solid fa-diagram-project",
  },
  { href: "/about", label: "Hakkımda", icon: "fa-solid fa-user" },
  { href: "/thanks", label: "Teşekkürler", icon: "fa-solid fa-heart" },
  { href: "/hsounds", label: "HSound", icon: "fa-solid fa-rss" },
  { href: "/muhattab", label: "Muhattab", icon: "fa-solid fa-comment" },
];

export default function Nav() {
  const pathname = usePathname();
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // rota değişince menüyü kapat
  useEffect(() => setOpen(false), [pathname]);

  // dış tıklama ile kapat
  useEffect(() => {
    const onClick = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // oturum durumu getir
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        const j = await r.json();
        if (ok) setMe(j);
      } catch {
        if (ok) setMe({ loggedIn: false });
      }
    })();
    return () => {
      ok = false;
    };
  }, [pathname]);

  const items = [...baseItems];
  if (me?.loggedIn && me?.user) {
    items.push({
      href: "/profile",
      label: "Hesap",
      avatar: me.user.picture || "",
    });
  } else {
    items.push({
      href: "/login",
      label: "Giriş",
      icon: "fa-solid fa-right-to-bracket",
    });
  }

  return (
    <nav ref={ref} className="site-nav">
      {/* HAMBURGER / MENÜ BUTONU - sadece mobilde görünür (CSS ile) */}
      <button
        type="button"
        className="site-nav__menu-btn"
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
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
        {items.map((it) => (
          <li key={it.href} className="site-nav__item">
            <Link
              href={it.href}
              className={`site-nav__link${
                pathname === it.href ? " is-active" : ""
              }`}
              prefetch
            >
              {it.avatar ? (
                <span className="nav-avatar" title="Hesap">
                  {/* avatar yüklenmezse fallback gösterilebilir */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.avatar} alt="Hesap" />
                </span>
              ) : (
                <i className={it.icon} aria-hidden="true" />
              )}
              <span className="nav-label">
                {it.avatar ? "Hesap" : it.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
