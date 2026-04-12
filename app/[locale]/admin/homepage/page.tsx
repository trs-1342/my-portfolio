"use client";

import { useEffect, useState } from "react";
import {
  getHomepageConfig, setHomepageConfig,
  getSkillsConfig,   setSkillsConfig,
} from "@/lib/firestore";
import type { HeroButton, SkillBadge, HomepageConfig, SkillItem } from "@/lib/firestore";
import { DEFAULT_HOMEPAGE, DEFAULT_SKILLS } from "@/lib/site-defaults";

/* ── Yardımcı: sıra değiştir ── */
function moveItem<T extends { id: string; order: number }>(list: T[], id: string, dir: -1 | 1): T[] {
  const sorted = [...list].sort((a, b) => a.order - b.order);
  const idx    = sorted.findIndex((x) => x.id === id);
  const swapIdx = idx + dir;
  if (swapIdx < 0 || swapIdx >= sorted.length) return sorted;
  const tmp = sorted[idx].order;
  sorted[idx]     = { ...sorted[idx],     order: sorted[swapIdx].order };
  sorted[swapIdx] = { ...sorted[swapIdx], order: tmp };
  return sorted.sort((a, b) => a.order - b.order);
}

function genId() { return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

export default function AdminHomepagePage() {
  /* ── Hero state ── */
  const [heroLevel, setHeroLevel] = useState<"junior" | "mid" | "senior">("mid");
  const [heroText,  setHeroText]  = useState("Software Enginner");
  const [savingHero, setSavingHero] = useState(false);
  const [msgHero, setMsgHero] = useState("");

  /* ── About state ── */
  const [aboutText, setAboutText] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);
  const [msgAbout, setMsgAbout] = useState("");

  /* ── Buttons state ── */
  const [buttons, setButtons] = useState<HeroButton[]>([]);
  const [editBtnId, setEditBtnId] = useState<string | null>(null);
  const [newBtn, setNewBtn] = useState(false);
  const [savingBtns, setSavingBtns] = useState(false);
  const [msgBtns, setMsgBtns] = useState("");

  /* ── Skill Badges state ── */
  const [badges, setBadges] = useState<SkillBadge[]>([]);
  const [editBadgeId, setEditBadgeId] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState(false);
  const [savingBadges, setSavingBadges] = useState(false);
  const [msgBadges, setMsgBadges] = useState("");

  /* ── Skills (boxes) state ── */
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [editSkillId, setEditSkillId] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [msgSkills, setMsgSkills] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHomepageConfig(), getSkillsConfig()]).then(([cfg, sk]) => {
      const c = cfg ?? DEFAULT_HOMEPAGE;
      setHeroLevel(c.heroLevel);
      setHeroText(c.aboutText !== undefined ? c.heroText : DEFAULT_HOMEPAGE.heroText);
      setAboutText(c.aboutText);
      setButtons([...c.buttons].sort((a, b) => a.order - b.order));
      setBadges([...(c.skillBadges ?? [])].sort((a, b) => a.order - b.order));
      setSkills([...(sk ?? DEFAULT_SKILLS)].sort((a, b) => a.order - b.order));
      setLoading(false);
    });
  }, []);

  /* ── Kaydet: Hero ── */
  const saveHero = async () => {
    setSavingHero(true); setMsgHero("");
    const cfg: HomepageConfig = { heroLevel, heroText, aboutText, buttons, skillBadges: badges };
    await setHomepageConfig(cfg);
    setSavingHero(false); setMsgHero("Kaydedildi ✓");
    setTimeout(() => setMsgHero(""), 2000);
  };

  /* ── Kaydet: About ── */
  const saveAbout = async () => {
    setSavingAbout(true); setMsgAbout("");
    await setHomepageConfig({ heroLevel, heroText, aboutText, buttons, skillBadges: badges });
    setSavingAbout(false); setMsgAbout("Kaydedildi ✓");
    setTimeout(() => setMsgAbout(""), 2000);
  };

  /* ── Kaydet: Buttons ── */
  const saveBtns = async () => {
    setSavingBtns(true); setMsgBtns("");
    await setHomepageConfig({ heroLevel, heroText, aboutText, buttons, skillBadges: badges });
    setSavingBtns(false); setMsgBtns("Kaydedildi ✓");
    setTimeout(() => setMsgBtns(""), 2000);
  };

  /* ── Kaydet: Badges ── */
  const saveBadges = async () => {
    setSavingBadges(true); setMsgBadges("");
    await setHomepageConfig({ heroLevel, heroText, aboutText, buttons, skillBadges: badges });
    setSavingBadges(false); setMsgBadges("Kaydedildi ✓");
    setTimeout(() => setMsgBadges(""), 2000);
  };

  /* ── Kaydet: Skills ── */
  const saveSkills = async () => {
    setSavingSkills(true); setMsgSkills("");
    await setSkillsConfig(skills);
    setSavingSkills(false); setMsgSkills("Kaydedildi ✓");
    setTimeout(() => setMsgSkills(""), 2000);
  };

  if (loading) return (
    <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
  );

  return (
    <div style={{ maxWidth: "760px" }}>
      <header style={{ marginBottom: "32px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
          /admin/homepage
        </p>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Anasayfa Düzenleyici
        </h1>
      </header>

      {/* ═══ Hero Başlığı ═══ */}
      <Section title="Hero Başlığı">
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "16px" }}>
          <div>
            <Label>Seviye</Label>
            <select
              value={heroLevel}
              onChange={(e) => setHeroLevel(e.target.value as "junior" | "mid" | "senior")}
              style={selectStyle}
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <Label>Metin</Label>
            <input
              value={heroText}
              onChange={(e) => setHeroText(e.target.value)}
              placeholder="Software Engineer"
              style={inputStyle}
            />
          </div>
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginBottom: "14px" }}>
          Önizleme: <strong style={{ color: "var(--text-2)" }}>
            {heroLevel === "junior" ? "Junior" : heroLevel === "mid" ? "Mid-level" : "Senior"}
          </strong>{" "}
          <span style={{ color: "var(--accent)" }}>{heroText}</span>
        </p>
        <SaveRow saving={savingHero} msg={msgHero} onSave={saveHero} />
      </Section>

      {/* ═══ Hakkımda Metni ═══ */}
      <Section title="Hakkımda Metni">
        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: "8px" }}>
          Markdown desteklenir: <code style={{ color: "var(--accent)" }}>**kalın**</code>, <code style={{ color: "var(--accent)" }}>*italik*</code>, yeni satır veya <code style={{ color: "var(--accent)" }}>&lt;br&gt;</code>
        </p>
        <textarea
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          rows={6}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
        />
        <SaveRow saving={savingAbout} msg={msgAbout} onSave={saveAbout} />
      </Section>

      {/* ═══ CTA Butonlar ═══ */}
      <Section
        title="CTA Butonlar"
        action={<AddBtn onClick={() => { setNewBtn(true); setEditBtnId(null); }} />}
      >
        {newBtn && (
          <BtnForm
            initial={{ id: genId(), label: "", href: "", variant: "accent", order: buttons.length }}
            onSave={(b) => { setButtons([...buttons, b]); setNewBtn(false); }}
            onCancel={() => setNewBtn(false)}
          />
        )}
        {buttons.map((btn, i) => (
          <div key={btn.id}>
            {editBtnId === btn.id ? (
              <BtnForm
                initial={btn}
                onSave={(updated) => { setButtons(buttons.map(b => b.id === updated.id ? updated : b)); setEditBtnId(null); }}
                onCancel={() => setEditBtnId(null)}
              />
            ) : (
              <ListRow
                label={btn.label}
                meta={`${btn.href} · ${btn.variant}`}
                onEdit={() => setEditBtnId(btn.id)}
                onDelete={() => setButtons(buttons.filter(b => b.id !== btn.id))}
                onUp={i > 0 ? () => setButtons(moveItem(buttons, btn.id, -1)) : undefined}
                onDown={i < buttons.length - 1 ? () => setButtons(moveItem(buttons, btn.id, 1)) : undefined}
              />
            )}
          </div>
        ))}
        <SaveRow saving={savingBtns} msg={msgBtns} onSave={saveBtns} />
      </Section>

      {/* ═══ Beceri Rozetleri ═══ */}
      <Section
        title="Beceri Rozetleri"
        action={<AddBtn onClick={() => { setNewBadge(true); setEditBadgeId(null); }} />}
      >
        {newBadge && (
          <BadgeForm
            initial={{ id: genId(), label: "", order: badges.length }}
            onSave={(b) => { setBadges([...badges, b]); setNewBadge(false); }}
            onCancel={() => setNewBadge(false)}
          />
        )}
        {badges.map((b, i) => (
          <div key={b.id}>
            {editBadgeId === b.id ? (
              <BadgeForm
                initial={b}
                onSave={(updated) => { setBadges(badges.map(x => x.id === updated.id ? updated : x)); setEditBadgeId(null); }}
                onCancel={() => setEditBadgeId(null)}
              />
            ) : (
              <ListRow
                label={b.label}
                onEdit={() => setEditBadgeId(b.id)}
                onDelete={() => setBadges(badges.filter(x => x.id !== b.id))}
                onUp={i > 0 ? () => setBadges(moveItem(badges, b.id, -1)) : undefined}
                onDown={i < badges.length - 1 ? () => setBadges(moveItem(badges, b.id, 1)) : undefined}
              />
            )}
          </div>
        ))}
        <SaveRow saving={savingBadges} msg={msgBadges} onSave={saveBadges} />
      </Section>

      {/* ═══ Yetenek Kutuları ═══ */}
      <Section
        title="Yetenek Kutuları"
        action={<AddBtn onClick={() => { setNewSkill(true); setEditSkillId(null); }} />}
      >
        {newSkill && (
          <SkillForm
            initial={{ id: genId(), icon: "⭐", name: "", category: "", desc: "", order: skills.length }}
            onSave={(s) => { setSkills([...skills, s]); setNewSkill(false); }}
            onCancel={() => setNewSkill(false)}
          />
        )}
        {skills.map((s, i) => (
          <div key={s.id}>
            {editSkillId === s.id ? (
              <SkillForm
                initial={s}
                onSave={(updated) => { setSkills(skills.map(x => x.id === updated.id ? updated : x)); setEditSkillId(null); }}
                onCancel={() => setEditSkillId(null)}
              />
            ) : (
              <ListRow
                label={`${s.icon} ${s.name}`}
                meta={`${s.category} · ${s.desc}`}
                onEdit={() => setEditSkillId(s.id)}
                onDelete={() => setSkills(skills.filter(x => x.id !== s.id))}
                onUp={i > 0 ? () => setSkills(moveItem(skills, s.id, -1)) : undefined}
                onDown={i < skills.length - 1 ? () => setSkills(moveItem(skills, s.id, 1)) : undefined}
              />
            )}
          </div>
        ))}
        <SaveRow saving={savingSkills} msg={msgSkills} onSave={saveSkills} />
      </Section>
    </div>
  );
}

