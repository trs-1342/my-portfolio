"use client";

import { useEffect, useRef, useState } from "react";
import {
  getProjectsList, addProject, updateProject, deleteProject,
  getProjectsPageConfig, setProjectsPageConfig, markProjectsInitialized,
} from "@/lib/firestore";
import type { Project, ProjectsPageConfig } from "@/lib/firestore";
import { uploadFile } from "@/lib/storage";
import { DEFAULT_PROJECTS, DEFAULT_PROJECTS_PAGE } from "@/lib/site-defaults";

function genId() { return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
function toSlug(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

const EMPTY_PROJECT: Omit<Project, "id"> = {
  slug: "", emoji: "🚀", imageUrl: null, title: "", desc: "",
  longDesc: "", highlights: [], lang: "",
  repo: "", live: "", pinned: false, active: false,
  status: "Geliştiriliyor", stack: [], order: 0,
};

export default function AdminProjectsPage() {
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [pageCfg,   setPageCfg]   = useState<ProjectsPageConfig>(DEFAULT_PROJECTS_PAGE);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [showNew,   setShowNew]   = useState(false);
  const [busy,      setBusy]      = useState<string | null>(null);
  const [msgGlobal, setMsgGlobal] = useState("");
  const [savingCfg, setSavingCfg] = useState(false);

  const load = async () => {
    setLoading(true);
    const [data, cfg] = await Promise.all([getProjectsList(), getProjectsPageConfig()]);
    const raw = (data.length === 0 && !cfg?.initialized)
      ? DEFAULT_PROJECTS.map((p) => ({ ...p, id: `default-${p.slug}` }))
      : [...data].sort((a, b) => a.order - b.order);
    /* Duplicate ID'leri temizle — StrictMode çift çalışmasına karşı güvenli */
    const seen = new Set<string>();
    const deduped = raw.filter((p) => seen.has(p.id) ? false : (seen.add(p.id), true));
    setProjects(deduped);
    setPageCfg(cfg ?? DEFAULT_PROJECTS_PAGE);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = async (proj: Project, field: "pinned" | "active") => {
    if (proj.id.startsWith("default-")) {
      alert("Önce projeyi kaydet.");
      return;
    }
    setBusy(proj.id);
    const next = !proj[field];
    await updateProject(proj.id, { [field]: next });
    setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, [field]: next } : p));
    setBusy(null);
  };

  const handleDelete = async (proj: Project) => {
    if (!confirm(`"${proj.title}" projesini silmek istediğinden emin misin?`)) return;
    if (proj.id.startsWith("default-")) {
      setProjects(prev => prev.filter(p => p.id !== proj.id));
      /* Default silindi → Firestore'a initialized yaz, defaults bir daha geri gelmesin */
      await markProjectsInitialized();
      return;
    }
    setBusy(proj.id);
    try {
      await deleteProject(proj.id);
      setProjects(prev => prev.filter(p => p.id !== proj.id));
      if (expanded === proj.id) setExpanded(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Silme hatası: ${msg}`);
    } finally {
      setBusy(null);
    }
  };

  const saveOrder = async () => {
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      if (!p.id.startsWith("default-")) await updateProject(p.id, { order: i });
    }
    setMsgGlobal("Sıralama kaydedildi ✓");
    setTimeout(() => setMsgGlobal(""), 2000);
  };

  const moveProject = (id: string, dir: -1 | 1) => {
    const idx     = projects.findIndex(p => p.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= projects.length) return;
    const next = [...projects];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setProjects(next);
  };

  const savePageConfig = async () => {
    setSavingCfg(true);
    await setProjectsPageConfig(pageCfg);
    setSavingCfg(false);
    setMsgGlobal("Sayfa başlığı kaydedildi ✓");
    setTimeout(() => setMsgGlobal(""), 3000);
  };

  return (
    <div>
      <header style={{ marginBottom: "32px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
            /admin/projeler
          </p>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Projeler
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "6px" }}>
            {projects.filter(p => p.pinned).length} sabitlenmiş · {projects.filter(p => p.active).length} aktif
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setExpanded(null); }}
          style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.08)", color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}
        >
          + Yeni Proje
        </button>
      </header>

      {loading ? (
        <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
      ) : (
        <>
          {/* ── Sayfa Başlığı Yazısı ── */}
          <div className="glass" style={{ borderRadius: "16px", padding: "20px 24px", marginBottom: "24px" }}>
            <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              Sayfa Alt Yazısı
            </p>
            <textarea
              value={pageCfg.subtitle}
              onChange={e => setPageCfg({ ...pageCfg, subtitle: e.target.value })}
              rows={3}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.85rem", outline: "none", fontFamily: "var(--font-sans)", resize: "vertical", boxSizing: "border-box", marginBottom: "10px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={savePageConfig} disabled={savingCfg} className="btn btn-accent" style={{ padding: "7px 16px", fontSize: "0.82rem" }}>
                {savingCfg ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>

          {/* Yeni proje formu */}
          {showNew && (
            <div className="glass" style={{ borderRadius: "14px", padding: "20px 18px", marginBottom: "12px", border: "1px solid rgba(16,185,129,0.3)" }}>
              <ProjectForm
                initial={{ ...EMPTY_PROJECT, order: projects.length }}
                onSave={async (data) => {
                  const id = await addProject(data);
                  setProjects(prev => [...prev, { ...data, id }]);
                  setShowNew(false);
                }}
                onCancel={() => setShowNew(false)}
              />
            </div>
          )}

          {/* Proje listesi */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {projects.map((proj, i) => {
              const isBusy     = busy === proj.id;
              const isExpanded = expanded === proj.id;
              const isDefault  = proj.id.startsWith("default-");

              return (
                <div key={proj.id} className="glass" style={{ borderRadius: "14px", border: proj.pinned ? "1px solid rgba(16,185,129,0.25)" : "1px solid var(--border)", overflow: "hidden", opacity: isBusy ? 0.6 : 1, transition: "opacity 0.2s" }}>
                  {/* Satır */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", background: isExpanded ? "var(--panel-hover)" : "transparent" }}>
                    <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{proj.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>{proj.title || "(isimsiz)"}</span>
                        {isDefault && (
                          <span style={{ fontSize: "0.62rem", padding: "1px 7px", borderRadius: "999px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>varsayılan</span>
                        )}
                        {proj.imageUrl && (
                          <span style={{ fontSize: "0.62rem", padding: "1px 7px", borderRadius: "999px", background: "rgba(16,185,129,0.1)", color: "var(--accent)", border: "1px solid rgba(16,185,129,0.25)" }}>📷 fotoğraf</span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{proj.lang}</span>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <Toggle active={proj.pinned} label="📌 Sabitlenmiş" inactiveLabel="Sabitlenmiş" onClick={() => handleToggle(proj, "pinned")} disabled={isBusy} />
                      <Toggle active={proj.active} label="⚡ Aktif" inactiveLabel="Aktif" onClick={() => handleToggle(proj, "active")} disabled={isBusy} color="blue" />
                    </div>

                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      <SmBtn onClick={() => moveProject(proj.id, -1)} disabled={i === 0}>↑</SmBtn>
                      <SmBtn onClick={() => moveProject(proj.id, 1)} disabled={i === projects.length - 1}>↓</SmBtn>
                      <SmBtn onClick={() => setExpanded(isExpanded ? null : proj.id)}>✎</SmBtn>
                      <SmBtn onClick={() => handleDelete(proj)} danger>✕</SmBtn>
                    </div>
                  </div>

                  {/* Düzenleme paneli */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--border)", padding: "20px 18px" }}>
                      <ProjectForm
                        initial={proj}
                        onSave={async (data) => {
                          if (isDefault) {
                            const id = await addProject({ ...data, order: i });
                            setProjects(prev => prev.map(p => p.id === proj.id ? { ...data, id } : p));
                          } else {
                            const { id: _, ...rest } = data as Project;
                            await updateProject(proj.id, rest);
                            setProjects(prev => prev.map(p => p.id === proj.id ? { ...data, id: proj.id } : p));
                          }
                          setExpanded(null);
                        }}
                        onCancel={() => setExpanded(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Global butonlar */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px" }}>
            <button onClick={saveOrder} className="btn btn-ghost" style={{ padding: "9px 20px" }}>
              Sıralamayı Kaydet
            </button>
            {msgGlobal && <span style={{ fontSize: "0.8rem", color: "#10B981" }}>{msgGlobal}</span>}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────── Proje Formu ─────────── */
function ProjectForm({ initial, onSave, onCancel }: {
  initial: Omit<Project, "id"> | Project;
  onSave: (data: Omit<Project, "id"> | Project) => void;
  onCancel: () => void;
}) {
  const [v,         setV]         = useState(initial);
  const [stackStr,  setStackStr]  = useState((initial.stack ?? []).join(", "));
  const [hiStr,     setHiStr]     = useState((initial.highlights ?? []).join("\n"));
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Slug otomatik doldur */
  const handleTitleChange = (title: string) => {
    const autoSlug = !v.slug || v.slug === toSlug((v as { title: string }).title ?? "");
    setV({ ...v, title, slug: autoSlug ? toSlug(title) : v.slug });
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const path = `projects/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const url = await uploadFile(path, file);
      setV(prev => ({ ...prev, imageUrl: url }));
    } catch {
      alert("Yükleme hatası. Firebase Storage kurallarını kontrol et.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave({
      ...v,
      stack:      stackStr.split(",").map(s => s.trim()).filter(Boolean),
      highlights: hiStr.split("\n").map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr", gap: "12px" }}>
        <div><FL>Emoji</FL><input value={v.emoji} onChange={e => setV({ ...v, emoji: e.target.value })} style={IS} /></div>
        <div><FL>Başlık</FL><input value={v.title} onChange={e => handleTitleChange(e.target.value)} style={IS} /></div>
        <div><FL>Slug (URL)</FL><input value={v.slug ?? ""} onChange={e => setV({ ...v, slug: e.target.value })} placeholder="my-project" style={IS} /></div>
        <div><FL>Durum</FL>
          <select value={v.status} onChange={e => setV({ ...v, status: e.target.value })} style={{ ...IS, cursor: "pointer" }}>
            <option value="Geliştiriliyor">Geliştiriliyor</option>
            <option value="Planlama">Planlama</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Duraklatıldı">Duraklatıldı</option>
          </select>
        </div>
      </div>

      {/* Fotoğraf yükleme */}
      <div>
        <FL>Kapak Fotoğrafı</FL>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {v.imageUrl ? (
            <>
              <span style={{ fontSize: "0.78rem", color: "var(--accent)" }}>✓ Yüklendi</span>
              <button onClick={() => setV({ ...v, imageUrl: null })} style={{ fontSize: "0.72rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ Kaldır</button>
            </>
          ) : (
            <span style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>Fotoğraf yok — emoji gösterilecek</span>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ padding: "5px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-2)", color: "var(--text-2)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
          >
            {uploading ? "Yükleniyor..." : "📷 Fotoğraf Seç"}
          </button>
        </div>
      </div>

      <div><FL>Kısa Açıklama</FL><textarea value={v.desc} onChange={e => setV({ ...v, desc: e.target.value })} rows={2} style={{ ...IS, resize: "vertical" }} /></div>
      <div><FL>Uzun Açıklama (Detay Sayfası)</FL><textarea value={v.longDesc ?? ""} onChange={e => setV({ ...v, longDesc: e.target.value })} rows={3} style={{ ...IS, resize: "vertical" }} /></div>
      <div><FL>Öne Çıkanlar (her satır bir madde)</FL><textarea value={hiStr} onChange={e => setHiStr(e.target.value)} rows={3} style={{ ...IS, resize: "vertical" }} placeholder="Firebase Auth entegrasyonu&#10;Vercel deploy&#10;Admin paneli" /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div><FL>Repo URL</FL><input value={v.repo} onChange={e => setV({ ...v, repo: e.target.value })} placeholder="https://github.com/..." style={IS} /></div>
        <div><FL>Canlı URL (opsiyonel)</FL><input value={v.live ?? ""} onChange={e => setV({ ...v, live: e.target.value || null })} placeholder="https://..." style={IS} /></div>
      </div>
      <div><FL>Dil / Teknoloji (görünen etiket)</FL><input value={v.lang} onChange={e => setV({ ...v, lang: e.target.value })} placeholder="TypeScript | Next.js" style={IS} /></div>
      <div><FL>Stack (virgülle ayır)</FL><input value={stackStr} onChange={e => setStackStr(e.target.value)} placeholder="Next.js, Firebase, TypeScript" style={IS} /></div>

      <div style={{ display: "flex", gap: "16px" }}>
        <CheckField label="📌 Sabitlenmiş (Anasayfa)" checked={v.pinned} onChange={c => setV({ ...v, pinned: c })} />
        <CheckField label="⚡ Aktif (Projelerim)" checked={v.active} onChange={c => setV({ ...v, active: c })} />
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <button onClick={handleSave} className="btn btn-accent" style={{ padding: "9px 20px" }}>Kaydet</button>
        <button onClick={onCancel}   className="btn btn-ghost"  style={{ padding: "9px 16px" }}>İptal</button>
      </div>
    </div>
  );
}

function FL({ children }: { children: React.ReactNode }) {
  return <label className="mono" style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>{children}</label>;
}
function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.82rem", color: "var(--text-2)" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 15, height: 15, accentColor: "var(--accent)" }} />
      {label}
    </label>
  );
}
function Toggle({ active, label, inactiveLabel, onClick, disabled, color = "green" }: {
  active: boolean; label: string; inactiveLabel: string;
  onClick: () => void; disabled?: boolean; color?: "green" | "blue";
}) {
  const c = color === "green"
    ? { a: "rgba(16,185,129,0.3)", b: "rgba(16,185,129,0.1)", t: "var(--accent)" }
    : { a: "rgba(59,130,246,0.3)", b: "rgba(59,130,246,0.1)", t: "#60a5fa" };
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: "4px 10px", borderRadius: "999px", border: "1px solid", borderColor: active ? c.a : "var(--border)", background: active ? c.b : "transparent", color: active ? c.t : "var(--text-3)", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
      {active ? label : inactiveLabel}
    </button>
  );
}
function SmBtn({ onClick, disabled, danger, children }: { onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 28, height: 28, borderRadius: "7px", border: "1px solid", borderColor: danger ? "rgba(239,68,68,0.3)" : "var(--border)", background: "transparent", color: danger ? "#ef4444" : disabled ? "var(--text-3)" : "var(--text-2)", fontSize: "0.8rem", cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.35 : 1, fontFamily: "var(--font-sans)" }}>
      {children}
    </button>
  );
}

const IS: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.85rem", outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" };
