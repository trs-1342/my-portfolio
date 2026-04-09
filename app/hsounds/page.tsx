import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Waveform from "@/components/hsounds/Waveform";
import ContentToggle from "@/components/hsounds/ContentToggle";
import { getArticles, getRssFeeds, getAnnouncements } from "@/lib/hsounds";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";
const _ogUrl   = `${BASE_URL}/api/og?` + new URLSearchParams({ title: "HSounds", desc: "Halil'in Sesleri — makaleler, RSS akışları ve duyurular.", type: "hsounds" }).toString();

export const metadata = {
  title: "HSounds — trs",
  description: "Halil'in Sesleri — makaleler, RSS akışları ve duyurular.",
  openGraph: {
    title: "HSounds — trs",
    description: "Halil'in Sesleri — makaleler, RSS akışları ve duyurular.",
    url: `${BASE_URL}/hsounds`,
    images: [{ url: _ogUrl, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "HSounds — trs", images: [_ogUrl] },
};

export default async function HSoundsPage() {
  const [articles, rssFeeds, announcements] = await Promise.all([
    getArticles(),
    getRssFeeds(),
    getAnnouncements(),
  ]);

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px" }}>
        {/* Header */}
        <header style={{ marginBottom: "60px" }}>
          <p
            className="mono anim-fade-up d1"
            style={{
              fontSize: "0.72rem",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "12px",
            }}
          >
            /hsounds
          </p>

          {/* Başlık + ses dalgası yan yana */}
          <div
            className="anim-fade-up d2"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                color: "var(--text)",
                whiteSpace: "nowrap",
              }}
            >
              HSounds
            </h1>

            {/* Kozmik ses dalgası animasyonu */}
            <Waveform />
          </div>

          <p
            className="anim-fade-up d3"
            style={{
              color: "var(--text-2)",
              fontSize: "0.96rem",
              lineHeight: 1.7,
              maxWidth: "560px",
            }}
          >
            Halil&apos;in Sesleri — yazılım, sistem programlama ve düşünceler üzerine makaleler;
            takip ettiğim RSS akışları ve duyurular.
          </p>

          {/* İstatistik rozetleri */}
          <div
            className="anim-fade-up d4"
            style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}
          >
            {[
              { label: "Makale", value: articles.length },
              { label: "RSS Kaynağı", value: rssFeeds.length },
              { label: "Duyuru", value: announcements.length },
            ].map((s) => (
              <div
                key={s.label}
                className="glass"
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--accent)" }}
                >
                  {s.value}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-2)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Tab + içerik */}
        <div className="anim-fade-up d5">
          <ContentToggle articles={articles} rssFeeds={rssFeeds} announcements={announcements} />
        </div>

        <Footer />
      </div>
    </>
  );
}
