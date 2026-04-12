"use client";

import { useEffect, useState } from "react";
import { getMenuItems, setMenuItems } from "@/lib/firestore";
import type { MenuItem } from "@/lib/firestore";
import { DEFAULT_MENU } from "@/lib/site-defaults";
import ThemeToggle from "@/components/ThemeToggle";

function genId() { return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

function moveItem(list: MenuItem[], id: string, dir: -1 | 1): MenuItem[] {
  const sorted  = [...list].sort((a, b) => a.order - b.order);
  const idx     = sorted.findIndex(x => x.id === id);
  const swapIdx = idx + dir;
  if (swapIdx < 0 || swapIdx >= sorted.length) return sorted;
  const tmp         = sorted[idx].order;
  sorted[idx]       = { ...sorted[idx],     order: sorted[swapIdx].order };
  sorted[swapIdx]   = { ...sorted[swapIdx], order: tmp };
  return sorted.sort((a, b) => a.order - b.order);
}

export default function AdminPagesPage() {
  const [items,   setItems]   = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(() => {
    getMenuItems().then(data => {
      setItems([...(data ?? DEFAULT_MENU)].sort((a, b) => a.order - b.order));
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true); setMsg("");
    await setMenuItems(items);
    setSaving(false);
    setMsg("Kaydedildi ✓ — Navbar bir sonraki yüklemede güncellenir.");
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      <header style={{ marginBottom: "32px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
          /admin/pages
        </p>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Menü & Tema
        </h1>
      </header>

      {/* ── Navbar Menüsü ── */}
      <div className="glass" style={{ borderRadius: "16px", padding: "24px 28px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Navbar Menüsü
          </p>
          <button
            onClick={() => { setShowNew(true); setEditId(null); }}
            style={{
              padding: "5px 12px", borderRadius: "8px",
              border: "1px solid rgba(16,185,129,0.35)",
              background: "rgba(16,185,129,0.08)",
              color: "var(--accent)", fontSize: "0.78rem",
              cursor: "pointer", fontFamily: "var(--font-sans)",
            }}
          >
            + Ekle
          </button>
        </div>

        {loading ? (
          <p className="mono" style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>Yükleniyor...</p>
        ) : (
          <>
            {showNew && (
              <MenuItemForm
                initial={{ id: genId(), href: "", label: "", icon: "⭐", order: items.length }}
                onSave={(item) => { setItems([...items, item]); setShowNew(false); }}
                onCancel={() => setShowNew(false)}
              />
            )}

            {items.map((item, i) => (
              <div key={item.id}>
                {editId === item.id ? (
                  <MenuItemForm
                    initial={item}
                    onSave={(updated) => { setItems(items.map(x => x.id === updated.id ? updated : x)); setEditId(null); }}
                    onCancel={() => setEditId(null)}
                  />
                ) : (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "10px", marginBottom: "6px",
                    border: "1px solid var(--border)", background: "var(--bg-2)",
                  }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-3)", marginLeft: "8px" }}>{item.href}</span>
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      {[
                        { onClick: i > 0 ? () => setItems(moveItem(items, item.id, -1)) : undefined, disabled: i === 0, label: "↑" },
                        { onClick: i < items.length - 1 ? () => setItems(moveItem(items, item.id, 1)) : undefined, disabled: i === items.length - 1, label: "↓" },
                        { onClick: () => setEditId(item.id), label: "✎" },
                        { onClick: () => setItems(items.filter(x => x.id !== item.id)), label: "✕", danger: true },
                      ].map((b, bi) => (
                        <button key={bi} onClick={b.onClick} disabled={b.disabled} style={{
                          width: 28, height: 28, borderRadius: "7px", border: "1px solid",
                          borderColor: b.danger ? "rgba(239,68,68,0.3)" : "var(--border)",
                          background: "transparent",
                          color: b.danger ? "#ef4444" : b.disabled ? "var(--text-3)" : "var(--text-2)",
                          fontSize: "0.8rem", cursor: b.disabled ? "default" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: b.disabled ? 0.35 : 1, fontFamily: "var(--font-sans)",
                        }}>{b.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
              <button onClick={save} disabled={saving} className="btn btn-accent" style={{ padding: "9px 20px" }}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              {msg && <span style={{ fontSize: "0.78rem", color: "#10B981" }}>{msg}</span>}
            </div>
          </>
        )}
      </div>

      {/* ── Tema ── */}
      <div className="glass" style={{ borderRadius: "16px", padding: "24px 28px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
          Tema
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ThemeToggle />
          <span style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
            Değişiklik anında uygulanır ve localStorage{"'"}e kaydedilir.
          </span>
        </div>
      </div>
    </div>
  );
}

function MenuItemForm({ initial, onSave, onCancel }: {
  initial: MenuItem; onSave: (item: MenuItem) => void; onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <div style={{ padding: "12px", border: "1px solid var(--accent)", borderRadius: "10px", marginBottom: "8px", background: "var(--bg-2)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        <div>
          <label className="mono" style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>İkon</label>
          <input value={v.icon} onChange={e => setV({ ...v, icon: e.target.value })} style={IS} />
        </div>
        <div>
          <label className="mono" style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>Etiket</label>
          <input value={v.label} onChange={e => setV({ ...v, label: e.target.value })} placeholder="Hakkımda" style={IS} />
        </div>
        <div>
          <label className="mono" style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>URL</label>
          <input value={v.href} onChange={e => setV({ ...v, href: e.target.value })} placeholder="/about" style={IS} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => onSave(v)} className="btn btn-accent" style={{ padding: "7px 16px", fontSize: "0.8rem" }}>Tamam</button>
        <button onClick={onCancel} className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: "0.8rem" }}>İptal</button>
      </div>
    </div>
  );
}

const IS: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.85rem", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" };
