import { notFound } from "next/navigation";
import Link from "next/link";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleLikeButton from "@/components/hsounds/ArticleLikeButton";
import { getArticleBySlug } from "@/lib/hsounds";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";

/* ── Metadata ─────────────────────────────────────────────── */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Makale bulunamadı — trs" };

  const metaStr = `${article.read_time} dk okuma  ·  ${new Date(article.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}`;
  const ogUrl   = `${BASE_URL}/api/og?` + new URLSearchParams({
    title: article.title,
    desc:  article.excerpt,
    type:  "article",
    meta:  metaStr,
  }).toString();

  return {
    title: `${article.title} — trs`,
    description: article.excerpt,
    openGraph: {
      title:       `${article.title} — trs`,
      description: article.excerpt,
      url:         `${BASE_URL}/hsounds/${slug}`,
      type:        "article",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${article.title} — trs`,
      description: article.excerpt,
      images:      [ogUrl],
    },
  };
}

/* ── Tarih formatlama ─────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Sayfa ────────────────────────────────────────────────── */
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px", paddingBottom: "80px" }}>

        {/* Geri butonu */}
        <Link
          href="/hsounds"
          className="mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.75rem",
            color: "var(--text-3)",
            textDecoration: "none",
            marginBottom: "40px",
            transition: "color 0.15s",
          }}
          onMouseOver={undefined}
        >
          ← hsounds
        </Link>

        {/* Makale ana kartı */}
        <article style={{ maxWidth: "720px", margin: "0 auto" }}>

          {/* Üst meta */}
          <header style={{ marginBottom: "48px" }}>
            <p
              className="mono anim-fade-up"
              style={{
                fontSize: "0.7rem",
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              /hsounds/makale
              <span style={{ color: "var(--border)" }}>·</span>
              {formatDate(article.created_at)}
              <span style={{ color: "var(--border)" }}>·</span>
              <span style={{ color: "var(--accent)" }}>{article.read_time} dk okuma</span>
            </p>

            <h1
              className="anim-fade-up d2"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
                color: "var(--text)",
                marginBottom: "18px",
              }}
            >
              {article.title}
            </h1>

            <p
              className="anim-fade-up d3"
              style={{
                fontSize: "1.05rem",
                color: "var(--text-2)",
                lineHeight: 1.7,
                borderLeft: "3px solid var(--accent)",
                paddingLeft: "16px",
              }}
            >
              {article.excerpt}
            </p>
          </header>

          {/* Ayraç */}
          <div
            className="anim-fade-up d4"
            style={{
              height: "1px",
              background: "linear-gradient(90deg, var(--accent) 0%, var(--border) 60%, transparent 100%)",
              marginBottom: "48px",
            }}
          />

          {/* İçerik */}
          <div
            className="glass anim-fade-up d5"
            style={{ borderRadius: "20px", padding: "clamp(24px, 5vw, 48px)" }}
          >
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Alt: yazar + tarih */}
          <div
            className="anim-fade-up d6"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "40px",
              padding: "20px 0",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="mono"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                trs
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>trs</p>
                <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
                  {formatDate(article.created_at)}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ArticleLikeButton
                articleId={article.id}
                initialLikes={article.likes ?? []}
              />
              <Link href="/hsounds" className="btn btn-ghost" style={{ fontSize: "0.82rem" }}>
                ← Tüm Yazılar
              </Link>
            </div>
          </div>

        </article>

        <Footer />
      </div>

      {/* Makale tipografi stilleri */}
      <style>{`
        .article-body { color: var(--text-2); font-size: 0.97rem; line-height: 1.85; }
        .article-body p { margin-bottom: 1.4em; }
        .article-body h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          margin: 2em 0 0.8em;
          letter-spacing: -0.02em;
        }
        .article-body strong { color: var(--text); font-weight: 600; }
        .article-body em { color: var(--text); font-style: italic; }
        .article-body blockquote {
          border-left: 3px solid var(--accent);
          padding: 12px 20px;
          margin: 1.8em 0;
          background: var(--accent-dim);
          border-radius: 0 10px 10px 0;
          color: var(--text);
          font-style: italic;
        }
        .article-body pre {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 20px;
          overflow-x: auto;
          margin: 1.5em 0;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          line-height: 1.7;
          color: #10B981;
        }
        .article-body code {
          font-family: var(--font-mono);
          font-size: 0.84em;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 4px;
          padding: 2px 6px;
          color: var(--accent);
        }
        .article-body pre code {
          background: none;
          border: none;
          padding: 0;
          color: inherit;
          font-size: inherit;
        }
        a[href="/hsounds"]:not(.btn):hover { color: var(--accent); }
      `}</style>
    </>
  );
}
