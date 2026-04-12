"use client";

import { useEffect, useState } from "react";
import { getContacts, markContactRead, deleteContact } from "@/lib/firestore";
import type { ContactMessage } from "@/lib/firestore";

const CATEGORY_LABELS: Record<string, string> = {
  hi:       "💬 Selam",
  feedback: "💡 Geri Bildirim",
  rec:      "💡 Öneri",
  collab:   "🤝 İşbirliği",
  bug:      "🐛 Hata",
};

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter,   setFilter]   = useState<"all" | "unread" | "read">("all");

  const load = async () => {
    setLoading(true);
    const data = await getContacts();
    setMessages(data);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const handleToggle = async (msg: ContactMessage) => {
    if (expanded === msg.id) { setExpanded(null); return; }
    setExpanded(msg.id);
    /* Açılınca okundu işaretle */
    if (!msg.read) {
      await markContactRead(msg.id, true);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const handleToggleRead = async (e: React.MouseEvent, msg: ContactMessage) => {
    e.stopPropagation();
    await markContactRead(msg.id, !msg.read);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: !m.read } : m));
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Bu mesajı silmek istediğinden emin misin?")) return;
    await deleteContact(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read")   return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      {/* Başlık */}
      <header style={{ marginBottom: "32px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
            /admin/contacts
          </p>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Mesajlar
            {unreadCount > 0 && (
              <span style={{
                display: "inline-block", marginLeft: "12px", fontSize: "0.75rem",
                padding: "3px 10px", borderRadius: "999px",
                background: "rgba(16,185,129,0.12)", color: "var(--accent)",
                border: "1px solid rgba(16,185,129,0.3)", fontWeight: 600,
                verticalAlign: "middle",
              }}>
                {unreadCount} yeni
              </span>
            )}
          </h1>
        </div>

        {/* Filtre */}
        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 13px", borderRadius: "10px", border: "1px solid",
                borderColor: filter === f ? "var(--accent)" : "var(--border)",
                background:  filter === f ? "var(--accent-dim)" : "transparent",
                color:       filter === f ? "var(--accent)" : "var(--text-3)",
                fontSize: "0.78rem", fontWeight: 500, cursor: "pointer",
                fontFamily: "var(--font-sans)", transition: "all 0.15s",
              }}
            >
              {f === "all" ? "Tümü" : f === "unread" ? "Okunmamış" : "Okunmuş"}
            </button>
          ))}
        </div>
      </header>

      {/* Liste */}
      {loading ? (
        <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <div className="glass" style={{ borderRadius: "16px", padding: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-3)" }}>Mesaj yok.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className="glass"
              style={{
                borderRadius: "14px",
                border: !msg.read ? "1px solid rgba(16,185,129,0.25)" : "1px solid var(--border)",
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              {/* Satır başlığı */}
              <div
                onClick={() => handleToggle(msg)}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "16px 20px", cursor: "pointer",
                  background: expanded === msg.id ? "var(--panel-hover)" : "transparent",
                }}
              >
                {/* Okunmamış nokta */}
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: msg.read ? "var(--border)" : "var(--accent)",
                  boxShadow: msg.read ? "none" : "0 0 6px var(--accent-glow)",
                }} />

                {/* Ad */}
                <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", minWidth: "120px" }}>
                  {msg.name}
                </span>

                {/* Email */}
                <span style={{ fontSize: "0.78rem", color: "var(--text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {msg.email}
                </span>

                {/* Kategori */}
                <span style={{
                  fontSize: "0.72rem", padding: "3px 10px", borderRadius: "999px",
                  background: "var(--bg-2)", color: "var(--text-2)", border: "1px solid var(--border)",
                  flexShrink: 0,
                }}>
                  {CATEGORY_LABELS[msg.category] ?? msg.category}
                </span>

                {/* Tarih */}
                <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", flexShrink: 0 }}>
                  {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : "—"}
                </span>

                {/* Aksiyon butonları */}
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={(e) => handleToggleRead(e, msg)}
                    title={msg.read ? "Okunmamış yap" : "Okundu işaretle"}
                    style={{
                      padding: "5px 8px", borderRadius: "7px", border: "1px solid var(--border)",
                      background: "transparent", color: "var(--text-3)", fontSize: "0.75rem",
                      cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
                    }}
                  >
                    {msg.read ? "○" : "✓"}
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, msg.id)}
                    title="Sil"
                    style={{
                      padding: "5px 8px", borderRadius: "7px", border: "1px solid rgba(239,68,68,0.3)",
                      background: "transparent", color: "#ef4444", fontSize: "0.75rem",
                      cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Genişletilmiş mesaj içeriği */}
              {expanded === msg.id && (
                <div style={{
                  padding: "0 20px 20px 42px",
                  borderTop: "1px solid var(--border)",
                }}>
                  <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "14px 0 8px" }}>
                    Mesaj
                  </p>
                  <p style={{
                    fontSize: "0.88rem", color: "var(--text-2)", lineHeight: 1.8,
                    background: "var(--bg-2)", padding: "14px 16px",
                    borderRadius: "10px", border: "1px solid var(--border)",
                    whiteSpace: "pre-wrap",
                  }}>
                    {msg.message}
                  </p>
                  <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                      <span style={{ color: "var(--text-2)", fontWeight: 500 }}>Email: </span>
                      <a href={`mailto:${msg.email}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{msg.email}</a>
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                      <span style={{ color: "var(--text-2)", fontWeight: 500 }}>Tarih: </span>
                      {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleString("tr-TR") : "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
