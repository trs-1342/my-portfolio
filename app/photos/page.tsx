import { readdirSync } from "fs";
import { join } from "path";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MasonryGallery from "@/components/photos/MasonryGallery";
import BlockedPage from "@/components/BlockedPage";
import { getServerProfile, isBlocked } from "@/lib/getServerProfile";

export const metadata = {
  title: "Fotoğraflar — trs",
  description: "Fotoğraf galerisi.",
};

function getPhotos(): string[] {
  try {
    const dir = join(process.cwd(), "public", "myphotos");
    return readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
      .sort()
      .map((f) => `/myphotos/${f}`);
  } catch {
    return [];
  }
}

export default async function PhotosPage() {
  const [profile, photos] = await Promise.all([getServerProfile(), Promise.resolve(getPhotos())]);
  if (isBlocked(profile, "/photos")) {
    return (
      <>
        <AmbientGlow />
        <Navbar />
        <BlockedPage profile={profile!} currentPath="/photos" />
      </>
    );
  }

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px" }}>

        {/* Başlık */}
        <header style={{ marginBottom: "48px" }}>
          <p
            className="mono anim-fade-up"
            style={{
              fontSize: "0.72rem",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "10px",
            }}
          >
            /photos
          </p>
          <div
            className="anim-fade-up d2"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "14px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--text)",
              }}
            >
              Fotoğraflar
            </h1>
            <span
              className="mono"
              style={{
                fontSize: "0.85rem",
                color: "var(--accent)",
                background: "var(--accent-dim)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "999px",
                padding: "3px 12px",
              }}
            >
              {photos.length}
            </span>
          </div>
          <p
            className="anim-fade-up d3"
            style={{
              color: "var(--text-2)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}
          >
            Anlık kareler.
          </p>
        </header>

        <MasonryGallery photos={photos} />

        <Footer />
      </div>
    </>
  );
}
