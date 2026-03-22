"use client";

import { useEffect, useState } from "react";
import {
  getThanksCategories, setThanksCategories,
  ThanksCategory, ThanksPerson,
} from "@/lib/firestore";

/* ── Sabitler ── */

const ICON_OPTIONS = [
  "🤍","👤","🌐","🏫","🎓","💼","🌱","⭐","🔥","💡",
  "🎯","🏆","👥","🤝","💬","🎨","💻","🚀","🌍","❤️",
  "💙","💚","💛","💜","🎵","📚","🏋️","🍀","🙏","✨",
];

const COLOR_MAP: Record<string, string> = {
  red: "#ef4444", green: "#10B981", blue: "#3b82f6",
  yellow: "#f59e0b", purple: "#a855f7", orange: "#f97316", pink: "#ec4899",
};

function resolveColor(c: string): string {
  if (!c) return "#10B981";
  if (c.startsWith("#")) return c;
  return COLOR_MAP[c.toLowerCase()] ?? "#10B981";
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ── Form tipleri ── */
interface CatForm  { title: string; icon: string }
interface PersonForm {
  name: string; message: string;
  color: string; url: string; highlight: boolean;
}

/* ══════════════════════════════════════════ */
export default function AdminThanksPage() {
  const [cats,       setCats]       = useState<ThanksCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [importing,  setImporting]  = useState(false);
  const [importMsg,  setImportMsg]  = useState("");

  /* Modal state'leri */
  const [catModal, setCatModal] = useState<{
    mode: "add" | "edit"; id?: string; form: CatForm;
  } | null>(null);

  const [personModal, setPersonModal] = useState<{
    mode: "add" | "edit"; catId: string; personId?: string; form: PersonForm;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null); // catId veya "catId:personId"
  const [expanded,     setExpanded]     = useState<Set<string>>(new Set());

  /* ── Yükleme ── */
  useEffect(() => {
    getThanksCategories().then((data) => {
      setCats(data);
      setLoading(false);
      /* Hepsini açık başlat */
      setExpanded(new Set(data.map((c) => c.id)));
    });
  }, []);

  /* ── JSON İçe Aktar ── */
  const handleImport = async () => {
    if (!confirm("thanks-old.json'daki tüm veri Firestore'a aktarılacak. Mevcut verinin üzerine yazılacak. Devam et?")) return;
    setImporting(true); setImportMsg(""); setError("");
    try {
      const res  = await fetch("/api/admin/import-thanks", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hata");
      setImportMsg(`✓ ${data.categories} kategori, ${data.people} kişi aktarıldı.`);
      /* Listeyi yenile */
      const fresh = await getThanksCategories();
      setCats(fresh);
      setExpanded(new Set(fresh.map((c) => c.id)));
    } catch (e: unknown) {
      setError((e as Error).message ?? "İçe aktarma başarısız.");
    } finally {
      setImporting(false);
    }
  };

  /* ── Kaydetme ── */
  const persist = async (next: ThanksCategory[]) => {
    setSaving(true); setError("");
    try {
      await setThanksCategories(next);
      setCats(next);
    } catch {
      setError("Kaydedilemedi. Tekrar dene.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Kategori işlemleri ── */
  const saveCat = async () => {
    if (!catModal) return;
    const { title, icon } = catModal.form;
    if (!title.trim()) return;

    let next: ThanksCategory[];
    if (catModal.mode === "add") {
      const cat: ThanksCategory = {
        id: genId(), title: title.trim(),
        icon: icon || "🤍", order: cats.length, people: [],
      };
      next = [...cats, cat];
      setExpanded((p) => new Set([...p, cat.id]));
    } else {
      next = cats.map((c) =>
        c.id === catModal.id ? { ...c, title: title.trim(), icon: icon || c.icon } : c
      );
    }
    await persist(next);
    setCatModal(null);
  };

  const deleteCat = async (id: string) => {
    await persist(cats.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })));
    setDeleteTarget(null);
  };

  const moveCat = async (id: string, dir: -1 | 1) => {
    const idx = cats.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const ni = idx + dir;
    if (ni < 0 || ni >= cats.length) return;
    const arr = [...cats];
    [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
    await persist(arr.map((c, i) => ({ ...c, order: i })));
  };

  /* ── Kişi işlemleri ── */
  const savePerson = async () => {
    if (!personModal) return;
    const { name, message, color, url, highlight } = personModal.form;
    if (!name.trim()) return;

    const c = resolveColor(color);
    let next: ThanksCategory[];

    if (personModal.mode === "add") {
      const person: ThanksPerson = {
        id: genId(), name: name.trim(), message: message.trim(),
        color: c, url: url.trim() || null, highlight, order: 0,
      };
      next = cats.map((cat) => {
        if (cat.id !== personModal.catId) return cat;
        const people = [...cat.people, { ...person, order: cat.people.length }];
        return { ...cat, people };
      });
    } else {
      next = cats.map((cat) => {
        if (cat.id !== personModal.catId) return cat;
        return {
          ...cat,
          people: cat.people.map((p) =>
            p.id !== personModal.personId ? p
              : { ...p, name: name.trim(), message: message.trim(), color: c, url: url.trim() || null, highlight }
          ),
        };
      });
    }
    await persist(next);
    setPersonModal(null);
  };

  const deletePerson = async (catId: string, personId: string) => {
    const next = cats.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        people: cat.people.filter((p) => p.id !== personId).map((p, i) => ({ ...p, order: i })),
      };
    });
    await persist(next);
    setDeleteTarget(null);
  };

  const movePerson = async (catId: string, personId: string, dir: -1 | 1) => {
    const cat = cats.find((c) => c.id === catId);
    if (!cat) return;
    const idx = cat.people.findIndex((p) => p.id === personId);
    if (idx < 0) return;
    const ni = idx + dir;
    if (ni < 0 || ni >= cat.people.length) return;
    const arr = [...cat.people];
    [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
    const next = cats.map((c) =>
      c.id === catId ? { ...c, people: arr.map((p, i) => ({ ...p, order: i })) } : c
    );
    await persist(next);
  };

  /* ── Toggle expand ── */
  const toggle = (id: string) =>
    setExpanded((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  /* ── Render ── */
  if (loading) {
    return <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>;
  }

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Header */}
      <header style={{ marginBottom: "32px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
            /admin/teşekkürler
          </p>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Teşekkürler
          </h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleImport}
            disabled={importing || saving}
            className="btn btn-ghost"
            style={{ padding: "9px 16px", fontSize: "0.82rem" }}
            title="thanks-old.json verisini Firebase'e aktar"
          >
            ↓ JSON Aktar
          </button>
          <button
            onClick={() => setCatModal({ mode: "add", form: { title: "", icon: "🤍" } })}
            className="btn btn-accent"
            style={{ padding: "9px 18px", fontSize: "0.85rem" }}
          >
            + Kategori Ekle
          </button>
        </div>
      </header>

      {saving    && <p className="mono" style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "12px" }}>Kaydediliyor...</p>}
      {importing && <p className="mono" style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "12px" }}>Aktarılıyor...</p>}
      {importMsg && <p style={{ fontSize: "0.82rem", color: "#10B981", marginBottom: "12px" }}>{importMsg}</p>}
      {error     && <p style={{ fontSize: "0.82rem", color: "#ef4444", marginBottom: "12px" }}>{error}</p>}

      {/* Kategori listesi */}
      {cats.length === 0 ? (
        <div className="glass" style={{ borderRadius: "16px", padding: "40px", textAlign: "center" }}>
          <p style={{ color: "var(--text-3)", fontSize: "0.88rem" }}>Henüz kategori eklenmedi.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {cats.map((cat, ci) => (
            <div key={cat.id} className="glass" style={{ borderRadius: "16px", overflow: "hidden" }}>

              {/* Kategori başlığı */}
              <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{cat.icon}</span>
                <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text)", flex: 1 }}>{cat.title}</span>
                <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>{cat.people.length} kişi</span>
                <div style={{ display: "flex", gap: "3px" }}>
                  <IBtn title="Yukarı"  disabled={ci === 0}              onClick={() => moveCat(cat.id, -1)}>↑</IBtn>
                  <IBtn title="Aşağı"   disabled={ci === cats.length-1}  onClick={() => moveCat(cat.id,  1)}>↓</IBtn>
                  <IBtn title="Düzenle" onClick={() => setCatModal({ mode: "edit", id: cat.id, form: { title: cat.title, icon: cat.icon } })}>✎</IBtn>
                  <IBtn title="Sil"     danger onClick={() => setDeleteTarget(cat.id)}>🗑</IBtn>
                  <IBtn title={expanded.has(cat.id) ? "Kapat" : "Aç"} onClick={() => toggle(cat.id)}>
                    {expanded.has(cat.id) ? "▲" : "▼"}
                  </IBtn>
                </div>
              </div>

              {/* Kişiler */}
              {expanded.has(cat.id) && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "12px 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {cat.people.length === 0 && (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-3)", padding: "2px 0" }}>Bu kategoride henüz kişi yok.</p>
                  )}

                  {cat.people.map((p, pi) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "10px", background: "var(--bg-2)" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: resolveColor(p.color), flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, fontSize: "0.87rem", color: "var(--text)", flex: 1 }}>{p.name}</span>
                      {p.highlight && <span className="mono" style={{ fontSize: "0.62rem", color: "var(--accent)", background: "var(--accent-dim)", padding: "2px 6px", borderRadius: "999px" }}>★</span>}
                      {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="mono" style={{ fontSize: "0.7rem", color: "var(--accent)" }}>↗</a>}
                      <div style={{ display: "flex", gap: "2px" }}>
                        <IBtn title="Yukarı" disabled={pi === 0}                   onClick={() => movePerson(cat.id, p.id, -1)}>↑</IBtn>
                        <IBtn title="Aşağı"  disabled={pi === cat.people.length-1} onClick={() => movePerson(cat.id, p.id,  1)}>↓</IBtn>
                        <IBtn title="Düzenle" onClick={() => setPersonModal({ mode: "edit", catId: cat.id, personId: p.id, form: { name: p.name, message: p.message, color: resolveColor(p.color), url: p.url ?? "", highlight: p.highlight } })}>✎</IBtn>
                        <IBtn title="Sil" danger onClick={() => setDeleteTarget(`${cat.id}:${p.id}`)}>🗑</IBtn>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setPersonModal({ mode: "add", catId: cat.id, form: { name: "", message: "", color: "#10B981", url: "", highlight: false } })}
                    style={{ alignSelf: "flex-start", marginTop: "4px", padding: "6px 14px", borderRadius: "8px", border: "1px dashed var(--border)", background: "transparent", color: "var(--text-3)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
                  >
                    + Kişi Ekle
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Kategori Modal ── */}
      {catModal && (
        <Modal title={catModal.mode === "add" ? "Kategori Ekle" : "Kategoriyi Düzenle"} onClose={() => setCatModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); saveCat(); }} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            <Field label="Başlık">
              <input
                autoFocus value={catModal.form.title} required
                onChange={(e) => setCatModal((p) => p ? { ...p, form: { ...p.form, title: e.target.value } } : null)}
                placeholder="Arkadaşlar"
                style={inputStyle}
              />
            </Field>

            <Field label="İkon">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "4px", marginBottom: "8px" }}>
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic} type="button"
                    onClick={() => setCatModal((p) => p ? { ...p, form: { ...p.form, icon: ic } } : null)}
                    style={{ fontSize: "1rem", padding: "5px", borderRadius: "7px", border: catModal.form.icon === ic ? "2px solid var(--accent)" : "2px solid var(--border)", background: catModal.form.icon === ic ? "var(--accent-dim)" : "transparent", cursor: "pointer" }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
              <input
                type="text" value={catModal.form.icon} maxLength={4}
                onChange={(e) => setCatModal((p) => p ? { ...p, form: { ...p.form, icon: e.target.value } } : null)}
                placeholder="Özel emoji"
                style={{ ...inputStyle, width: "100px" }}
              />
            </Field>

            <ModalActions onCancel={() => setCatModal(null)} saving={saving} />
          </form>
        </Modal>
      )}

      {/* ── Kişi Modal ── */}
      {personModal && (
        <Modal title={personModal.mode === "add" ? "Kişi Ekle" : "Kişiyi Düzenle"} onClose={() => setPersonModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); savePerson(); }} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            <Field label="Ad">
              <input
                autoFocus value={personModal.form.name} required
                onChange={(e) => setPersonModal((p) => p ? { ...p, form: { ...p.form, name: e.target.value } } : null)}
                placeholder="Ozan"
                style={inputStyle}
              />
            </Field>

            <Field label="Mesaj">
              <textarea
                value={personModal.form.message} rows={3}
                onChange={(e) => setPersonModal((p) => p ? { ...p, form: { ...p.form, message: e.target.value } } : null)}
                placeholder="Yazılımda bana fikir ve katkı sağladı."
                style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
              />
            </Field>

            <Field label="Renk">
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="color"
                  value={personModal.form.color.startsWith("#") && personModal.form.color.length === 7 ? personModal.form.color : "#10B981"}
                  onChange={(e) => setPersonModal((p) => p ? { ...p, form: { ...p.form, color: e.target.value } } : null)}
                  style={{ width: 42, height: 38, padding: 2, borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", background: "transparent", flexShrink: 0 }}
                />
                <input
                  type="text" value={personModal.form.color} maxLength={7}
                  onChange={(e) => setPersonModal((p) => p ? { ...p, form: { ...p.form, color: e.target.value } } : null)}
                  placeholder="#10B981"
                  style={{ ...inputStyle, flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
                />
              </div>
            </Field>

            <Field label="Bağlantı (isteğe bağlı)">
              <input
                type="url" value={personModal.form.url}
                onChange={(e) => setPersonModal((p) => p ? { ...p, form: { ...p.form, url: e.target.value } } : null)}
                placeholder="https://..."
                style={inputStyle}
              />
            </Field>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox" checked={personModal.form.highlight}
                onChange={(e) => setPersonModal((p) => p ? { ...p, form: { ...p.form, highlight: e.target.checked } } : null)}
              />
              <span style={{ fontSize: "0.87rem", color: "var(--text-2)" }}>Öne çıkar (★ — isim renkli, bio italik)</span>
            </label>

            <ModalActions onCancel={() => setPersonModal(null)} saving={saving} />
          </form>
        </Modal>
      )}

      {/* ── Silme Onayı ── */}
      {deleteTarget && (
        <Modal title="Silmek istiyor musun?" onClose={() => setDeleteTarget(null)}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-2)", marginBottom: "20px", lineHeight: 1.6 }}>
            {deleteTarget.includes(":") ? (
              "Bu kişi kalıcı olarak silinecek."
            ) : (() => {
              const cat = cats.find((c) => c.id === deleteTarget);
              const n   = cat?.people.length ?? 0;
              return n > 0
                ? `"${cat?.title}" kategorisi ve içindeki ${n} kişi kalıcı olarak silinecek.`
                : `"${cat?.title}" kategorisi silinecek.`;
            })()}
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                if (deleteTarget.includes(":")) {
                  const [cid, pid] = deleteTarget.split(":");
                  deletePerson(cid, pid);
                } else {
                  deleteCat(deleteTarget);
                }
              }}
              disabled={saving}
              style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.12)", color: "#ef4444", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              Sil
            </button>
            <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost" style={{ padding: "9px 18px", fontSize: "0.85rem" }}>
              İptal
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Yardımcı bileşenler ── */

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid var(--border)", background: "var(--bg)",
  color: "var(--text)", fontFamily: "var(--font-sans)",
  fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mono" style={{ fontSize: "0.67rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "7px" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass" style={{ borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: "1.1rem", cursor: "pointer", padding: "4px 8px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, saving }: { onCancel: () => void; saving: boolean }) {
  return (
    <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
      <button type="submit" disabled={saving} className="btn btn-accent" style={{ padding: "10px 20px", fontSize: "0.85rem", flex: 1, justifyContent: "center" }}>
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
      <button type="button" onClick={onCancel} className="btn btn-ghost" style={{ padding: "10px 16px", fontSize: "0.85rem" }}>
        İptal
      </button>
    </div>
  );
}

function IBtn({
  children, title, onClick, disabled, danger,
}: {
  children: React.ReactNode; title: string;
  onClick: () => void; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button
      title={title} onClick={onClick} disabled={disabled}
      style={{
        width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "7px", border: "1px solid var(--border)", background: "transparent",
        color: danger ? "#ef4444" : "var(--text-3)",
        fontSize: "0.82rem", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1, transition: "all 0.12s",
      }}
    >
      {children}
    </button>
  );
}
