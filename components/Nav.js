"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Anasayfa", icon: "fa-solid fa-house" },
  { href: "/my-projects", label: "Projelerim", icon: "fa-solid fa-grid-2" },
  { href: "/about", label: "Hakkımda", icon: "fa-solid fa-user" },
  {
    href: "/thanks",
    label: "Teşekkürler",
    icon: "fa-solid fa-hands-holding-heart",
  },
];

export default function Nav() {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";

  return (
    <nav
      className={`site-nav ${isHome ? "home" : "page"}`}
      aria-label="Ana menü"
    >
      <ul className="site-nav__list">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href} className="site-nav__item">
              <Link
                href={it.href}
                className={`site-nav__link${active ? " is-active" : ""}`}
                prefetch={true}
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
