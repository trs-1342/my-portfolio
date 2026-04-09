"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toggleArticleLike } from "@/lib/firestore";
import LikesCard from "./LikesCard";

export default function ArticleLikeButton({
  articleId,
  initialLikes,
}: {
  articleId: string;
  initialLikes: string[];
}) {
  const { user, profile } = useAuth();
  const uid      = user?.uid ?? null;
  const username = profile?.username ?? "";

  const [likes,     setLikes]     = useState<string[]>(initialLikes);
  const [loading,   setLoading]   = useState(false);
  const [showCard,  setShowCard]  = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  /* Geriye dönük uyumluluk: hem UID hem username kontrol */
  const identifier = username || uid || "";
  const liked = uid
    ? likes.includes(uid) || (username ? likes.includes(username) : false)
    : false;

  const handleClick = async () => {
    if (!uid || loading) return;
    const next = !liked;

    /* Optimistic update */
    setLikes((prev) => {
      const cleaned = prev.filter((l) => l !== uid && l !== identifier);
      return next ? [...cleaned, identifier] : cleaned;
    });

    setLoading(true);
    try {
      await toggleArticleLike(articleId, uid, username, next);
    } catch {
      /* Hata durumunda geri al */
      setLikes(initialLikes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {/* Beğen butonu */}
      <button
        ref={anchorRef}
        onClick={handleClick}
        disabled={!uid || loading}
        title={uid ? (liked ? "Beğeniyi kaldır" : "Beğen") : "Beğenmek için giriş yap"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          borderRadius: likes.length > 0 ? "999px 0 0 999px" : "999px",
          border: `1px solid ${liked ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
          borderRight: likes.length > 0 ? "none" : undefined,
          background: liked ? "rgba(239,68,68,0.08)" : "transparent",
          color: liked ? "#ef4444" : "var(--text-3)",
          cursor: uid ? "pointer" : "default",
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
          fontWeight: 600,
          transition: "all 0.2s",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth={2.2}
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>{liked ? "Beğenildi" : "Beğen"}</span>
      </button>

      {/* Beğeni sayısı — tıklanınca kart açılır */}
      {likes.length > 0 && (
        <button
          onClick={() => setShowCard((p) => !p)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 14px",
            borderRadius: "0 999px 999px 0",
            border: `1px solid ${liked ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
            background: liked ? "rgba(239,68,68,0.08)" : "transparent",
            color: liked ? "#ef4444" : "var(--text-3)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          {likes.length}
        </button>
      )}

      {/* LikesCard popup */}
      {showCard && (
        <LikesCard
          likes={likes}
          onClose={() => setShowCard(false)}
          anchorRef={anchorRef}
        />
      )}
    </div>
  );
}
