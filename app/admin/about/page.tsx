"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAboutConfig, setAboutConfig,
  getLifeEvents, setLifeEvents,
} from "@/lib/firestore";
import type { AboutConfig, HeroButton, PhotoItem, CvFile, LifeEvent } from "@/lib/firestore";
import { uploadFile } from "@/lib/storage";
import { DEFAULT_ABOUT, DEFAULT_LIFE_EVENTS } from "@/lib/site-defaults";

/* ── Yardımcı ── */
function genId() { return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

function moveItem<T extends { id: string; order: number }>(list: T[], id: string, dir: -1 | 1): T[] {
  const sorted  = [...list].sort((a, b) => a.order - b.order);
  const idx     = sorted.findIndex((x) => x.id === id);
  const swapIdx = idx + dir;
  if (swapIdx < 0 || swapIdx >= sorted.length) return sorted;
  const tmp         = sorted[idx].order;
  sorted[idx]       = { ...sorted[idx],     order: sorted[swapIdx].order };
  sorted[swapIdx]   = { ...sorted[swapIdx], order: tmp };
  return sorted.sort((a, b) => a.order - b.order);
}

const LEVEL_OPTIONS = [
  { value: "junior", label: "Junior" },
  { value: "mid",    label: "Mid-level" },
  { value: "senior", label: "Senior" },
];

const IS: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "9px",
  border: "1px solid var(--border)", background: "var(--bg)",
  color: "var(--text)", fontSize: "0.85rem", outline: "none",
  fontFamily: "var(--font-sans)", boxSizing: "border-box",
};

const TS: React.CSSProperties = { ...IS, minHeight: "100px", resize: "vertical" };