/* ─────────── Alt bileşenler ─────────── */

function Section({ title, children, action }: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass" style={{ borderRadius: "16px", padding: "24px 28px", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {title}
        </p>
        {action}
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mono" style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
      {children}
    </label>
  );
}

function SaveRow({ saving, msg, onSave }: { saving: boolean; msg: string; onSave: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
      <button onClick={onSave} disabled={saving} className="btn btn-accent" style={{ padding: "9px 20px" }}>
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
      {msg && <span style={{ fontSize: "0.8rem", color: "#10B981" }}>{msg}</span>}
    </div>
  );
}

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: "8px",
      border: "1px solid rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.08)",
      color: "var(--accent)", fontSize: "0.78rem", cursor: "pointer",
      fontFamily: "var(--font-sans)",
    }}>
      + Ekle
    </button>
  );
}

function ListRow({ label, meta, onEdit, onDelete, onUp, onDown }: {
  label: string; meta?: string;
  onEdit: () => void; onDelete: () => void;
  onUp?: () => void; onDown?: () => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 12px", borderRadius: "10px", marginBottom: "6px",
      border: "1px solid var(--border)", background: "var(--bg-2)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 500 }}>{label}</span>
        {meta && <span style={{ fontSize: "0.72rem", color: "var(--text-3)", marginLeft: "10px" }}>{meta}</span>}
      </div>
      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
        <IconBtn onClick={onUp} disabled={!onUp} title="Yukarı">↑</IconBtn>
        <IconBtn onClick={onDown} disabled={!onDown} title="Aşağı">↓</IconBtn>
        <IconBtn onClick={onEdit} title="Düzenle">✎</IconBtn>
        <IconBtn onClick={onDelete} danger title="Sil">✕</IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ onClick, disabled, danger, title, children }: {
  onClick?: () => void; disabled?: boolean; danger?: boolean; title?: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: "7px", border: "1px solid",
        borderColor: danger ? "rgba(239,68,68,0.3)" : "var(--border)",
        background: "transparent",
        color: danger ? "#ef4444" : disabled ? "var(--text-3)" : "var(--text-2)",
        fontSize: "0.8rem", cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.35 : 1, fontFamily: "var(--font-sans)",
      }}
    >
      {children}
    </button>
  );
}

