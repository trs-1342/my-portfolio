"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AmbientGlow from "@/components/AmbientGlow";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  const navItems = [
    { href: "/admin",          label: "Dashboard",   icon: "⌘"  },
    { href: "/admin/contacts", label: "Mesajlar",    icon: "✉️" },
    { href: "/admin/users",    label: "Kullanıcılar", icon: "👥" },
  ];

  return (
    <>
      <AmbientGlow />

      {/* Admin sidebar / topbar */}
      <div style={{ display: "flex", minHeight: "100svh" }}>

        {/* Sol kenar çubuğu */}
        <aside style={{
          width: "220px",
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--panel)",
          backdropFilter: "blur(24px)",
          display: "flex",
          flexDirection: "column",
          padding: "28px 16px",
          gap: "4px",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
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

          {/* Nav linkleri */}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: isActive ? "var(--accent)" : "var(--text-2)",
                  background: isActive ? "var(--accent-dim)" : "transparent",
                  border: isActive ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Alt: siteye dön */}
          <div style={{ marginTop: "auto" }}>
            <Link
              href="/"
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "10px", textDecoration: "none",
                fontSize: "0.82rem", color: "var(--text-3)", transition: "color 0.15s",
              }}
            >
              ← Siteye Dön
            </Link>
          </div>
        </aside>

        {/* İçerik alanı */}
        <main style={{
          flex: 1,
          marginLeft: "220px",
          padding: "40px 40px 80px",
          position: "relative",
          zIndex: 1,
        }}>
          {children}
        </main>
      </div>

      {/* Mobil */}
      <style>{`
        @media (max-width: 640px) {
          aside { width: 100% !important; height: auto !important; position: static !important; flex-direction: row !important; padding: 12px 16px !important; gap: 8px !important; }
          aside a[style*="margin-bottom"] { margin-bottom: 0 !important; }
          main { margin-left: 0 !important; padding: 16px 16px 60px !important; }
        }
      `}</style>
    </>
  );
}
