"use client";

import { useEffect, useState } from "react";
import {
  HsArticle, HsRssFeed,
  getHsArticles, addHsArticle, updateHsArticle, deleteHsArticle,
  getHsFeeds, setHsFeeds,
} from "@/lib/firestore";

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

type Tab = "articles" | "feeds";

/* ── Article form tipi ── */
interface ArticleForm {
  title: string; slug: string; excerpt: string; content: string;
  read_time: string; is_published: boolean; created_at: string;
}
const emptyArticle = (): ArticleForm => ({
  title: "", slug: "", excerpt: "", content: "",
  read_time: "5", is_published: true,
  created_at: new Date().toISOString().slice(0, 16),
});

/* ── Feed form tipi ── */
interface FeedForm {
  source_name: string; source_icon: string; title: string;
  link: string; published_date: string;
}
const emptyFeed = (): FeedForm => ({
  source_name: "", source_icon: "", title: "", link: "",
  published_date: new Date().toISOString().slice(0, 16),
});

/* ══════════════════════════════════════════════════════ */
export default function AdminHsoundsPage() {
  const [tab, setTab] = useState<Tab>("articles");

  /* ── Articles state ── */
  const [articles, setArticles] = useState<HsArticle[]>([]);
  const [artLoading, setArtLoading] = useState(true);
  const [artModal, setArtModal] = useState<{
    mode: "add" | "edit"; id?: string; form: ArticleForm;
  } | null>(null);
  const [artDelete, setArtDelete] = useState<HsArticle | null>(null);

  /* ── Feeds state ── */
  const [feeds, setFeeds] = useState<HsRssFeed[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(true);
  const [feedModal, setFeedModal] = useState<{
    mode: "add" | "edit"; id?: string; form: FeedForm;
  } | null>(null);
  const [feedDelete, setFeedDelete] = useState<HsRssFeed | null>(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [importing, setImporting] = useState(false);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  /* ── Verileri yükle ── */
  useEffect(() => {
    getHsArticles().then((a) => { setArticles(a); setArtLoading(false); });
    getHsFeeds().then((f) => { setFeeds(f); setFeedsLoading(false); });
  }, []);

  /* ════ ARTICLES ════ */

  const saveArticle = async () => {
    if (!artModal) return;
    const { title, slug, excerpt, content, read_time, is_published, created_at } = artModal.form;
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        read_time: parseInt(read_time) || 5,
        is_published,
        created_at: new Date(created_at).toISOString(),
      };

      if (artModal.mode === "add") {
        const id = await addHsArticle(data);
        setArticles((prev) => [{ id, ...data }, ...prev]);
      } else if (artModal.id) {
        await updateHsArticle(artModal.id, data);
        setArticles((prev) => prev.map((a) => a.id === artModal.id ? { ...a, ...data } : a));
      }
      setArtModal(null);
      flash("Kaydedildi.");
    } catch {
      flash("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteArticle = async () => {
    if (!artDelete) return;
    setSaving(true);
    try {
      await deleteHsArticle(artDelete.id);
      setArticles((prev) => prev.filter((a) => a.id !== artDelete.id));
      setArtDelete(null);
      flash("Silindi.");
    } catch {
      flash("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  /* ════ FEEDS ════ */

  const persistFeeds = async (next: HsRssFeed[]) => {
    setSaving(true);
    try {
      await setHsFeeds(next);
      setFeeds(next);
      flash("Kaydedildi.");
    } catch {
      flash("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const saveFeed = async () => {
    if (!feedModal) return;
    const { source_name, source_icon, title, link, published_date } = feedModal.form;
    if (!source_name.trim() || !title.trim() || !link.trim()) return;

    const data: Omit<HsRssFeed, "id"> = {
      source_name: source_name.trim(),
      source_icon: source_icon.trim() || "📡",
      title: title.trim(),
      link: link.trim(),
      published_date: new Date(published_date).toISOString(),
    };

    let next: HsRssFeed[];
    if (feedModal.mode === "add") {
      next = [{ id: genId(), ...data }, ...feeds];
    } else {
      next = feeds.map((f) => f.id === feedModal.id ? { ...f, ...data } : f);
    }
    setFeedModal(null);
    await persistFeeds(next);
  };

  const confirmDeleteFeed = async () => {
    if (!feedDelete) return;
    const next = feeds.filter((f) => f.id !== feedDelete.id);
    setFeedDelete(null);
    await persistFeeds(next);
  };

  /* ── Mock veri aktarımı ── */
  const importMockData = async () => {
    if (!confirm("Mock veriler Firestore'a aktarılacak. Mevcut veriler silinmez. Devam?")) return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/import-hsounds", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      /* Sayfayı yenile */
      const [a, f] = await Promise.all([getHsArticles(), getHsFeeds()]);
      setArticles(a);
      setFeeds(f);
      flash(`Aktarıldı: ${data.articles} makale, ${data.feeds} RSS.`);
    } catch {
      flash("Aktarım hatası.");
    } finally {
      setImporting(false);
    }
  };

  const loading = artLoading || feedsLoading;

  return (
    <div style={{ maxWidth: "760px" }}>
      {/* Header */}
      <header style={{ marginBottom: "32px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
          /admin/hsounds
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            HSounds
          </h1>
          <button
            onClick={importMockData}
            disabled={importing}
            className="btn btn-ghost"
            style={{ fontSize: "0.78rem", padding: "7px 14px" }}
          >
            {importing ? "Aktarılıyor..." : "↓ Mock Veriyi Aktar"}
          </button>
        </div>
      </header>

      {msg && (
        <p style={{ fontSize: "0.82rem", color: msg.includes("Hata") ? "#ef4444" : "#10B981", marginBottom: "16px" }}>
          {msg}
        </p>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", padding: "4px", background: "var(--bg-2)", borderRadius: "12px", width: "fit-content" }}>
        {(["articles", "feeds"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 18px", borderRadius: "9px", border: "none",
              cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600,
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "#fff" : "var(--text-2)",
              transition: "all 0.2s",
            }}
          >
            {t === "articles" ? "📝 Makaleler" : "📡 RSS Akışları"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
      ) : (
        <>
          {/* ── Makaleler ── */}
          {tab === "articles" && (
            <section className="glass" style={{ borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Makaleler ({articles.length})
                </p>
                <button
                  onClick={() => setArtModal({ mode: "add", form: emptyArticle() })}
                  className="btn btn-accent"
                  style={{ padding: "7px 14px", fontSize: "0.8rem" }}
                >
                  + Ekle
                </button>
              </div>

              {articles.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Henüz makale yok. "Mock Veriyi Aktar" ile başlayabilirsin.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {articles.map((a) => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "var(--bg-2)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {a.title}
                        </p>
                        <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
                          /{a.slug} · {a.read_time} dk · {formatDate(a.created_at)}
                        </p>
                      </div>
                      <span style={{
                        fontSize: "0.7rem", padding: "2px 8px", borderRadius: "999px",
                        background: a.is_published ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                        color: a.is_published ? "#10B981" : "#ef4444",
                        border: `1px solid ${a.is_published ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                        flexShrink: 0,
                      }}>
                        {a.is_published ? "Yayında" : "Taslak"}
                      </span>
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <IBtn title="Düzenle" onClick={() => setArtModal({
                          mode: "edit", id: a.id,
                          form: { title: a.title, slug: a.slug, excerpt: a.excerpt, content: a.content, read_time: String(a.read_time), is_published: a.is_published, created_at: a.created_at.slice(0, 16) },
                        })}>✎</IBtn>
                        <IBtn title="Sil" danger onClick={() => setArtDelete(a)}>🗑</IBtn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── RSS Akışları ── */}
          {tab === "feeds" && (
            <section className="glass" style={{ borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  RSS Akışları ({feeds.length})
                </p>
                <button
                  onClick={() => setFeedModal({ mode: "add", form: emptyFeed() })}
                  className="btn btn-accent"
                  style={{ padding: "7px 14px", fontSize: "0.8rem" }}
                >
                  + Ekle
                </button>
              </div>

              {feeds.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Henüz RSS akışı yok. "Mock Veriyi Aktar" ile başlayabilirsin.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {feeds.map((f) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "var(--bg-2)" }}>
                      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{f.source_icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.title}
                        </p>
                        <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
                          {f.source_name} · {formatDate(f.published_date)}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <IBtn title="Düzenle" onClick={() => setFeedModal({
                          mode: "edit", id: f.id,
                          form: { source_name: f.source_name, source_icon: f.source_icon, title: f.title, link: f.link, published_date: f.published_date.slice(0, 16) },
                        })}>✎</IBtn>
                        <IBtn title="Sil" danger onClick={() => setFeedDelete(f)}>🗑</IBtn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* ── Makale Modal ── */}
      {artModal && (
        <Modal
          title={artModal.mode === "add" ? "Makale Ekle" : "Makaleyi Düzenle"}
          onClose={() => setArtModal(null)}
          wide
        >
          <form
            onSubmit={(e) => { e.preventDefault(); saveArticle(); }}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <Field label="Başlık">
              <input
                autoFocus required value={artModal.form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setArtModal((p) => p ? {
                    ...p,
                    form: {
                      ...p.form,
                      title,
                      slug: p.mode === "add" ? slugify(title) : p.form.slug,
                    },
                  } : null);
                }}
                style={inputStyle}
              />
            </Field>

            <Field label="Slug">
              <input
                required value={artModal.form.slug}
                onChange={(e) => setArtModal((p) => p ? { ...p, form: { ...p.form, slug: slugify(e.target.value) } } : null)}
                style={inputStyle}
              />
            </Field>

            <Field label="Özet">
              <textarea
                required value={artModal.form.excerpt}
                onChange={(e) => setArtModal((p) => p ? { ...p, form: { ...p.form, excerpt: e.target.value } } : null)}
                rows={2}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-sans)" }}
              />
            </Field>

            <Field label="İçerik (HTML)">
              <textarea
                required value={artModal.form.content}
                onChange={(e) => setArtModal((p) => p ? { ...p, form: { ...p.form, content: e.target.value } } : null)}
                rows={10}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: "0.8rem", lineHeight: 1.6 }}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Okuma Süresi (dk)">
                <input
                  type="number" min={1} max={120} value={artModal.form.read_time}
                  onChange={(e) => setArtModal((p) => p ? { ...p, form: { ...p.form, read_time: e.target.value } } : null)}
                  style={inputStyle}
                />
              </Field>
              <Field label="Tarih">
                <input
                  type="datetime-local" value={artModal.form.created_at}
                  onChange={(e) => setArtModal((p) => p ? { ...p, form: { ...p.form, created_at: e.target.value } } : null)}
                  style={inputStyle}
                />
              </Field>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-2)" }}>
              <input
                type="checkbox" checked={artModal.form.is_published}
                onChange={(e) => setArtModal((p) => p ? { ...p, form: { ...p.form, is_published: e.target.checked } } : null)}
              />
              Yayında
            </label>

            <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
              <button type="submit" disabled={saving} className="btn btn-accent" style={{ flex: 1, padding: "10px", fontSize: "0.85rem", justifyContent: "center" }}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button type="button" onClick={() => setArtModal(null)} className="btn btn-ghost" style={{ padding: "10px 16px", fontSize: "0.85rem" }}>
                İptal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Makale Silme Onayı ── */}
      {artDelete && (
        <Modal title="Makaleyi Sil?" onClose={() => setArtDelete(null)}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-2)", marginBottom: "20px" }}>
            <strong style={{ color: "var(--text)" }}>{artDelete.title}</strong> kalıcı olarak silinecek.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={confirmDeleteArticle} disabled={saving} style={dangerBtnStyle}>Sil</button>
            <button onClick={() => setArtDelete(null)} className="btn btn-ghost" style={{ padding: "9px 16px", fontSize: "0.85rem" }}>İptal</button>
          </div>
        </Modal>
      )}

      {/* ── Feed Modal ── */}
      {feedModal && (
        <Modal
          title={feedModal.mode === "add" ? "RSS Akışı Ekle" : "RSS Akışını Düzenle"}
          onClose={() => setFeedModal(null)}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); saveFeed(); }}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <Field label="Kaynak Adı">
              <input
                autoFocus required value={feedModal.form.source_name}
                onChange={(e) => setFeedModal((p) => p ? { ...p, form: { ...p.form, source_name: e.target.value } } : null)}
                placeholder="Hacker News"
                style={inputStyle}
              />
            </Field>
            <Field label="İkon (emoji)">
              <input
                value={feedModal.form.source_icon} maxLength={4}
                onChange={(e) => setFeedModal((p) => p ? { ...p, form: { ...p.form, source_icon: e.target.value } } : null)}
                placeholder="🟠"
                style={{ ...inputStyle, width: "80px" }}
              />
            </Field>
            <Field label="Başlık">
              <input
                required value={feedModal.form.title}
                onChange={(e) => setFeedModal((p) => p ? { ...p, form: { ...p.form, title: e.target.value } } : null)}
                style={inputStyle}
              />
            </Field>
            <Field label="Bağlantı">
              <input
                required value={feedModal.form.link}
                onChange={(e) => setFeedModal((p) => p ? { ...p, form: { ...p.form, link: e.target.value } } : null)}
                placeholder="https://..."
                style={inputStyle}
              />
            </Field>
            <Field label="Yayın Tarihi">
              <input
                type="datetime-local" value={feedModal.form.published_date}
                onChange={(e) => setFeedModal((p) => p ? { ...p, form: { ...p.form, published_date: e.target.value } } : null)}
                style={inputStyle}
              />
            </Field>

            <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
              <button type="submit" disabled={saving} className="btn btn-accent" style={{ flex: 1, padding: "10px", fontSize: "0.85rem", justifyContent: "center" }}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button type="button" onClick={() => setFeedModal(null)} className="btn btn-ghost" style={{ padding: "10px 16px", fontSize: "0.85rem" }}>
                İptal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Feed Silme Onayı ── */}
      {feedDelete && (
        <Modal title="Akışı Sil?" onClose={() => setFeedDelete(null)}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-2)", marginBottom: "20px" }}>
            <strong style={{ color: "var(--text)" }}>{feedDelete.title}</strong> kalıcı olarak silinecek.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={confirmDeleteFeed} disabled={saving} style={dangerBtnStyle}>Sil</button>
            <button onClick={() => setFeedDelete(null)} className="btn btn-ghost" style={{ padding: "9px 16px", fontSize: "0.85rem" }}>İptal</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Alt bileşenler ── */

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid var(--border)", background: "var(--bg)",
  color: "var(--text)", fontFamily: "var(--font-sans)",
  fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
};

const dangerBtnStyle: React.CSSProperties = {
  padding: "9px 18px", borderRadius: "10px",
  border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.12)",
  color: "#ef4444", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
  fontFamily: "var(--font-sans)",
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

function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass" style={{ borderRadius: "20px", padding: "28px", width: "100%", maxWidth: wide ? "640px" : "440px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: "1.1rem", cursor: "pointer", padding: "4px 8px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function IBtn({ children, title, onClick, danger }: {
  children: React.ReactNode; title: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      title={title} onClick={onClick}
      style={{
        width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "7px", border: "1px solid var(--border)", background: "transparent",
        color: danger ? "#ef4444" : "var(--text-3)",
        fontSize: "0.82rem", cursor: "pointer", transition: "all 0.12s",
      }}
    >
      {children}
    </button>
  );
}
