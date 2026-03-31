"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AmbientGlow from "@/components/AmbientGlow";

const TOP_NAV = [
  { href: "/admin",          label: "Dashboard",    icon: "⌘"  },
  { href: "/admin/contacts", label: "Mesajlar",     icon: "✉️" },
  { href: "/admin/users",    label: "Kullanıcılar", icon: "👥" },
];

const PAGES_NAV = [
  { href: "/admin/homepage", label: "Anasayfa",    icon: "🏠" },
  { href: "/admin/about",    label: "Hakkımda",    icon: "👤" },
  { href: "/admin/projects", label: "Projeler",    icon: "📁" },
  { href: "/admin/photos",   label: "Fotoğraflar", icon: "📷" },
  { href: "/admin/thanks",   label: "Teşekkürler", icon: "🙏" },
  { href: "/admin/hsounds",  label: "HSounds",     icon: "🎵" },
  { href: "/admin/footer",   label: "Footer",      icon: "📋" },
  { href: "/admin/theme",    label: "Tema",        icon: "🎨" },
  { href: "/admin/pages",    label: "Menü",        icon: "⚙️" },
];

/* Tüm nav'dan mevcut sayfa etiketini bul */
function currentPageLabel(pathname: string): string {
  const all = [...TOP_NAV, ...PAGES_NAV];
  const found = all.find((i) => i.href === pathname);
  return found ? found.label : "Admin";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [pagesOpen,   setPagesOpen]   = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Route değişince sidebar'ı kapat (mobil) */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  /* Auth kontrolü */
  useEffect(() => {
    if (loading) return;
    if (!user || profile?.role !== "admin") router.replace("/");
  }, [loading, user, profile, router]);

  if (loading || !user || profile?.role !== "admin") {
    return (
      <>
        <AmbientGlow />
        <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
            {loading ? "Yükleniyor..." : "Yetki yok."}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <AmbientGlow />

      {/* Mobil overlay backdrop */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div style={{ display: "flex", minHeight: "100svh" }}>

        {/* Sidebar */}
        <aside className={`admin-sidebar${sidebarOpen ? " admin-sidebar--open" : ""}`}>

          {/* Logo + kapat butonu (mobilde görünür) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <p className="mono" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em" }}>
                trs
              </p>
              <p className="mono" style={{ fontSize: "0.65rem", color: "var(--text-3)", marginTop: "2px", letterSpacing: "0.08em" }}>
                /admin
              </p>
            </Link>
            <button
              className="admin-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Menüyü kapat"
            >
              ✕
            </button>
          </div>

          {/* Üst nav */}
          {TOP_NAV.map((item) => (
            <NavItem key={item.href} item={item} active={pathname === item.href} />
          ))}

          {/* Ayraç */}
          <div style={{ height: "1px", background: "var(--border)", margin: "10px 0" }} />

          {/* Sayfalar (collapsible) */}
          <button
            onClick={() => setPagesOpen(!pagesOpen)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "7px 12px", borderRadius: "10px",
              border: "none", background: "transparent",
              color: "var(--text-3)", fontSize: "0.72rem",
              fontFamily: "var(--font-mono)", textTransform: "uppercase",
              letterSpacing: "0.1em", cursor: "pointer", width: "100%",
              transition: "color 0.15s",
            }}
          >
            <span>Sayfalar</span>
            <span style={{ fontSize: "0.6rem" }}>{pagesOpen ? "▲" : "▼"}</span>
          </button>

          {pagesOpen && (
            <div style={{ paddingLeft: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {PAGES_NAV.map((item) => (
                <NavItem key={item.href} item={item} active={pathname === item.href} sub />
              ))}
            </div>
          )}

          {/* Alt: siteye dön */}
          <div style={{ marginTop: "auto", paddingTop: "16px" }}>
            <Link href="/" style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 12px", borderRadius: "10px", textDecoration: "none",
              fontSize: "0.82rem", color: "var(--text-3)", transition: "color 0.15s",
            }}>
              ← Siteye Dön
            </Link>
          </div>
        </aside>

        {/* İçerik sarmalayıcı */}
        <div className="admin-content-wrapper">

          {/* Mobil üst bar */}
          <header className="admin-mobile-header">
            <button
              className="admin-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menüyü aç"
            >
              <span /><span /><span />
            </button>
            <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)" }}>
              {currentPageLabel(pathname)}
            </span>
            <Link
              href="/"
              className="mono"
              style={{ fontSize: "0.72rem", color: "var(--text-3)", textDecoration: "none" }}
            >
              ← Site
            </Link>
          </header>

          {/* Asıl içerik */}
          <main className="admin-main">
            {children}
          </main>
        </div>
      </div>

      <style>{`
        /* ── Sidebar ── */
        .admin-sidebar {
          width: 220px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          background: var(--panel);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          padding: 28px 16px;
          gap: 4px;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 300;
          overflow-y: auto;
        }

        .admin-sidebar-close { display: none; }

        /* ── İçerik ── */
        .admin-content-wrapper {
          flex: 1;
          margin-left: 220px;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .admin-mobile-header { display: none; }

        .admin-main {
          flex: 1;
          padding: 40px 40px 80px;
          position: relative;
          z-index: 1;
        }

        .admin-overlay { display: none; }

        /* ── Hamburger butonu ── */
        .admin-hamburger {
          background: none;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          justify-content: center;
        }
        .admin-hamburger span {
          display: block;
          width: 18px;
          height: 2px;
          background: var(--text-2);
          border-radius: 2px;
          transition: background 0.15s;
        }
        .admin-hamburger:hover span { background: var(--text); }

        /* ── Tablet (768px) ── */
        @media (max-width: 900px) {
          .admin-main {
            padding: 28px 24px 60px;
          }
        }

        /* ── Mobil (640px) ── */
        @media (max-width: 640px) {
          /* Sidebar varsayılan: gizli, soldan slide-in */
          .admin-sidebar {
            width: 260px;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: none;
          }

          .admin-sidebar--open {
            transform: translateX(0);
            box-shadow: 8px 0 40px rgba(0, 0, 0, 0.35);
          }

          /* Sidebar'daki kapatma butonu görünür */
          .admin-sidebar-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: 1px solid var(--border);
            background: var(--panel-hover);
            color: var(--text-2);
            font-size: 0.8rem;
            cursor: pointer;
            flex-shrink: 0;
          }

          /* İçerik wrapper: tam genişlik */
          .admin-content-wrapper {
            margin-left: 0;
          }

          /* Mobil header: görünür */
          .admin-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 16px;
            border-bottom: 1px solid var(--border);
            background: var(--panel);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .admin-main {
            padding: 20px 16px 80px;
          }

          /* Overlay backdrop */
          .admin-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(2px);
            z-index: 200;
            animation: fadeIn 0.2s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        }
      `}</style>
    </>
  );
}

function NavItem({
  item,
  active,
  sub,
}: {
  item: { href: string; label: string; icon: string };
  active: boolean;
  sub?: boolean;
}) {
  return (
    <Link
      href={item.href}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: sub ? "7px 10px" : "9px 12px",
        borderRadius: "10px", textDecoration: "none",
        fontSize: sub ? "0.82rem" : "0.85rem", fontWeight: 500,
        color: active ? "var(--accent)" : "var(--text-2)",
        background: active ? "var(--accent-dim)" : "transparent",
        border: active ? "1px solid var(--border-hover)" : "1px solid transparent",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: sub ? "0.9rem" : "1rem" }}>{item.icon}</span>
      {item.label}
    </Link>
  );
}
