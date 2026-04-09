"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { toggleArticleLike } from "@/lib/firestore";
import type { Article, RssFeed, Announcement } from "@/lib/hsounds";

type Tab      = "articles" | "rss" | "announcements";
type ArtSort  = "date-desc" | "date-asc" | "time-asc" | "time-desc" | "az";
type RssSort  = "az" | "za";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

function readTimeLabel(min: number): string {
  return `${String(min).padStart(2, "0")}:00 dk`;
}

/* ── Like butonu ─────────────────────────────────────────── */
function LikeButton({
  articleId,
  likes,
  uid,
  onToggle,
}: {
  articleId: string;
  likes: string[];
  uid: string | null;
  onToggle: (id: string, liked: boolean) => void;
}) {
  const liked = uid ? likes.includes(uid) : false;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uid) return;
    onToggle(articleId, liked);
    await toggleArticleLike(articleId, uid, !liked);
  };

  return (
    <button
      onClick={handleClick}
      title={uid ? (liked ? "Beğeniyi kaldır" : "Beğen") : "Beğenmek için giriş yap"}
      style={{
        background: "none",
        border: "none",
        cursor: uid ? "pointer" : "default",
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        borderRadius: "6px",
        transition: "background 0.15s",
        color: liked ? "#ef4444" : "var(--text-3)",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { if (uid) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-2)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="mono" style={{ fontSize: "0.68rem" }}>{likes.length}</span>
    </button>
  );
}

/* ── Makale satırı ───────────────────────────────────────── */
function ArticleRow({
  article,
  index,
  uid,
  localLikes,
  onLikeToggle,
}: {
  article: Article;
  index: number;
  uid: string | null;
  localLikes: string[];
  onLikeToggle: (id: string, liked: boolean) => void;
}) {
  return (
    <div
      className="hsounds-row anim-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <a href={`/hsounds/${article.slug}`} className="hsounds-row__link">
        {/* Sol ikon */}
        <div className="hsounds-row__icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            {[2, 5, 1, 7, 3, 6, 2, 5].map((h, i) => (
              <rect key={i} x={i * 2} y={8 - h} width="1.5" height={h * 2} rx="0.75" fill="var(--accent)" opacity={0.7 + i * 0.03} />
            ))}
          </svg>
        </div>

        {/* Orta: başlık + excerpt */}
        <div className="hsounds-row__body">
          <p className="hsounds-row__title">{article.title}</p>
          <p className="hsounds-row__sub">{article.excerpt}</p>
        </div>

        {/* Sağ: tarih + süre */}
        <div className="hsounds-row__meta">
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--accent)" }}>
            {readTimeLabel(article.read_time)}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
            {formatDate(article.created_at)}
          </span>
        </div>
      </a>

      {/* Like butonu — linkin dışında */}
      <LikeButton
        articleId={article.id}
        likes={localLikes}
        uid={uid}
        onToggle={onLikeToggle}
      />
    </div>
  );
}

/* ── RSS satırı ──────────────────────────────────────────── */
function RssRow({ feed, index }: { feed: RssFeed; index: number }) {
  return (
    <a
      href={`/hsounds/rss/${feed.id}`}
      className="hsounds-row anim-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="hsounds-row__link" style={{ flex: 1, display: "flex", alignItems: "center", gap: "16px" }}>
        <div className="hsounds-row__icon" style={{ fontSize: "1.1rem" }}>
          {feed.source_icon}
        </div>
        <div className="hsounds-row__body">
          <p className="hsounds-row__title">{feed.source_name}</p>
          <p className="hsounds-row__sub">RSS Kaynağı</p>
        </div>
        <div className="hsounds-row__meta">
          <span style={{ fontSize: "0.95rem", color: "var(--accent)" }}>→</span>
        </div>
      </div>
    </a>
  );
}

/* ── Duyuru satırı ───────────────────────────────────────── */
function AnnouncementRow({ announcement, index }: { announcement: Announcement; index: number }) {
  return (
    <div
      className="hsounds-row anim-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="hsounds-row__link" style={{ flex: 1, display: "flex", alignItems: "center", gap: "16px", cursor: "default" }}>
        {/* Sol ikon */}
        <div className="hsounds-row__icon" style={{ fontSize: "1.1rem" }}>
          {announcement.pinned ? "📌" : "📣"}
        </div>

        {/* Orta: başlık + özet */}
        <div className="hsounds-row__body">
          <p className="hsounds-row__title">
            {announcement.pinned && (
              <span className="mono" style={{ fontSize: "0.62rem", color: "var(--accent)", marginRight: "6px", verticalAlign: "middle" }}>
                SABİT
              </span>
            )}
            {announcement.title}
          </p>
          <p className="hsounds-row__sub">{announcement.excerpt}</p>
        </div>

        {/* Sağ: tarih */}
        <div className="hsounds-row__meta">
          <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
            {formatDate(announcement.created_at)}
          </span>
        </div>
      </div>

      {/* İçerik genişletme butonu */}
      <AnnouncementExpand content={announcement.content} />
    </div>
  );
}

