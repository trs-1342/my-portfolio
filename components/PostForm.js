"use client";
import { useState } from "react";

export default function PostForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!title.trim() || !content.trim()) {
      setErr("Başlık ve metin zorunlu.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, content }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || "Hata");
      // formu temizle
      setTitle("");
      setDescription("");
      setContent("");
      onCreated?.(j.post);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <div className="field">
        <label>Başlık</label>
        <input
          type="text"
          placeholder="Örn: İlk yazım"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          required
        />
      </div>

      <div className="field">
        <label>Açıklama</label>
        <input
          type="text"
          placeholder="Kısa özet (opsiyonel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={240}
        />
      </div>

      <div className="field">
        <label>Metin</label>
        <textarea
          rows={8}
          placeholder="Yazınız..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      {err && <p className="error">{err}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Gönderiliyor..." : "Yayınla"}
      </button>

      {/* Basit stiller (var olan tema ile uyumlu) */}
      <style jsx>{`
        .post-form {
          display: grid;
          gap: 12px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 16px;
        }
        .field label {
          display: block;
          font-weight: 700;
          margin-bottom: 6px;
        }
        input,
        textarea {
          width: 100%;
          background: var(--panel-2);
          color: var(--text);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 10px;
        }
        input::placeholder,
        textarea::placeholder {
          color: var(--text-2);
        }
        .error {
          color: #ff7b7b;
          font-weight: 600;
        }
        button {
          background: var(--text);
          color: var(--bg);
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 800;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
