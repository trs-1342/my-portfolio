"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getComments, addComment, deleteComment, toggleCommentLike,
} from "@/lib/firestore";
import type { Comment } from "@/lib/firestore";

/* ── Yardımcılar ── */

function relativeTime(ts: { seconds: number } | null): string {
  if (!ts) return "az önce";
  const diff = Date.now() - ts.seconds * 1000;
  if (diff < 60_000)   return "az önce";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} dk önce`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} sa önce`;
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)} gün önce`;
  return new Date(ts.seconds * 1000).toLocaleDateString("tr-TR");
}

function Avatar({ name, photoURL }: { name: string; photoURL?: string | null }) {
  const initial = (name?.[0] ?? "?").toUpperCase();
  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={name}
        style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.78rem", fontWeight: 700, color: "var(--accent)",
    }}>
      {initial}
    </div>
  );
}

/* ── Tek yorum kartı ── */

interface CommentItemProps {
  comment: Comment;
  currentUid: string | null;
  isAdmin: boolean;
  isReply?: boolean;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onReply?: (id: string) => void;
}

function CommentItem({ comment, currentUid, isAdmin, isReply, onDelete, onLike, onReply }: CommentItemProps) {
  const liked   = currentUid ? comment.likes.includes(currentUid) : false;
  const canDelete = currentUid && (comment.authorUid === currentUid || isAdmin);

  return (
    <div style={{
      display: "flex",
      gap: "10px",
      padding: isReply ? "10px 0" : "12px 0",
    }}>
      <Avatar name={comment.authorName} photoURL={comment.authorPhotoURL} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Üst satır: isim + zaman */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text)" }}>
            {comment.authorName}
          </span>
          <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
            @{comment.authorUsername}
          </span>
          <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
            · {relativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Yorum metni */}
        <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "8px", wordBreak: "break-word" }}>
          {comment.text}
        </p>

        {/* Aksiyonlar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Beğeni */}
          <button
            onClick={() => currentUid && onLike(comment.id)}
            disabled={!currentUid}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "none", border: "none", cursor: currentUid ? "pointer" : "default",
              color: liked ? "#ef4444" : "var(--text-3)", fontSize: "0.78rem",
              padding: 0, fontFamily: "var(--font-sans)", transition: "color 0.15s",
            }}
            title={currentUid ? undefined : "Beğenmek için giriş yap"}
          >
            <span style={{ fontSize: "0.9rem" }}>{liked ? "♥" : "♡"}</span>
            {comment.likes.length > 0 && <span>{comment.likes.length}</span>}
          </button>

          {/* Yanıtla — sadece üst seviye yorumlarda */}
          {!isReply && onReply && currentUid && (
            <button
              onClick={() => onReply(comment.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-3)", fontSize: "0.75rem",
                padding: 0, fontFamily: "var(--font-sans)",
              }}
            >
              Yanıtla
            </button>
          )}

          {/* Sil */}
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#ef4444", fontSize: "0.75rem", opacity: 0.7,
                padding: 0, fontFamily: "var(--font-sans)",
              }}
            >
              Sil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Yorum giriş alanı ── */

function CommentInput({
  placeholder, value, onChange, onSubmit, submitting, autoFocus,
}: {
  placeholder: string; value: string; onChange: (v: string) => void;
  onSubmit: () => void; submitting: boolean; autoFocus?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        autoFocus={autoFocus}
        onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSubmit(); }}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: "10px",
          border: "1px solid var(--border)", background: "var(--bg)",
          color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: "0.875rem",
          outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
        onBlur={e  => (e.target.style.borderColor = "var(--border)")}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button
          onClick={onSubmit}
          disabled={submitting || !value.trim()}
          className="btn btn-accent"
          style={{ padding: "7px 18px", fontSize: "0.82rem" }}
        >
          {submitting ? "Gönderiliyor..." : "Gönder"}
        </button>
      </div>
    </div>
  );
}

/* ── Ana bileşen ── */

export default function Comments({ articleId }: { articleId: string }) {
  const { user, profile } = useAuth();
  const [comments,  setComments]  = useState<Comment[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [text,      setText]      = useState("");
  const [replyTo,   setReplyTo]   = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    getComments(articleId).then(data => {
      setComments(data);
      setLoading(false);
    });
  }, [articleId]);

  const makeComment = (extra: Partial<Comment>, id: string): Comment => ({
    id,
    articleId,
    authorUid:      user!.uid,
    authorName:     profile!.displayName || profile!.username,
    authorUsername: profile!.username,
    authorPhotoURL: profile!.photoURL ?? null,
    text:           "",
    likes:          [],
    parentId:       null,
    createdAt:      null,
    ...extra,
  });

  const handleSubmit = async () => {
    if (!user || !profile || !text.trim()) return;
    setSubmitting(true);
    const id = await addComment({
      articleId,
      authorUid:      user.uid,
      authorName:     profile.displayName || profile.username,
      authorUsername: profile.username,
      authorPhotoURL: profile.photoURL ?? null,
      text:           text.trim(),
      parentId:       null,
    });
    setComments(prev => [...prev, makeComment({ text: text.trim() }, id)]);
    setText("");
    setSubmitting(false);
  };

  const handleReply = async () => {
    if (!user || !profile || !replyTo || !replyText.trim()) return;
    setSubmitting(true);
    const id = await addComment({
      articleId,
      authorUid:      user.uid,
      authorName:     profile.displayName || profile.username,
      authorUsername: profile.username,
      authorPhotoURL: profile.photoURL ?? null,
      text:           replyText.trim(),
      parentId:       replyTo,
    });
    setComments(prev => [...prev, makeComment({ text: replyText.trim(), parentId: replyTo }, id)]);
    setReplyText("");
    setReplyTo(null);
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yorumu silmek istediğinden emin misin?")) return;
    await deleteComment(id);
    /* Yanıtlar da silinsin — cascade (client tarafında) */
    setComments(prev => prev.filter(c => c.id !== id && c.parentId !== id));
  };

  const handleLike = async (id: string) => {
    if (!user) return;
    const c = comments.find(x => x.id === id);
    if (!c) return;
    const liked = c.likes.includes(user.uid);
    setComments(prev => prev.map(x => x.id !== id ? x : {
      ...x,
      likes: liked ? x.likes.filter(u => u !== user.uid) : [...x.likes, user.uid],
    }));
    await toggleCommentLike(id, user.uid, !liked);
  };

  const topLevel = comments.filter(c => c.parentId === null);
  const repliesOf = (parentId: string) => comments.filter(c => c.parentId === parentId);
  const totalCount = comments.length;

  return (
    <section style={{ maxWidth: "720px", margin: "0 auto", paddingTop: "48px" }}>
      {/* Başlık */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <h2 className="mono" style={{ fontSize: "0.78rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Yorumlar
        </h2>
        {totalCount > 0 && (
          <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "999px", background: "rgba(16,185,129,0.1)", color: "var(--accent)", border: "1px solid rgba(16,185,129,0.2)" }}>
            {totalCount}
          </span>
        )}
      </div>

      {/* Yeni yorum */}
      {user && profile ? (
        <div className="glass" style={{ borderRadius: "14px", padding: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <Avatar name={profile.displayName || profile.username} photoURL={profile.photoURL} />
            <span style={{ fontSize: "0.82rem", color: "var(--text-2)", paddingTop: "6px" }}>
              <strong style={{ color: "var(--text)" }}>{profile.displayName || profile.username}</strong> olarak yorum yapıyorsun
            </span>
          </div>
          <CommentInput
            placeholder="Bir şeyler yaz... (Ctrl+Enter ile gönder)"
            value={text}
            onChange={setText}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: "14px", padding: "16px", marginBottom: "24px", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-2)", marginBottom: "12px" }}>
            Yorum yapmak için giriş yap.
          </p>
          <Link href="/login" className="btn btn-accent" style={{ display: "inline-flex", padding: "8px 20px", fontSize: "0.82rem" }}>
            Giriş Yap
          </Link>
        </div>
      )}

      {/* Yorum listesi */}
      {loading ? (
        <p className="mono" style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>Yorumlar yükleniyor...</p>
      ) : topLevel.length === 0 ? (
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", textAlign: "center", padding: "32px 0" }}>
          Henüz yorum yok. İlk yorumu sen yap!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {topLevel.map((c, i) => {
            const replies = repliesOf(c.id);
            const isLast  = i === topLevel.length - 1;

            return (
              <div key={c.id}>
                {/* Üst seviye yorum */}
                <div style={{ borderBottom: isLast && replies.length === 0 && replyTo !== c.id ? "none" : "1px solid var(--border)" }}>
                  <CommentItem
                    comment={c}
                    currentUid={user?.uid ?? null}
                    isAdmin={isAdmin}
                    onDelete={handleDelete}
                    onLike={handleLike}
                    onReply={(id) => {
                      setReplyTo(prev => prev === id ? null : id);
                      setReplyText("");
                    }}
                  />
                </div>

                {/* Yanıtlar */}
                {(replies.length > 0 || replyTo === c.id) && (
                  <div style={{
                    marginLeft: "42px",
                    paddingLeft: "14px",
                    borderLeft: "2px solid var(--border)",
                    marginBottom: "4px",
                  }}>
                    {replies.map((r, ri) => (
                      <div key={r.id} style={{ borderBottom: ri < replies.length - 1 || replyTo === c.id ? "1px solid var(--border)" : "none" }}>
                        <CommentItem
                          comment={r}
                          currentUid={user?.uid ?? null}
                          isAdmin={isAdmin}
                          isReply
                          onDelete={handleDelete}
                          onLike={handleLike}
                        />
                      </div>
                    ))}

                    {/* Yanıt input */}
                    {replyTo === c.id && (
                      <div style={{ padding: "12px 0" }}>
                        <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                          <Avatar name={profile?.displayName || profile?.username || "?"} photoURL={profile?.photoURL} />
                          <CommentInput
                            placeholder={`@${c.authorUsername}'e yanıt ver...`}
                            value={replyText}
                            onChange={setReplyText}
                            onSubmit={handleReply}
                            submitting={submitting}
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => { setReplyTo(null); setReplyText(""); }}
                          style={{ fontSize: "0.75rem", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-sans)" }}
                        >
                          İptal
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!isLast && <div style={{ height: "1px", background: "var(--border)", margin: "0" }} />}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
