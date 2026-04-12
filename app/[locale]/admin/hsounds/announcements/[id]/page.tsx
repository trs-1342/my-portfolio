"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getHsAnnouncement, updateHsAnnouncement } from "@/lib/firestore";

export default function EditAnnouncementPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [title,       setTitle]       = useState("");
  const [excerpt,     setExcerpt]     = useState("");
  const [content,     setContent]     = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [pinned,      setPinned]      = useState(false);
  const [createdAt,   setCreatedAt]   = useState("");
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [msg,         setMsg]         = useState("");

  useEffect(() => {
    if (!id) return;
    getHsAnnouncement(id).then((a) => {
      if (!a) { setError("Duyuru bulunamadı."); setLoading(false); return; }
      setTitle(a.title);
      setExcerpt(a.excerpt);
      setContent(a.content);
      setIsPublished(a.is_published);
      setPinned(a.pinned);
      setCreatedAt(new Date(a.created_at).toISOString().slice(0, 16));
      setLoading(false);
    });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) return;
    setSaving(true); setError(""); setMsg("");
    try {
      await updateHsAnnouncement(id, {
        title:        title.trim(),
        excerpt:      excerpt.trim(),
        content:      content.trim(),
        is_published: isPublished,
        pinned,
        created_at:   new Date(createdAt).toISOString(),
      });
      setMsg("Kaydedildi.");
      setTimeout(() => router.push("/admin/hsounds"), 800);
    } catch {
      setError("Kaydetme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "760px" }}>
        <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "760px" }}>
      <header style={{ marginBottom: "32px" }}>
        <Link href="/admin/hsounds" className="mono" style={{ fontSize: "0.72rem", color: "var(--text-3)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          ← HSounds
        </Link>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Duyuruyu Düzenle
        </h1>
      </header>

      <form onSubmit={handleSave}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          <div className="glass" style={{ borderRadius: "16px", padding: "24px" }}>
            <SectionLabel>Temel Bilgiler</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Field label="Başlık">
                <input
                  autoFocus required value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Duyuru başlığı..."
                  style={inputStyle}
                />
              </Field>
              <Field label="Özet">
                <textarea
                  required value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Kısa bir özet..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>
              <Field label="Tarih">
                <input
                  type="datetime-local" value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  style={{ ...inputStyle, maxWidth: "260px" }}
                />
              </Field>
              <div style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-2)" }}>
                  <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                  Yayında
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-2)" }}>
                  <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                  Sabitle (en üstte göster)
                </label>
              </div>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: "16px", padding: "24px" }}>
            <SectionLabel>İçerik (HTML)</SectionLabel>
            <textarea
              required value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              placeholder="<p>Duyuru içeriği...</p>"
              style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: "0.82rem", lineHeight: 1.65, resize: "vertical", marginTop: "12px" }}
            />
          </div>

          {error && <p style={{ fontSize: "0.82rem", color: "#ef4444" }}>{error}</p>}
          {msg   && <p style={{ fontSize: "0.82rem", color: "#10B981" }}>{msg}</p>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={saving} className="btn btn-accent" style={{ padding: "12px 28px", fontSize: "0.9rem", justifyContent: "center" }}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <Link href="/admin/hsounds" className="btn btn-ghost" style={{ padding: "12px 20px", fontSize: "0.9rem" }}>
              İptal
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid var(--border)", background: "var(--bg)",
  color: "var(--text)", fontFamily: "var(--font-sans)",
  fontSize: "0.88rem", outline: "none", boxSizing: "border-box",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
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
