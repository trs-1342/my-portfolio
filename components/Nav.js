"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";

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
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null); // { loggedIn: boolean, user?: { picture, ... } }
  const ref = useRef(null);

  // menü kapanma davranışları
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onClick = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // oturum bilgisi (session cookie → /api/auth/me)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        const j = await r.json();
        if (alive) setMe(j);
      } catch {
        if (alive) setMe({ loggedIn: false });
      }
    })();
    return () => {
      alive = false;
    };
  }, [pathname]);

  // Menü maddeleri: yalnızca hesap/login maddesinde avatar alanı var
  const items = [...baseItems];
  if (me?.loggedIn && me?.user) {
    items.push({
      href: "/profile",
      label: "Hesap",
      icon: "", // icon yok
      avatar: me.user.picture || "", // SADECE bu maddede avatar var
    });
  } else {
    items.push({
      href: "/login",
      label: "Login",
      icon: "fa-solid fa-right-to-bracket",
      avatar: "", // avatar yok
    });
  }

  return (
    <nav ref={ref} className="site-nav">
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
                {it.avatar ? (
                  <span className="nav-avatar" title="Hesap">
                    <Avatar src={it.avatar} alt="Hesap" size={24} />
                  </span>
                ) : (
                  <i className={it.icon} aria-hidden="true" />
                )}
                <span className="nav-label">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
