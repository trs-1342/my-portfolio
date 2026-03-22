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
  { href: "/admin/thanks",   label: "Teşekkürler",  icon: "🙏" },
  { href: "/admin/hsounds",  label: "HSounds",      icon: "🎵" },
  { href: "/admin/footer",   label: "Footer",       icon: "📋" },
  { href: "/admin/theme",    label: "Tema",         icon: "🎨" },
  { href: "/admin/pages",    label: "Menü",         icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [pagesOpen, setPagesOpen] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || profile?.role !== "admin") router.replace("/");
  }, [loading, user, profile, router]);

  /* Yükleniyor veya yetkisiz */
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

      <div style={{ display: "flex", minHeight: "100svh" }}>

        {/* Sol kenar çubuğu */}
        <aside style={{
          width: "220px", flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--panel)", backdropFilter: "blur(24px)",
          display: "flex", flexDirection: "column",
          padding: "28px 16px", gap: "4px",
          position: "fixed", top: 0, left: 0, bottom: 0,
          zIndex: 100, overflowY: "auto",
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", marginBottom: "28px", display: "block" }}>
            <p className="mono" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em" }}>
              trs
            </p>
            <p className="mono" style={{ fontSize: "0.65rem", color: "var(--text-3)", marginTop: "2px", letterSpacing: "0.08em" }}>
              /admin
            </p>
          </Link>

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

        {/* İçerik alanı */}
        <main style={{
          flex: 1, marginLeft: "220px",
          padding: "40px 40px 80px",
          position: "relative", zIndex: 1,
        }}>
          {children}
        </main>
      </div>

      {/* Mobil */}
      <style>{`
        @media (max-width: 640px) {
          aside { width: 100% !important; height: auto !important; position: static !important; flex-direction: row !important; padding: 12px 16px !important; gap: 8px !important; overflow-x: auto !important; }
          main { margin-left: 0 !important; padding: 16px 16px 60px !important; }
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
