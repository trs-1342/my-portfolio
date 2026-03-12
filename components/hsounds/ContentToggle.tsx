"use client";

import { useState } from "react";
import type { Article, RssFeed } from "@/lib/hsounds";

type Tab = "articles" | "rss";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function readTimeLabel(min: number): string {
  const m = String(min).padStart(2, "0");
  return `${m}:00 dk`;
}

/* Makale satırı */
function ArticleRow({ article, index }: { article: Article; index: number }) {
  return (
    <a
      href={`/hsounds/${article.slug}`}
      className="hsounds-row anim-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Sol ikon */}
      <div className="hsounds-row__icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          {[2, 5, 1, 7, 3, 6, 2, 5].map((h, i) => (
            <rect
              key={i}
              x={i * 2}
              y={8 - h}
              width="1.5"
              height={h * 2}
              rx="0.75"
              fill="var(--accent)"
              opacity={0.7 + i * 0.03}
            />
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
  );
}

/* RSS satırı */
function RssRow({ feed, index }: { feed: RssFeed; index: number }) {
  return (
    <a
      href={feed.link}
      target="_blank"
      rel="noopener noreferrer"
      className="hsounds-row anim-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Sol ikon */}
      <div className="hsounds-row__icon" style={{ fontSize: "1.1rem" }}>
        {feed.source_icon}
      </div>

      {/* Orta: başlık + kaynak */}
      <div className="hsounds-row__body">
        <p className="hsounds-row__title">{feed.title}</p>
        <p className="hsounds-row__sub">{feed.source_name}</p>
      </div>

      {/* Sağ: external link + tarih */}
      <div className="hsounds-row__meta">
        <span style={{ fontSize: "0.95rem", color: "var(--accent)" }}>↗</span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
          {formatDate(feed.published_date)}
        </span>
      </div>
    </a>
  );
}

/* Ana bileşen */
export default function ContentToggle({
  articles,
  rssFeeds,
}: {
  articles: Article[];
  rssFeeds: RssFeed[];
}) {
  const [tab, setTab] = useState<Tab>("articles");

  return (
    <div>
      {/* Pill toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "36px",
        }}
      >
        <div
          className="glass"
          style={{
            display: "inline-flex",
            padding: "5px",
            borderRadius: "999px",
            gap: "4px",
          }}
        >
          {(["articles", "rss"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 22px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 600,
                transition: "all 0.25s var(--spring)",
                background: tab === t ? "var(--accent)" : "transparent",
                color: tab === t ? "#fff" : "var(--text-2)",
                boxShadow: tab === t ? "0 2px 12px var(--accent-glow)" : "none",
              }}
            >
              {t === "articles" ? "📝 Makaleler" : "📡 RSS Akışları"}
            </button>
          ))}
        </div>
      </div>

      {/* İçerik listesi */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {tab === "articles"
          ? articles.map((a, i) => <ArticleRow key={a.id} article={a} index={i} />)
          : rssFeeds.map((r, i) => <RssRow key={r.id} feed={r} index={i} />)}
      </div>

      {/* Playlist satır stilleri */}
      <style>{`
        .hsounds-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--panel);
          backdrop-filter: blur(12px);
          text-decoration: none;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .hsounds-row::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: var(--accent);
          border-radius: 0 2px 2px 0;
          transition: width 0.2s var(--spring);
        }
        .hsounds-row:hover {
          background: var(--panel-hover);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-hover);
        }
        .hsounds-row:hover::before {
          width: 3px;
        }
        .hsounds-row__icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--accent-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hsounds-row__body {
          flex: 1;
          min-width: 0;
        }
        .hsounds-row__title {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 3px;
        }
        .hsounds-row__sub {
          font-size: 0.78rem;
          color: var(--text-2);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hsounds-row__meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }
        @media (max-width: 540px) {
          .hsounds-row__meta { display: none; }
        }
      `}</style>
    </div>
  );
}
