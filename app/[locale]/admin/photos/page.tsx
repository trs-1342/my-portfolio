"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getPhotos, addPhoto, updatePhoto, deletePhoto } from "@/lib/firestore";
import type { PhotoItem } from "@/lib/firestore";
import { uploadFile } from "@/lib/storage";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

function genStoragePath(file: File): string {
  const ts = Date.now();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `photos/${ts}_${safe}`;
}

export default function AdminPhotosPage() {
  const [photos, setPhotos]   = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]         = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  /* Düzenleme state */
  const [editId, setEditId]       = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  const load = async () => {
    setLoading(true);
    const data = await getPhotos();
    setPhotos(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  /* Fotoğraf yükle */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);

    const maxOrder = photos.length > 0 ? Math.max(...photos.map((p) => p.order)) : -1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storagePath = genStoragePath(file);
      try {
        const url = await uploadFile(storagePath, file);
        await addPhoto({
          url,
          storagePath,
          title: "",
          caption: "",
          order: maxOrder + i + 1,
          favorites: [],
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Yükleme hatası:", err);
        flash(`Hata: ${file.name} yüklenemedi.`);
      }
    }

    if (fileRef.current) fileRef.current.value = "";
    await load();
    setUploading(false);
    flash(`${files.length} fotoğraf yüklendi ✓`);
  };

  /* Sil — Storage + Firestore */
  const handleDelete = async (photo: PhotoItem) => {
    if (!confirm(`"${photo.title || "Bu fotoğraf"}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    setBusy(photo.id);
    try {
      /* Storage'dan sil */
      if (storage && photo.storagePath) {
        const fileRef2 = ref(storage, photo.storagePath);
        await deleteObject(fileRef2).catch(() => { /* zaten silinmişse geç */ });
      }
      /* Firestore'dan sil */
      await deletePhoto(photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      flash("Fotoğraf silindi ✓");
    } finally {
      setBusy(null);
    }
  };

  /* Düzenlemeyi kaydet */
  const handleSaveEdit = async () => {
    if (!editId) return;
    setBusy(editId);
    await updatePhoto(editId, { title: editTitle, caption: editCaption });
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === editId ? { ...p, title: editTitle, caption: editCaption } : p
      )
    );
    setEditId(null);
    setBusy(null);
    flash("Kaydedildi ✓");
  };

  /* Sıra değiştir */
  const movePhoto = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= photos.length) return;
    const updated = [...photos];
    [updated[index], updated[next]] = [updated[next], updated[index]];
    setPhotos(updated);
    await Promise.all([
      updatePhoto(updated[index].id, { order: index }),
      updatePhoto(updated[next].id, { order: next }),
    ]);
    flash("Sıra güncellendi ✓");
  };

  return (
    <div>
      {/* Başlık */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)" }}>
            Fotoğraflar
          </h1>
          <p className="mono" style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "4px" }}>
            Firebase Storage → Firestore
          </p>
        </div>

        {/* Yükle butonu */}
        <label
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: "10px", cursor: uploading ? "wait" : "pointer",
            background: "var(--accent)", color: "#000", fontWeight: 600, fontSize: "0.85rem",
            opacity: uploading ? 0.7 : 1, transition: "opacity 0.15s",
          }}
        >
          {uploading ? "Yükleniyor..." : "📤 Fotoğraf Ekle"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Flash mesaj */}
      {msg && (
        <div className="mono" style={{
          padding: "10px 16px", borderRadius: "10px",
          background: "var(--accent-dim)", border: "1px solid rgba(16,185,129,0.3)",
          color: "var(--accent)", fontSize: "0.82rem", marginBottom: "24px",
        }}>
          {msg}
        </div>
      )}

      {/* Düzenleme modal */}
      {editId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div className="glass" style={{ borderRadius: "20px", padding: "32px", width: "min(460px, 90vw)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
              Fotoğrafı Düzenle
            </h2>
            <label style={labelStyle}>Başlık</label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Fotoğraf başlığı"
              style={inputStyle}
            />
            <label style={{ ...labelStyle, marginTop: "14px" }}>Açıklama</label>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              placeholder="Kısa açıklama (isteğe bağlı)"
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={handleSaveEdit}
                disabled={!!busy}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  background: "var(--accent)", color: "#000",
                  border: "none", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
                }}
              >
                {busy ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                onClick={() => setEditId(null)}
                style={{
                  padding: "10px 20px", borderRadius: "10px",
                  background: "transparent", color: "var(--text-2)",
                  border: "1px solid var(--border)", cursor: "pointer", fontSize: "0.85rem",
                }}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İçerik */}
      {loading ? (
        <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
      ) : photos.length === 0 ? (
        <div className="glass" style={{ borderRadius: "16px", padding: "60px 40px", textAlign: "center" }}>
          <span style={{ fontSize: "3rem" }}>📷</span>
          <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "12px" }}>
            Henüz fotoğraf yok. Yukarıdaki butonu kullan.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
        }}>
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="glass"
              style={{ borderRadius: "14px", overflow: "hidden", opacity: busy === photo.id ? 0.6 : 1, transition: "opacity 0.2s" }}
            >
              {/* Görsel */}
              <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--bg-2)" }}>
                <Image
                  src={photo.url}
                  alt={photo.title || ""}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="220px"
                />
                {/* Favori sayısı */}
                {photo.favorites?.length > 0 && (
                  <span style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.6)", borderRadius: "999px",
                    padding: "2px 8px", fontSize: "0.72rem", color: "#fff",
                  }}>
                    ❤️ {photo.favorites.length}
                  </span>
                )}
              </div>

              {/* Bilgi + aksiyonlar */}
              <div style={{ padding: "12px" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: "2px", minHeight: "18px" }}>
                  {photo.title || <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>Başlık yok</span>}
                </p>
                {photo.caption && (
                  <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginBottom: "8px", lineHeight: 1.4 }}>
                    {photo.caption}
                  </p>
                )}

                <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                  {/* Sıra */}
                  <button onClick={() => movePhoto(i, -1)} disabled={i === 0} style={smallBtnStyle} title="Yukarı taşı">↑</button>
                  <button onClick={() => movePhoto(i, 1)} disabled={i === photos.length - 1} style={smallBtnStyle} title="Aşağı taşı">↓</button>

                  {/* Düzenle */}
                  <button
                    onClick={() => {
                      setEditId(photo.id);
                      setEditTitle(photo.title ?? "");
                      setEditCaption(photo.caption ?? "");
                    }}
                    style={{ ...smallBtnStyle, flex: 1 }}
                  >
                    ✏️ Düzenle
                  </button>

                  {/* Sil */}
                  <button
                    onClick={() => handleDelete(photo)}
                    disabled={busy === photo.id}
                    style={{ ...smallBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  color: "var(--text-3)",
  marginBottom: "6px",
  fontFamily: "var(--font-mono)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  background: "var(--bg-2)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontSize: "0.88rem",
  outline: "none",
  boxSizing: "border-box",
};

const smallBtnStyle: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: "8px",
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--text-2)",
  fontSize: "0.78rem",
  cursor: "pointer",
  transition: "all 0.15s",
};