/* ── Duyuru genişletme ───────────────────────────────────── */
function AnnouncementExpand({ content }: { content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: "0 18px 12px", fontSize: "0.75rem", color: "var(--text-3)",
          fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: "4px",
        }}
      >
        {open ? "▲ Gizle" : "▼ Detay"}
      </button>
      {open && (
        <div
          className="announcement-content"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            padding: "0 18px 18px",
            fontSize: "0.88rem",
            color: "var(--text-2)",
            lineHeight: 1.75,
            borderTop: "1px solid var(--border)",
            paddingTop: "14px",
            marginTop: "2px",
          }}
        />
      )}
    </div>
  );
}

/* ── Ana bileşen ─────────────────────────────────────────── */
export default function ContentToggle({
  articles,
  rssFeeds,
  announcements,
}: {
  articles: Article[];
  rssFeeds: RssFeed[];
  announcements: Announcement[];
}) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [tab,        setTab]        = useState<Tab>("articles");
  const [search,     setSearch]     = useState("");
  const [artSort,    setArtSort]    = useState<ArtSort>("date-desc");
  const [rssSort,    setRssSort]    = useState<RssSort>("az");

  /* Optimistic like state */
  const [likesMap, setLikesMap] = useState<Record<string, string[]>>(() => {
    const m: Record<string, string[]> = {};
    for (const a of articles) m[a.id] = a.likes ?? [];
    return m;
  });

  const handleLikeToggle = (id: string, wasLiked: boolean) => {
    if (!uid) return;
    setLikesMap((prev) => {
      const cur = prev[id] ?? [];
      return {
        ...prev,
        [id]: wasLiked ? cur.filter((u) => u !== uid) : [...cur, uid],
      };
    });
  };

  /* Filtrelenmiş + sıralanmış makaleler */
  const filteredArticles = useMemo(() => {
    let list = articles.filter((a) =>
      search.trim() === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase()),
    );

    switch (artSort) {
      case "date-desc": list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at)); break;
      case "date-asc":  list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at)); break;
      case "time-asc":  list = [...list].sort((a, b) => a.read_time - b.read_time);                break;
      case "time-desc": list = [...list].sort((a, b) => b.read_time - a.read_time);                break;
      case "az":        list = [...list].sort((a, b) => a.title.localeCompare(b.title, "tr"));     break;
    }
    return list;
  }, [articles, search, artSort]);

  /* Filtrelenmiş + sıralanmış RSS */
  const filteredFeeds = useMemo(() => {
    let list = rssFeeds.filter((f) =>
      search.trim() === "" ||
      f.source_name.toLowerCase().includes(search.toLowerCase()),
    );
    if (rssSort === "az") list = [...list].sort((a, b) => a.source_name.localeCompare(b.source_name, "tr"));
    else                  list = [...list].sort((a, b) => b.source_name.localeCompare(a.source_name, "tr"));
    return list;
  }, [rssFeeds, search, rssSort]);

  /* Filtrelenmiş duyurular */
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) =>
      search.trim() === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase()),
    );
  }, [announcements, search]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "articles",      label: "📝 Makaleler" },
    { key: "rss",           label: "📡 RSS Akışları" },
    { key: "announcements", label: "📣 Duyurular" },
  ];

  /* Seçili sekmeye göre okuma süresi bilgisi */
  const tabStat = useMemo(() => {
    if (tab === "articles") {
      const totalMin = articles.reduce((s, a) => s + (a.read_time ?? 0), 0);
      return `${totalMin} dk toplam okuma`;
    }
    if (tab === "rss") {
      return `${rssFeeds.length} kaynak takip ediliyor`;
    }
    return `${announcements.length} duyuru`;
  }, [tab, articles, rssFeeds, announcements]);

  return (
    <div>
      {/* ── Tab + stat satırı ── */}
      <div style={{ marginBottom: "20px" }}>
        {/* Sekmeler — yatay kaydırılabilir */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", marginBottom: "12px" }}>
          <div className="glass" style={{ display: "inline-flex", padding: "5px", borderRadius: "999px", gap: "4px", minWidth: "max-content" }}>
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setSearch(""); }}
                style={{
                  padding: "8px 20px", borderRadius: "999px", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 600,
                  transition: "all 0.25s var(--spring)",
                  background: tab === key ? "var(--accent)" : "transparent",
                  color:      tab === key ? "#fff" : "var(--text-2)",
                  boxShadow:  tab === key ? "0 2px 12px var(--accent-glow)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dinamik stat */}
        <p className="mono" style={{ fontSize: "0.72rem", color: "var(--text-3)", letterSpacing: "0.06em" }}>
          {tabStat}
        </p>
      </div>

      {/* ── Araç çubuğu: arama + sıralama ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* Arama */}
        <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            color: "var(--text-3)", fontSize: "0.85rem", pointerEvents: "none",
          }}>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === "articles"      ? "Makale ara..." :
              tab === "rss"           ? "Kaynak ara..."  :
                                       "Duyuru ara..."
            }
            style={{
              width: "100%", padding: "9px 14px 9px 32px", borderRadius: "10px",
              border: "1px solid var(--border)", background: "var(--panel)",
              color: "var(--text)", fontFamily: "var(--font-sans)",
              fontSize: "0.84rem", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Sıralama — sadece makaleler ve RSS için */}
        {tab === "articles" ? (
          <select
            value={artSort}
            onChange={(e) => setArtSort(e.target.value as ArtSort)}
            style={{
              padding: "9px 14px", borderRadius: "10px",
              border: "1px solid var(--border)", background: "var(--panel)",
              color: "var(--text-2)", fontFamily: "var(--font-sans)",
              fontSize: "0.84rem", outline: "none", cursor: "pointer",
            }}
          >
            <option value="date-desc">Tarih: Yeni → Eski</option>
            <option value="date-asc">Tarih: Eski → Yeni</option>
            <option value="time-asc">Okuma: Kısa → Uzun</option>
            <option value="time-desc">Okuma: Uzun → Kısa</option>
            <option value="az">Başlık: A → Z</option>
          </select>
        ) : tab === "rss" ? (
          <select
            value={rssSort}
            onChange={(e) => setRssSort(e.target.value as RssSort)}
            style={{
              padding: "9px 14px", borderRadius: "10px",
              border: "1px solid var(--border)", background: "var(--panel)",
              color: "var(--text-2)", fontFamily: "var(--font-sans)",
              fontSize: "0.84rem", outline: "none", cursor: "pointer",
            }}
          >
            <option value="az">Kaynak: A → Z</option>
            <option value="za">Kaynak: Z → A</option>
          </select>
        ) : null}
      </div>

      {/* ── İçerik listesi ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {tab === "articles" ? (
          filteredArticles.length > 0
            ? filteredArticles.map((a, i) => (
                <ArticleRow
                  key={a.id}
                  article={a}
                  index={i}
                  uid={uid}
                  localLikes={likesMap[a.id] ?? []}
                  onLikeToggle={handleLikeToggle}
                />
              ))
            : <p style={{ fontSize: "0.84rem", color: "var(--text-3)", textAlign: "center", padding: "32px 0" }}>Sonuç bulunamadı.</p>
        ) : tab === "rss" ? (
          filteredFeeds.length > 0
            ? filteredFeeds.map((r, i) => <RssRow key={r.id} feed={r} index={i} />)
            : <p style={{ fontSize: "0.84rem", color: "var(--text-3)", textAlign: "center", padding: "32px 0" }}>Sonuç bulunamadı.</p>
        ) : (
          filteredAnnouncements.length > 0
            ? filteredAnnouncements.map((a, i) => <AnnouncementRow key={a.id} announcement={a} index={i} />)
            : <p style={{ fontSize: "0.84rem", color: "var(--text-3)", textAlign: "center", padding: "32px 0" }}>Henüz duyuru yok.</p>
        )}
      </div>

      {/* ── Stiller ── */}
      <style>{`
        .hsounds-row {
          display: flex;
          flex-direction: column;
          padding: 0;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--panel);
          backdrop-filter: blur(12px);
          text-decoration: none;
          cursor: default;
          transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .hsounds-row > .hsounds-row__link,
        .hsounds-row > a.hsounds-row__link {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        /* Makale ve RSS satırları için tek satır layout */
        .hsounds-row.article-row,
        .hsounds-row.rss-row {
          flex-direction: row;
          align-items: center;
        }
        .hsounds-row::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 0;
          background: var(--accent);
          border-radius: 0 2px 2px 0;
          transition: width 0.2s var(--spring);
          pointer-events: none;
        }
        .hsounds-row:hover {
          background: var(--panel-hover);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-hover);
        }
        .hsounds-row:hover::before { width: 3px; }

        /* Makale satırı: link + like butonu yan yana */
        .hsounds-row__link {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
          padding: 14px 18px;
          text-decoration: none;
          cursor: pointer;
          color: inherit;
        }
        /* RSS satırı için link tam row */
        a.hsounds-row { cursor: pointer; flex-direction: row; }
        a.hsounds-row .hsounds-row__link { padding: 14px 18px; }

        .hsounds-row__icon {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: var(--accent-dim);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .hsounds-row__body { flex: 1; min-width: 0; }
        .hsounds-row__title {
          font-size: 0.92rem; font-weight: 600; color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 3px;
        }
        .hsounds-row__sub {
          font-size: 0.78rem; color: var(--text-2);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .hsounds-row__meta {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 4px; flex-shrink: 0;
        }
        .announcement-content h1, .announcement-content h2, .announcement-content h3 {
          color: var(--text); font-weight: 700; margin: 1em 0 0.5em;
        }
        .announcement-content p { margin: 0 0 0.75em; }
        .announcement-content a { color: var(--accent); }
        .announcement-content code {
          font-family: var(--font-mono); font-size: 0.85em;
          background: var(--bg-2); padding: 1px 5px; border-radius: 4px;
        }
        @media (max-width: 540px) {
          .hsounds-row__meta { display: none; }
        }
      `}</style>
    </div>
  );
}
