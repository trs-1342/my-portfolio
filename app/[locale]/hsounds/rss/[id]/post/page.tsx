import { notFound } from "next/navigation";
import Link from "next/link";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getRssFeedById, fetchRssPosts } from "@/lib/hsounds";

export const dynamic = "force-dynamic";

function formatPubDate(raw: string) {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return raw;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guid?: string }>;
}) {
  try {
    const { id } = await params;
    const { guid } = await searchParams;
    const feed = await getRssFeedById(id);
    if (!feed || !guid) return { title: "Gönderi — HSounds · trs" };
    const posts = await fetchRssPosts(feed.feed_url);
    const post = posts.find((p) => (p.guid || p.link) === guid);
    if (!post) return { title: `${feed.source_name} — HSounds · trs` };
    return {
      title: `${post.title} — ${feed.source_name} · trs`,
      description: post.description || `${feed.source_name} kaynağından bir gönderi.`,
    };
  } catch {
    return { title: "HSounds · trs" };
  }
}

export default async function RssPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guid?: string }>;
}) {
  const { id } = await params;
  const { guid } = await searchParams;

  if (!guid) notFound();

  let feed = null;
  try {
    feed = await getRssFeedById(id);
  } catch { /* ignore */ }
  if (!feed) notFound();

  let posts: Awaited<ReturnType<typeof fetchRssPosts>> = [];
  try {
    posts = await fetchRssPosts(feed.feed_url);
  } catch { /* ignore */ }

  const post = posts.find((p) => (p.guid || p.link) === guid) ?? null;
  if (!post) notFound();

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px", paddingBottom: "80px" }}>

        {/* Geri */}
        <Link
          href={`/hsounds/rss/${id}`}
          className="mono"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontSize: "0.75rem", color: "var(--text-3)",
            textDecoration: "none", marginBottom: "48px", transition: "color 0.15s",
          }}
        >
          ← {feed.source_name}
        </Link>

        {/* Kaynak rozeti */}
        <div className="anim-fade-up" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <span style={{ fontSize: "1.2rem" }}>{feed.source_icon}</span>
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {feed.source_name}
          </span>
          {post.pubDate && (
            <>
              <span style={{ color: "var(--border-hover)", fontSize: "0.7rem" }}>·</span>
              <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
                {formatPubDate(post.pubDate)}
              </span>
            </>
          )}
        </div>

        {/* Başlık */}
        <h1
          className="anim-fade-up d2"
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            lineHeight: 1.15,
            marginBottom: "32px",
            maxWidth: "760px",
          }}
        >
          {post.title}
        </h1>

        {/* Özet kutusu */}
        {post.description && (
          <div
            className="glass anim-fade-up d3"
            style={{
              borderRadius: "16px",
              padding: "28px 32px",
              marginBottom: "40px",
              maxWidth: "760px",
              borderLeft: "3px solid var(--accent)",
              position: "relative",
            }}
          >
            <p className="mono" style={{ fontSize: "0.65rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Özet
            </p>
            <p style={{ fontSize: "1rem", color: "var(--text-2)", lineHeight: 1.75 }}>
              {post.description}
            </p>
          </div>
        )}

        {/* Orijinale git butonu */}
        <div className="anim-fade-up d4" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent"
            style={{ padding: "14px 28px", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            Orijinal Yazıya Git ↗
          </a>
          <Link
            href={`/hsounds/rss/${id}`}
            className="btn btn-ghost"
            style={{ padding: "14px 20px", fontSize: "0.9rem" }}
          >
            ← Geri Dön
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
}
