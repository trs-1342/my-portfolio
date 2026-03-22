"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HsArticle, HsRssFeed,
  getHsArticles, deleteHsArticle,
  getHsFeeds, setHsFeeds,
} from "@/lib/firestore";

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

type Tab = "articles" | "feeds";

interface FeedForm {
  source_name: string;
  source_icon: string;
  feed_url: string;
}
const emptyFeed = (): FeedForm => ({ source_name: "", source_icon: "", feed_url: "" });

/* ══════════════════════════════════════════════════════ */
export default function AdminHsoundsPage() {
  const [tab, setTab] = useState<Tab>("articles");

  /* ── Articles ── */
  const [articles, setArticles]     = useState<HsArticle[]>([]);
  const [artLoading, setArtLoading] = useState(true);
  const [artDelete, setArtDelete]   = useState<HsArticle | null>(null);

  /* ── Feeds ── */
  const [feeds, setFeeds]             = useState<HsRssFeed[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(true);
  const [feedModal, setFeedModal] = useState<{
    mode: "add" | "edit"; id?: string; form: FeedForm;
  } | null>(null);
  const [feedDelete, setFeedDelete] = useState<HsRssFeed | null>(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => {
    getHsArticles().then((a) => { setArticles(a); setArtLoading(false); });
    getHsFeeds().then((f)    => { setFeeds(f);    setFeedsLoading(false); });
  }, []);

  /* ── Makale sil ── */
  const confirmDeleteArticle = async () => {
    if (!artDelete) return;
    setSaving(true);
    try {
      await deleteHsArticle(artDelete.id);
      setArticles((p) => p.filter((a) => a.id !== artDelete.id));
      setArtDelete(null);
      flash("Silindi.");
    } catch { flash("Hata oluştu."); }
    finally { setSaving(false); }
  };

  /* ── Feed CRUD ── */
  const persistFeeds = async (next: HsRssFeed[]) => {
    setSaving(true);
    try { await setHsFeeds(next); setFeeds(next); flash("Kaydedildi."); }
    catch { flash("Hata oluştu."); }
    finally { setSaving(false); }
  };

  const saveFeed = async () => {
    if (!feedModal) return;
    const { source_name, source_icon, feed_url } = feedModal.form;
    if (!source_name.trim() || !feed_url.trim()) return;

    const data: Omit<HsRssFeed, "id"> = {
      source_name: source_name.trim(),
      source_icon: source_icon.trim() || "🌐",
      feed_url: feed_url.trim(),
    };

    let next: HsRssFeed[];
    if (feedModal.mode === "add") {
      next = [...feeds, { id: genId(), ...data }];
    } else {
      next = feeds.map((f) => f.id === feedModal.id ? { ...f, ...data } : f);
    }
    setFeedModal(null);
    await persistFeeds(next);
  };

  const loading = artLoading || feedsLoading;

  return (
    <div style={{ maxWidth: "760px" }}>
      {/* Header */}
      <header style={{ marginBottom: "32px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
          /admin/hsounds
        </p>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          HSounds
        </h1>
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
            {t === "articles" ? "📝 Makaleler" : "📡 RSS Kaynakları"}
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
                <Link href="/admin/hsounds/articles/new" className="btn btn-accent" style={{ padding: "7px 14px", fontSize: "0.8rem" }}>
                  + Yeni Makale
                </Link>
              </div>

              {articles.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Henüz makale yok.</p>
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
                        <Link href={`/admin/hsounds/articles/${a.id}`} title="Düzenle" style={{
                          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: "7px", border: "1px solid var(--border)", background: "transparent",
                          color: "var(--text-3)", fontSize: "0.82rem", textDecoration: "none",
                        }}>✎</Link>
                        <IBtn title="Sil" danger onClick={() => setArtDelete(a)}>🗑</IBtn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── RSS Kaynakları ── */}
          {tab === "feeds" && (
            <section className="glass" style={{ borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  RSS Kaynakları ({feeds.length})
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
                <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Henüz RSS kaynağı eklenmedi.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {feeds.map((f) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "var(--bg-2)" }}>
                      <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{f.source_icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "2px" }}>
                          {f.source_name}
                        </p>
                        <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.feed_url}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <IBtn title="Düzenle" onClick={() => setFeedModal({
                          mode: "edit", id: f.id,
                          form: { source_name: f.source_name, source_icon: f.source_icon, feed_url: f.feed_url },
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
          title={feedModal.mode === "add" ? "RSS Kaynağı Ekle" : "RSS Kaynağını Düzenle"}
          onClose={() => setFeedModal(null)}
        >
          <form onSubmit={(e) => { e.preventDefault(); saveFeed(); }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Field label="Kaynak Adı">
              <input
                autoFocus required value={feedModal.form.source_name}
                onChange={(e) => setFeedModal((p) => p ? { ...p, form: { ...p.form, source_name: e.target.value } } : null)}
                placeholder="The Pragmatic Engineer"
                style={inputStyle}
              />
            </Field>
            <Field label="İkon (emoji, boş bırakılırsa 🌐)">
              <input
                value={feedModal.form.source_icon} maxLength={4}
                onChange={(e) => setFeedModal((p) => p ? { ...p, form: { ...p.form, source_icon: e.target.value } } : null)}
                placeholder="🌐"
                style={{ ...inputStyle, width: "80px" }}
              />
            </Field>
            <Field label="Feed URL">
              <input
                required value={feedModal.form.feed_url}
                onChange={(e) => setFeedModal((p) => p ? { ...p, form: { ...p.form, feed_url: e.target.value } } : null)}
                placeholder="https://example.com/rss"
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
        <Modal title="Kaynağı Sil?" onClose={() => setFeedDelete(null)}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-2)", marginBottom: "20px" }}>
            <strong style={{ color: "var(--text)" }}>{feedDelete.source_name}</strong> kalıcı olarak silinecek.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={async () => { await persistFeeds(feeds.filter((f) => f.id !== feedDelete!.id)); setFeedDelete(null); }} disabled={saving} style={dangerBtnStyle}>Sil</button>
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

function IBtn({ children, title, onClick, danger }: {
  children: React.ReactNode; title: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: "7px", border: "1px solid var(--border)", background: "transparent",
      color: danger ? "#ef4444" : "var(--text-3)", fontSize: "0.82rem", cursor: "pointer", transition: "all 0.12s",
    }}>
      {children}
    </button>
  );
}
