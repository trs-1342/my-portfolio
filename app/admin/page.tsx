"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAllUsers, getContacts } from "@/lib/firestore";
import type { UserProfile, ContactMessage } from "@/lib/firestore";

export default function AdminDashboard() {
  const { profile } = useAuth();

  const [users,    setUsers]    = useState<UserProfile[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getContacts()]).then(([u, c]) => {
      setUsers(u);
      setContacts(c);
      setLoading(false);
    });
  }, []);

  const unread  = contacts.filter((c) => !c.read).length;
  const banned  = users.filter((u) => u.status === "banned").length;

  const stats = [
    { label: "Toplam Kullanıcı", value: loading ? "—" : users.filter((u) => u.role !== "admin").length.toString(), icon: "👤" },
    { label: "Okunmamış Mesaj",  value: loading ? "—" : unread.toString(),           icon: "✉️", accent: unread > 0 },
    { label: "Toplam Mesaj",     value: loading ? "—" : contacts.length.toString(),  icon: "📨" },
    { label: "Engelli Hesap",    value: loading ? "—" : banned.toString(),            icon: "🚫", accent: banned > 0 },
  ];

  /* Son 5 okunmamış mesaj */
  const recentUnread = contacts.filter((c) => !c.read).slice(0, 5);

  return (
    <div>
      {/* Başlık */}
      <header style={{ marginBottom: "36px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
          /admin
        </p>
        <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "6px" }}>
          Hoş geldin, <span style={{ color: "var(--accent)" }}>{profile?.username}</span>
        </p>
      </header>

      {/* İstatistik kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "36px" }}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass"
            style={{
              padding: "20px",
              borderRadius: "16px",
              border: s.accent ? "1px solid rgba(16,185,129,0.3)" : "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>{s.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: s.accent ? "var(--accent)" : "var(--text)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
              {s.value}
            </div>
            <div className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Alt grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Okunmamış mesajlar */}
        <div className="glass" style={{ borderRadius: "20px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Okunmamış Mesajlar
            </p>
            <Link href="/admin/contacts" style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>
              Tümü →
            </Link>
          </div>

          {loading ? (
            <p className="mono" style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>Yükleniyor...</p>
          ) : recentUnread.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Okunmamış mesaj yok. 🎉</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentUnread.map((msg) => (
                <Link
                  key={msg.id}
                  href="/admin/contacts"
                  style={{
                    display: "block", textDecoration: "none",
                    padding: "12px 14px", borderRadius: "10px",
                    border: "1px solid var(--border)", background: "var(--panel)",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text)" }}>{msg.name}</span>
                    <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
                      {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : "—"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-2)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                    {msg.message}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Son kayıtlı kullanıcılar */}
        <div className="glass" style={{ borderRadius: "20px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Son Kullanıcılar
            </p>
            <Link href="/admin/users" style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>
              Tümü →
            </Link>
          </div>

          {loading ? (
            <p className="mono" style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>Yükleniyor...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {users.slice(0, 6).map((u) => (
                <div key={u.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <span className="mono" style={{ fontSize: "0.82rem", color: "var(--text)" }}>@{u.username}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-3)", marginLeft: "8px" }}>{u.email}</span>
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: "0.65rem", padding: "2px 8px", borderRadius: "999px",
                      background: u.role === "admin" ? "rgba(16,185,129,0.12)" : "var(--bg-2)",
                      color: u.role === "admin" ? "var(--accent)" : "var(--text-3)",
                      border: `1px solid ${u.role === "admin" ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                    }}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobil */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
