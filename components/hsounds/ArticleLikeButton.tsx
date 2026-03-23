"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toggleArticleLike } from "@/lib/firestore";

export default function ArticleLikeButton({
  articleId,
  initialLikes,
}: {
  articleId: string;
  initialLikes: string[];
}) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [likes,   setLikes]   = useState<string[]>(initialLikes);
  const [loading, setLoading] = useState(false);

  const liked = uid ? likes.includes(uid) : false;

  const handleClick = async () => {
    if (!uid || loading) return;

    /* Optimistic update */
    setLikes((prev) =>
      liked ? prev.filter((u) => u !== uid) : [...prev, uid],
    );

    setLoading(true);
    try {
      await toggleArticleLike(articleId, uid, !liked);
    } catch {
      /* Hata durumunda geri al */
      setLikes((prev) =>
        liked ? [...prev, uid] : prev.filter((u) => u !== uid),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!uid || loading}
      title={uid ? (liked ? "Beğeniyi kaldır" : "Beğen") : "Beğenmek için giriş yap"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 20px",
        borderRadius: "999px",
        border: `1px solid ${liked ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
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
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{likes.length} Beğeni</span>
    </button>
  );
}
