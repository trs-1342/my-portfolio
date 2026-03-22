"use client";

import { useEffect, useState } from "react";
import { getFooterConfig, setFooterConfig, FooterConfig, FooterLink } from "@/lib/firestore";

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

interface LinkForm { label: string; href: string; icon: string }

/* ══════════════════════════════════════════ */
export default function AdminFooterPage() {
  const [cfg,     setCfg]     = useState<FooterConfig | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  /* Link modal state */
  const [modal, setModal] = useState<{
    section: "socials" | "pages";
    mode: "add" | "edit";
    id?: string;
    form: LinkForm;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ section: "socials" | "pages"; id: string } | null>(null);

  useEffect(() => {
    getFooterConfig().then(setCfg);
  }, []);

  const persist = async (next: FooterConfig) => {
    setSaving(true); setMsg("");
    try {
      await setFooterConfig(next);
      setCfg(next);
      setMsg("Kaydedildi.");
      setTimeout(() => setMsg(""), 2500);
    } catch {
      setMsg("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Metin alanlarını kaydet ── */
  const handleSaveText = () => {
    if (!cfg) return;
    persist(cfg);
  };

  /* ── Link ekle/düzenle ── */
  const saveLink = async () => {
    if (!modal || !cfg) return;
    const { label, href, icon } = modal.form;
    if (!label.trim() || !href.trim()) return;

    const sec = modal.section;
    let links: FooterLink[];

    if (modal.mode === "add") {
      const newLink: FooterLink = { id: genId(), label: label.trim(), href: href.trim(), icon: icon.trim() || undefined, order: cfg[sec].length };
      links = [...cfg[sec], newLink];
    } else {
      links = cfg[sec].map((l) =>
        l.id !== modal.id ? l : { ...l, label: label.trim(), href: href.trim(), icon: icon.trim() || undefined }
      );
    }

    await persist({ ...cfg, [sec]: links });
    setModal(null);
  };

  /* ── Link sil ── */
  const deleteLink = async () => {
    if (!deleteTarget || !cfg) return;
    const { section, id } = deleteTarget;
    const links = cfg[section].filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i }));
    await persist({ ...cfg, [section]: links });
    setDeleteTarget(null);
  };

  /* ── Link sırala ── */
  const moveLink = async (section: "socials" | "pages", id: string, dir: -1 | 1) => {
    if (!cfg) return;
    const arr = [...cfg[section]].sort((a, b) => a.order - b.order);
    const idx = arr.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const ni = idx + dir;
    if (ni < 0 || ni >= arr.length) return;
    [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
    await persist({ ...cfg, [section]: arr.map((l, i) => ({ ...l, order: i })) });
  };

  if (!cfg) {
    return <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>;
  }

  const sorted = (links: FooterLink[]) => [...links].sort((a, b) => a.order - b.order);

  return (
    <div style={{ maxWidth: "640px" }}>
      {/* Header */}
      <header style={{ marginBottom: "32px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
          /admin/footer
        </p>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Footer
        </h1>
      </header>

      {msg && (
        <p style={{ fontSize: "0.82rem", color: msg === "Kaydedildi." ? "#10B981" : "#ef4444", marginBottom: "16px" }}>
          {msg}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── Metin ── */}
        <section className="glass" style={{ borderRadius: "16px", padding: "24px" }}>
          <SectionTitle>Genel</SectionTitle>

          <Field label="Motto">
            <input
              value={cfg.motto}
              onChange={(e) => setCfg({ ...cfg, motto: e.target.value })}
              style={inputStyle}
            />
          </Field>

          <div style={{ height: 14 }} />

          <Field label="Copyright">
            <input
              value={cfg.copyright}
              onChange={(e) => setCfg({ ...cfg, copyright: e.target.value })}
              style={inputStyle}
            />
          </Field>

          <button
            onClick={handleSaveText}
            disabled={saving}
            className="btn btn-accent"
            style={{ marginTop: "16px", padding: "9px 20px", fontSize: "0.85rem", justifyContent: "center" }}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </section>

        {/* ── Sosyal Linkler ── */}
        <LinkSection
          title="Sosyal Linkler"
          links={sorted(cfg.socials)}
          onAdd={() => setModal({ section: "socials", mode: "add", form: { label: "", href: "", icon: "" } })}
          onEdit={(l) => setModal({ section: "socials", mode: "edit", id: l.id, form: { label: l.label, href: l.href, icon: l.icon ?? "" } })}
          onDelete={(l) => setDeleteTarget({ section: "socials", id: l.id })}
          onMove={(id, dir) => moveLink("socials", id, dir)}
          count={cfg.socials.length}
          showIcon
        />

        {/* ── Sayfa Linkleri ── */}
        <LinkSection
          title="Sayfa Linkleri"
          links={sorted(cfg.pages)}
          onAdd={() => setModal({ section: "pages", mode: "add", form: { label: "", href: "", icon: "" } })}
          onEdit={(l) => setModal({ section: "pages", mode: "edit", id: l.id, form: { label: l.label, href: l.href, icon: l.icon ?? "" } })}
          onDelete={(l) => setDeleteTarget({ section: "pages", id: l.id })}
          onMove={(id, dir) => moveLink("pages", id, dir)}
          count={cfg.pages.length}
          showIcon={false}
        />
      </div>

      {/* ── Link Modal ── */}
      {modal && (
        <Modal title={modal.mode === "add" ? "Link Ekle" : "Linki Düzenle"} onClose={() => setModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); saveLink(); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Field label="Etiket">
              <input
                autoFocus required value={modal.form.label}
                onChange={(e) => setModal((p) => p ? { ...p, form: { ...p.form, label: e.target.value } } : null)}
                placeholder="GitHub"
                style={inputStyle}
              />
            </Field>
            <Field label="URL">
              <input
                required value={modal.form.href}
                onChange={(e) => setModal((p) => p ? { ...p, form: { ...p.form, href: e.target.value } } : null)}
                placeholder="https://... veya /sayfa"
                style={inputStyle}
              />
            </Field>
            {modal.section === "socials" && (
              <Field label="İkon (emoji)">
                <input
                  value={modal.form.icon} maxLength={4}
                  onChange={(e) => setModal((p) => p ? { ...p, form: { ...p.form, icon: e.target.value } } : null)}
                  placeholder="⌨️"
                  style={{ ...inputStyle, width: "80px" }}
                />
              </Field>
            )}
            <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
              <button type="submit" disabled={saving} className="btn btn-accent" style={{ flex: 1, padding: "10px", fontSize: "0.85rem", justifyContent: "center" }}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button type="button" onClick={() => setModal(null)} className="btn btn-ghost" style={{ padding: "10px 16px", fontSize: "0.85rem" }}>
                İptal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Silme Onayı ── */}
      {deleteTarget && (
        <Modal title="Sil?" onClose={() => setDeleteTarget(null)}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-2)", marginBottom: "20px" }}>Bu link kalıcı olarak silinecek.</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={deleteLink} disabled={saving} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.12)", color: "#ef4444", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              Sil
            </button>
            <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost" style={{ padding: "9px 16px", fontSize: "0.85rem" }}>
              İptal
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Alt bileşenler ── */

function LinkSection({
  title, links, onAdd, onEdit, onDelete, onMove, count, showIcon,
}: {
  title: string;
  links: FooterLink[];
  onAdd: () => void;
  onEdit: (l: FooterLink) => void;
  onDelete: (l: FooterLink) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  count: number;
  showIcon: boolean;
}) {
  return (
    <section className="glass" style={{ borderRadius: "16px", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <SectionTitle>{title}</SectionTitle>
        <button onClick={onAdd} className="btn btn-accent" style={{ padding: "7px 14px", fontSize: "0.8rem" }}>
          + Ekle
        </button>
      </div>

      {links.length === 0 ? (
        <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Henüz link eklenmedi.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {links.map((l, i) => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "10px", background: "var(--bg-2)" }}>
              {showIcon && l.icon && <span style={{ fontSize: "1rem", flexShrink: 0 }}>{l.icon}</span>}
              <span style={{ fontWeight: 500, fontSize: "0.87rem", color: "var(--text)", flex: 1 }}>{l.label}</span>
              <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.href}</span>
              <div style={{ display: "flex", gap: "2px" }}>
                <IBtn title="Yukarı"  disabled={i === 0}          onClick={() => onMove(l.id, -1)}>↑</IBtn>
                <IBtn title="Aşağı"   disabled={i === count - 1}  onClick={() => onMove(l.id,  1)}>↓</IBtn>
                <IBtn title="Düzenle" onClick={() => onEdit(l)}>✎</IBtn>
                <IBtn title="Sil"     danger onClick={() => onDelete(l)}>🗑</IBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid var(--border)", background: "var(--bg)",
  color: "var(--text)", fontFamily: "var(--font-sans)",
  fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 0 }}>
      {children}
    </p>
  );
}

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
      <div className="glass" style={{ borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "440px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: "1.1rem", cursor: "pointer", padding: "4px 8px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function IBtn({ children, title, onClick, disabled, danger }: {
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