/* ── Inline formlar ── */

function BtnForm({ initial, onSave, onCancel }: {
  initial: HeroButton; onSave: (b: HeroButton) => void; onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <div style={{ padding: "12px", border: "1px solid var(--accent)", borderRadius: "10px", marginBottom: "8px", background: "var(--bg-2)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        <div><Label>Etiket</Label><input value={v.label} onChange={e => setV({ ...v, label: e.target.value })} style={inputStyle} /></div>
        <div><Label>URL</Label><input value={v.href} onChange={e => setV({ ...v, href: e.target.value })} placeholder="/my-projects" style={inputStyle} /></div>
        <div>
          <Label>Stil</Label>
          <select value={v.variant} onChange={e => setV({ ...v, variant: e.target.value as "accent" | "ghost" })} style={selectStyle}>
            <option value="accent">Accent (dolu)</option>
            <option value="ghost">Ghost (çerçeveli)</option>
          </select>
        </div>
      </div>
      <FormActions onSave={() => onSave(v)} onCancel={onCancel} />
    </div>
  );
}

function BadgeForm({ initial, onSave, onCancel }: {
  initial: SkillBadge; onSave: (b: SkillBadge) => void; onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <div style={{ padding: "12px", border: "1px solid var(--accent)", borderRadius: "10px", marginBottom: "8px", background: "var(--bg-2)" }}>
      <div style={{ marginBottom: "10px" }}>
        <Label>Etiket</Label>
        <input value={v.label} onChange={e => setV({ ...v, label: e.target.value })} placeholder="TypeScript" style={{ ...inputStyle, maxWidth: "260px" }} />
      </div>
      <FormActions onSave={() => onSave(v)} onCancel={onCancel} />
    </div>
  );
}

function SkillForm({ initial, onSave, onCancel }: {
  initial: SkillItem; onSave: (s: SkillItem) => void; onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <div style={{ padding: "12px", border: "1px solid var(--accent)", borderRadius: "10px", marginBottom: "8px", background: "var(--bg-2)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        <div><Label>İkon</Label><input value={v.icon} onChange={e => setV({ ...v, icon: e.target.value })} style={inputStyle} /></div>
        <div><Label>İsim</Label><input value={v.name} onChange={e => setV({ ...v, name: e.target.value })} placeholder="Next.js / React" style={inputStyle} /></div>
        <div><Label>Kategori</Label><input value={v.category} onChange={e => setV({ ...v, category: e.target.value })} placeholder="Frontend" style={inputStyle} /></div>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <Label>Açıklama</Label>
        <input value={v.desc} onChange={e => setV({ ...v, desc: e.target.value })} placeholder="SSR, App Router & Vite" style={inputStyle} />
      </div>
      <FormActions onSave={() => onSave(v)} onCancel={onCancel} />
    </div>
  );
}

function FormActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button onClick={onSave} className="btn btn-accent" style={{ padding: "7px 16px", fontSize: "0.8rem" }}>Tamam</button>
      <button onClick={onCancel} className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: "0.8rem" }}>İptal</button>
    </div>
  );
}

/* ── Paylaşılan stiller ── */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "9px",
  border: "1px solid var(--border)", background: "var(--bg)",
  color: "var(--text)", fontSize: "0.85rem", outline: "none",
  fontFamily: "var(--font-sans)", boxSizing: "border-box",
};
const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};
