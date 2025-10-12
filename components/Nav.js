"use client";
import Link from "next/link";
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
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null); // { loggedIn, user? }
  const navRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // oturum sorgusu
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

  // menü maddeleri: login varsa göster, yoksa HESAP
  const items = [...baseItems];
  if (me?.loggedIn && me?.user) {
    items.push({
      href: "/profile",
      label: "Hesap", // <- e-posta yerine sabit "Hesap"
      icon: "",
      avatar: me.user.picture || "", // varsa avatar
    });
  } else {
    items.push({
      href: "/profile",
      label: "Hesap",
      icon: "fa-solid fa-right-to-bracket",
    });
  }

  return (
    <nav ref={navRef} className={`site-nav ${isHome ? "home" : "page"}`}>
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
          const showLabel = it.avatar ? "Hesap" : it.label; // avatar varsa "Hesap" yaz
          return (
            <li key={it.href} className="site-nav__item">
              <Link
                href={it.href}
                className={`site-nav__link${active ? " is-active" : ""}`}
                prefetch
              >
                {it.avatar ? (
                  <span className="nav-avatar" title="Hesap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.avatar} alt="Hesap" />
                  </span>
                ) : (
                  <i className={it.icon} aria-hidden="true" />
                )}
                <span className="nav-label">{showLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
