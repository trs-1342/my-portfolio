"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getHsArticle, updateHsArticle, deleteHsArticle } from "@/lib/firestore";

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

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [title,       setTitle]       = useState("");
  const [slug,        setSlug]        = useState("");
  const [excerpt,     setExcerpt]     = useState("");
  const [content,     setContent]     = useState("");
  const [readTime,    setReadTime]    = useState("5");
  const [isPublished, setIsPublished] = useState(true);
  const [createdAt,   setCreatedAt]   = useState("");
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!id) return;
    getHsArticle(id).then((a) => {
      if (!a) { router.replace("/admin/hsounds"); return; }
      setTitle(a.title);
      setSlug(a.slug);
      setExcerpt(a.excerpt);
      setContent(a.content);
      setReadTime(String(a.read_time));
      setIsPublished(a.is_published);
      setCreatedAt(a.created_at.slice(0, 16));
      setLoading(false);
    });
  }, [id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim()) return;
    setSaving(true); setError("");
    try {
      await updateHsArticle(id, {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        read_time: parseInt(readTime) || 5,
        is_published: isPublished,
        created_at: new Date(createdAt).toISOString(),
      });
      router.push("/admin/hsounds");
    } catch {
      setError("Güncelleme sırasında hata oluştu.");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu makaleyi kalıcı olarak silmek istediğinden emin misin?")) return;
    setDeleting(true);
    try {
      await deleteHsArticle(id);
      router.push("/admin/hsounds");
    } catch {
      setError("Silme sırasında hata oluştu.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
        <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "760px" }}>
      {/* Header */}
      <header style={{ marginBottom: "32px" }}>
        <Link href="/admin/hsounds" className="mono" style={{ fontSize: "0.72rem", color: "var(--text-3)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          ← HSounds
        </Link>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Makaleyi Düzenle
        </h1>
      </header>

      <form onSubmit={handleSave}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Başlık + Slug */}
          <div className="glass" style={{ borderRadius: "16px", padding: "24px" }}>
            <SectionLabel>Temel Bilgiler</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Field label="Başlık">
                <input
                  autoFocus required value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="Slug (URL)">
                <input
                  required value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
                />
              </Field>
              <Field label="Özet">
                <textarea
                  required value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px" }}>
                <Field label="Okuma Süresi (dk)">
                  <input
                    type="number" min={1} max={120} value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Tarih">
                  <input
                    type="datetime-local" value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    style={inputStyle}
                  />
                </Field>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-2)" }}>
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                Yayında
              </label>
            </div>
          </div>

          {/* İçerik */}
          <div className="glass" style={{ borderRadius: "16px", padding: "24px" }}>
            <SectionLabel>İçerik (HTML)</SectionLabel>
            <textarea
              required value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: "0.82rem", lineHeight: 1.65, resize: "vertical", marginTop: "12px" }}
            />
          </div>

          {/* Kaydet */}
          {error && <p style={{ fontSize: "0.82rem", color: "#ef4444" }}>{error}</p>}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button type="submit" disabled={saving || deleting} className="btn btn-accent" style={{ padding: "12px 28px", fontSize: "0.9rem", justifyContent: "center" }}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <Link href="/admin/hsounds" className="btn btn-ghost" style={{ padding: "12px 20px", fontSize: "0.9rem" }}>
              İptal
            </Link>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              style={{
                padding: "12px 20px", borderRadius: "10px",
                border: "1px solid rgba(239,68,68,0.4)", background: "transparent",
                color: "#ef4444", fontSize: "0.85rem", fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--font-sans)",
              }}
            >
              {deleting ? "Siliniyor..." : "🗑 Makaleyi Sil"}
            </button>
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