/* ── Ana Sayfa ── */
export default function AdminAboutPage() {
  const [config,  setConfig]  = useState<AboutConfig>(DEFAULT_ABOUT);
  const [events,  setEventsS] = useState<LifeEvent[]>(DEFAULT_LIFE_EVENTS);
  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [msgProfile,    setMsgProfile]    = useState("");
  const [savingEvents,  setSavingEvents]  = useState(false);
  const [msgEvents,     setMsgEvents]     = useState("");

  useEffect(() => {
    Promise.all([getAboutConfig(), getLifeEvents()]).then(([cfg, evs]) => {
      setConfig(cfg ?? DEFAULT_ABOUT);
      setEventsS(evs ?? DEFAULT_LIFE_EVENTS);
      setLoading(false);
    });
  }, []);

  /* Profil kaydet */
  const saveProfile = async () => {
    setSavingProfile(true); setMsgProfile("");
    await setAboutConfig(config);
    setSavingProfile(false);
    setMsgProfile("Kaydedildi ✓");
    setTimeout(() => setMsgProfile(""), 3000);
  };

  /* Olaylar kaydet */
  const saveEvents = async () => {
    setSavingEvents(true); setMsgEvents("");
    await setLifeEvents(events);
    setSavingEvents(false);
    setMsgEvents("Kaydedildi ✓");
    setTimeout(() => setMsgEvents(""), 3000);
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      <header style={{ marginBottom: "32px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
          /admin/about
        </p>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Hakkımda Sayfası
        </h1>
      </header>

      {loading ? (
        <p className="mono" style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>Yükleniyor...</p>
      ) : (
        <>
          {/* ── Kimlik ── */}
          <Section title="Kimlik">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <Field label="İsim">
                <input style={IS} value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })} />
              </Field>
              <Field label="Kullanıcı Adı (@handle)">
                <input style={IS} value={config.handle} onChange={e => setConfig({ ...config, handle: e.target.value })} />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "12px" }}>
              <Field label="Seviye">
                <select style={IS} value={config.aboutLevel} onChange={e => setConfig({ ...config, aboutLevel: e.target.value as AboutConfig["aboutLevel"] })}>
                  {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Ünvan Metni">
                <input style={IS} value={config.aboutText} onChange={e => setConfig({ ...config, aboutText: e.target.value })} placeholder="Software Developer" />
              </Field>
            </div>
          </Section>

          {/* ── Biyografi ── */}
          <Section title="Biyografi">
            <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", marginBottom: "8px" }}>
              **kalın**, *italik*, &lt;br&gt; ve yeni satır desteklenir
            </p>
            <textarea
              style={TS}
              value={config.bioText}
              onChange={e => setConfig({ ...config, bioText: e.target.value })}
              rows={6}
            />
          </Section>

          {/* ── Fotoğraflar ── */}
          <Section title="Fotoğraflar">
            <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", marginBottom: "10px" }}>
              Birden fazla fotoğraf eklersen hakkımda sayfasında sol/sağ ok çıkar.
            </p>
            {[...config.photos].sort((a, b) => a.order - b.order).map((photo, i) => (
              <PhotoUploadRow
                key={photo.id}
                photo={photo}
                idx={i}
                total={config.photos.length}
                onMove={dir => setConfig({ ...config, photos: moveItem(config.photos, photo.id, dir) })}
                onDelete={() => setConfig({ ...config, photos: config.photos.filter(p => p.id !== photo.id) })}
                onUploaded={url => setConfig({ ...config, photos: config.photos.map(p => p.id === photo.id ? { ...p, url } : p) })}
              />
            ))}
            <AddFileButton
              label="+ Fotoğraf Ekle"
              accept="image/*"
              storagePath={(f) => `about/photos/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9.]/g, "_")}`}
              onUploaded={(url) => setConfig({ ...config, photos: [...config.photos, { id: genId(), url, order: config.photos.length }] })}
            />
          </Section>

          {/* ── Butonlar ── */}
          <Section title="CTA Butonlar">
            {[...config.buttons].sort((a, b) => a.order - b.order).map((btn, i) => (
              <BtnRow
                key={btn.id}
                btn={btn}
                idx={i}
                total={config.buttons.length}
                onChange={updated => setConfig({ ...config, buttons: config.buttons.map(b => b.id === updated.id ? updated : b) })}
                onMove={dir => setConfig({ ...config, buttons: moveItem(config.buttons, btn.id, dir) })}
                onDelete={() => setConfig({ ...config, buttons: config.buttons.filter(b => b.id !== btn.id) })}
              />
            ))}
            <button
              onClick={() => setConfig({ ...config, buttons: [...config.buttons, { id: genId(), label: "Yeni Buton", href: "/", variant: "ghost", order: config.buttons.length }] })}
              style={{ marginTop: "6px", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.08)", color: "var(--accent)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              + Ekle
            </button>
          </Section>

          {/* ── CV Dosyaları ── */}
          <Section title="CV Dosyaları">
            <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", marginBottom: "10px" }}>
              PDF yükle. Etiket: buton üzerinde görünen yazı.
            </p>
            {[...config.cvFiles].sort((a, b) => a.order - b.order).map((cv, i) => (
              <CvUploadRow
                key={cv.id}
                cv={cv}
                idx={i}
                total={config.cvFiles.length}
                onLabelChange={label => setConfig({ ...config, cvFiles: config.cvFiles.map(c => c.id === cv.id ? { ...c, label } : c) })}
                onMove={dir => setConfig({ ...config, cvFiles: moveItem(config.cvFiles, cv.id, dir) })}
                onDelete={() => setConfig({ ...config, cvFiles: config.cvFiles.filter(c => c.id !== cv.id) })}
                onUploaded={url => setConfig({ ...config, cvFiles: config.cvFiles.map(c => c.id === cv.id ? { ...c, url } : c) })}
              />
            ))}
            <AddFileButton
              label="+ CV Ekle (PDF)"
              accept=".pdf"
              storagePath={(f) => `about/cv/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9.]/g, "_")}`}
              onUploaded={(url, fileName) => setConfig({ ...config, cvFiles: [...config.cvFiles, { id: genId(), url, label: fileName.replace(/\.pdf$/i, ""), order: config.cvFiles.length }] })}
            />
          </Section>

          {/* Profil kaydet butonu */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
            <button onClick={saveProfile} disabled={savingProfile} className="btn btn-accent" style={{ padding: "9px 20px" }}>
              {savingProfile ? "Kaydediliyor..." : "Profili Kaydet"}
            </button>
            {msgProfile && <span style={{ fontSize: "0.78rem", color: "#10B981" }}>{msgProfile}</span>}
          </div>

          {/* ── Hayatı Değiştiren Günler ── */}
          <Section title="Hayatı Değiştiren Günler">
            {[...events].sort((a, b) => a.order - b.order).map((ev, i) => (
              <EventRow
                key={ev.id}
                ev={ev}
                idx={i}
                total={events.length}
                onChange={updated => setEventsS(events.map(e => e.id === updated.id ? updated : e))}
                onMove={dir => setEventsS(moveItem(events, ev.id, dir))}
                onDelete={() => setEventsS(events.filter(e => e.id !== ev.id))}
              />
            ))}
            <button
              onClick={() => setEventsS([...events, {
                id: genId(), order: events.length,
                date: "", title: "", desc: "", log: "", isCurrent: false,
              }])}
              style={{ marginTop: "6px", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.08)", color: "var(--accent)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              + Olay Ekle
            </button>
          </Section>

          {/* Olaylar kaydet */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={saveEvents} disabled={savingEvents} className="btn btn-accent" style={{ padding: "9px 20px" }}>
              {savingEvents ? "Kaydediliyor..." : "Olayları Kaydet"}
            </button>
            {msgEvents && <span style={{ fontSize: "0.78rem", color: "#10B981" }}>{msgEvents}</span>}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Section kapsayıcı ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass" style={{ borderRadius: "16px", padding: "24px 28px", marginBottom: "20px" }}>
      <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

/* ── Etiket + içerik ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mono" style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Küçük ikon butonu ── */
function IconBtn({ label, onClick, disabled, danger }: { label: string; onClick?: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 28, height: 28, borderRadius: "7px", border: "1px solid",
        borderColor: danger ? "rgba(239,68,68,0.3)" : "var(--border)",
        background: "transparent",
        color: danger ? "#ef4444" : disabled ? "var(--text-3)" : "var(--text-2)",
        fontSize: "0.8rem", cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.35 : 1, flexShrink: 0, fontFamily: "var(--font-sans)",
      }}
    >
      {label}
    </button>
  );
}

/* ── Buton satırı ── */
function BtnRow({ btn, idx, total, onChange, onMove, onDelete }: {
  btn: HeroButton; idx: number; total: number;
  onChange: (b: HeroButton) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
      <input style={{ ...IS, flex: 1 }} value={btn.label}   placeholder="Etiket"  onChange={e => onChange({ ...btn, label: e.target.value })} />
      <input style={{ ...IS, flex: 1 }} value={btn.href}    placeholder="URL"     onChange={e => onChange({ ...btn, href: e.target.value })} />
      <select style={{ ...IS, width: "90px", flexShrink: 0 }} value={btn.variant} onChange={e => onChange({ ...btn, variant: e.target.value as HeroButton["variant"] })}>
        <option value="accent">accent</option>
        <option value="ghost">ghost</option>
      </select>
      <IconBtn label="↑" onClick={idx > 0 ? () => onMove(-1) : undefined} disabled={idx === 0} />
      <IconBtn label="↓" onClick={idx < total - 1 ? () => onMove(1) : undefined} disabled={idx === total - 1} />
      <IconBtn label="✕" danger onClick={onDelete} />
    </div>
  );
}

/* ── Olay satırı ── */
function EventRow({ ev, idx, total, onChange, onMove, onDelete }: {
  ev: LifeEvent; idx: number; total: number;
  onChange: (e: LifeEvent) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "12px", marginBottom: "8px", overflow: "hidden" }}>
      {/* Başlık satırı */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "var(--bg-2)" }}>
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </button>
        <input
          style={{ ...IS, flex: 1, padding: "5px 8px" }}
          value={ev.title}
          placeholder="Olay başlığı"
          onChange={e => onChange({ ...ev, title: e.target.value })}
        />
        <input
          style={{ ...IS, width: "130px", flexShrink: 0, padding: "5px 8px" }}
          value={ev.date}
          placeholder="09.09.2021"
          onChange={e => onChange({ ...ev, date: e.target.value })}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "var(--text-3)", flexShrink: 0, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={ev.isCurrent}
            onChange={e => onChange({ ...ev, isCurrent: e.target.checked })}
          />
          Aktif
        </label>
        <IconBtn label="↑" onClick={idx > 0 ? () => onMove(-1) : undefined} disabled={idx === 0} />
        <IconBtn label="↓" onClick={idx < total - 1 ? () => onMove(1) : undefined} disabled={idx === total - 1} />
        <IconBtn label="✕" danger onClick={onDelete} />
      </div>

      {/* Detay alanları */}
      {open && (
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Field label="Açıklama">
            <textarea style={{ ...TS, minHeight: "60px" }} value={ev.desc} rows={2}
              onChange={e => onChange({ ...ev, desc: e.target.value })} placeholder="Kısa açıklama..." />
          </Field>
          <Field label="Terminal Logu (Matrix ekranında gösterilir)">
            <textarea style={{ ...TS, minHeight: "80px", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}
              value={ev.log} rows={4}
              onChange={e => onChange({ ...ev, log: e.target.value })}
              placeholder="> Sistem logu yükleniyor..." />
          </Field>
        </div>
      )}
    </div>
  );
}

/* ── Fotoğraf yükleme satırı ── */
function PhotoUploadRow({ photo, idx, total, onMove, onDelete, onUploaded }: {
  photo: PhotoItem; idx: number; total: number;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const path = `about/photos/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const url = await uploadFile(path, file);
      onUploaded(url);
    } catch { alert("Yükleme hatası."); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
      <div style={{ flex: 1, padding: "8px 12px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg-2)", fontSize: "0.82rem", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {photo.url ? <span style={{ color: "var(--accent)" }}>✓ {photo.url.split("/").pop()?.slice(0, 40)}</span> : <span style={{ color: "var(--text-3)" }}>Henüz yüklenmedi</span>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-2)", color: "var(--text-2)", fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}>
        {uploading ? "..." : "📷 Değiştir"}
      </button>
      <IconBtn label="↑" onClick={idx > 0 ? () => onMove(-1) : undefined} disabled={idx === 0} />
      <IconBtn label="↓" onClick={idx < total - 1 ? () => onMove(1) : undefined} disabled={idx === total - 1} />
      <IconBtn label="✕" danger onClick={onDelete} />
    </div>
  );
}

/* ── CV yükleme satırı ── */
function CvUploadRow({ cv, idx, total, onLabelChange, onMove, onDelete, onUploaded }: {
  cv: CvFile; idx: number; total: number;
  onLabelChange: (label: string) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const path = `about/cv/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const url = await uploadFile(path, file);
      onUploaded(url);
    } catch { alert("Yükleme hatası."); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
      <div style={{ flex: 2, padding: "8px 12px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg-2)", fontSize: "0.82rem", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {cv.url ? <span style={{ color: "var(--accent)" }}>✓ {cv.url.split("/").pop()?.slice(0, 30)}</span> : <span style={{ color: "var(--text-3)" }}>Henüz yüklenmedi</span>}
      </div>
      <input style={{ ...IS, flex: 1 }} value={cv.label} placeholder="CV İndir" onChange={e => onLabelChange(e.target.value)} />
      <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-2)", color: "var(--text-2)", fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}>
        {uploading ? "..." : "📄 PDF Seç"}
      </button>
      <IconBtn label="↑" onClick={idx > 0 ? () => onMove(-1) : undefined} disabled={idx === 0} />
      <IconBtn label="↓" onClick={idx < total - 1 ? () => onMove(1) : undefined} disabled={idx === total - 1} />
      <IconBtn label="✕" danger onClick={onDelete} />
    </div>
  );
}

/* ── Yeni dosya ekle butonu (yükleme yapıp satır ekler) ── */
function AddFileButton({ label, accept, storagePath, onUploaded }: {
  label: string;
  accept: string;
  storagePath: (f: File) => string;
  onUploaded: (url: string, fileName: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(storagePath(file), file);
      onUploaded(url, file.name);
    } catch { alert("Yükleme hatası. Firebase Storage kurallarını kontrol et."); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept={accept} style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{ marginTop: "6px", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.35)", background: uploading ? "var(--bg-2)" : "rgba(16,185,129,0.08)", color: "var(--accent)", fontSize: "0.78rem", cursor: uploading ? "default" : "pointer", fontFamily: "var(--font-sans)" }}
      >
        {uploading ? "Yükleniyor..." : label}
      </button>
    </>
  );
}
