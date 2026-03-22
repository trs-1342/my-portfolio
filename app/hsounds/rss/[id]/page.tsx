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
    return new Date(raw).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const feed = await getRssFeedById(id);
    if (!feed) return { title: "Kaynak bulunamadı — trs" };
    return {
      title: `${feed.source_name} — HSounds · trs`,
      description: `${feed.source_name} RSS kaynağından son gönderiler.`,
    };
  } catch {
    return { title: "HSounds · trs" };
  }
}

export default async function RssFeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let feed;
  try {
    feed = await getRssFeedById(id);
  } catch {
    notFound();
  }
  if (!feed) notFound();

  let posts: Awaited<ReturnType<typeof fetchRssPosts>> = [];
  try {
    posts = await fetchRssPosts(feed.feed_url);
  } catch {
    posts = [];
  }

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px", paddingBottom: "80px" }}>

        {/* Geri */}
        <Link
          href="/hsounds"
          className="mono"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontSize: "0.75rem", color: "var(--text-3)",
            textDecoration: "none", marginBottom: "48px", transition: "color 0.15s",
          }}
        >
          ← hsounds
        </Link>

        {/* Kaynak Başlığı */}
        <header style={{ marginBottom: "52px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "16px",
              background: "var(--accent-dim)", border: "1px solid var(--border-hover)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", flexShrink: 0,
            }}>
              {feed.source_icon}
            </div>
            <div>
              <p className="mono anim-fade-up" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
                rss kaynağı
              </p>
              <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.1 }}>
                {feed.source_name}
              </h1>
            </div>
          </div>

          <div className="anim-fade-up d3" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <a
              href={feed.feed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono"
              style={{ fontSize: "0.72rem", color: "var(--text-3)", textDecoration: "none", padding: "4px 12px", borderRadius: "999px", border: "1px solid var(--border)", background: "var(--bg-2)", transition: "border-color 0.15s" }}
            >
              📡 Feed URL ↗
            </a>
            <span style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
              {posts.length > 0 ? `${posts.length} gönderi` : "Gönderi yüklenemedi"}
            </span>
          </div>
        </header>

        {/* Post Listesi */}
        {posts.length === 0 ? (
          <div className="glass" style={{ borderRadius: "20px", padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: "2rem", marginBottom: "16px" }}>📡</p>
            <p style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>
              Feed yüklenemedi veya henüz içerik yok.
            </p>
            <a href={feed.feed_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ marginTop: "20px", display: "inline-flex" }}>
              Kaynağa Git ↗
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {posts.map((post, i) => (
              <a
                key={post.guid || post.link}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass anim-fade-up"
                style={{
                  display: "block", padding: "24px 28px",
                  borderRadius: "16px", textDecoration: "none",
                  border: "1px solid var(--border)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  animationDelay: `${i * 0.04}s`,
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-hover)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "var(--shadow-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                }}
              >
                {/* Sol accent bar */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--accent)", borderRadius: "0 2px 2px 0" }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Numara + Başlık */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "8px" }}>
                      <span className="mono" style={{ fontSize: "0.65rem", color: "var(--accent)", opacity: 0.6, flexShrink: 0 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 style={{ fontSize: "0.97rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.4, margin: 0 }}>
                        {post.title}
                      </h2>
                    </div>

                    {/* Açıklama */}
                    {post.description && (
                      <p style={{ fontSize: "0.84rem", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "12px" }}>
                        {post.description.length > 200 ? post.description.slice(0, 200) + "…" : post.description}
                      </p>
                    )}

                    {/* Meta */}
                    {post.pubDate && (
                      <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
                        {formatPubDate(post.pubDate)}
                      </p>
                    )}
                  </div>

                  {/* Sağ: ok */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "10px",
                    background: "var(--accent-dim)", border: "1px solid var(--border-hover)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--accent)", fontSize: "0.9rem", flexShrink: 0,
                  }}>
                    ↗
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
