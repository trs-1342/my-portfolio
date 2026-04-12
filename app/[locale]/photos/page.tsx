"use client";

import { useEffect, useState } from "react";
import { useAccessGuard } from "@/hooks/useAccessGuard";
import { getPhotos } from "@/lib/firestore";
import type { PhotoItem } from "@/lib/firestore";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MasonryGallery from "@/components/photos/MasonryGallery";

export default function PhotosPage() {
  const { user, loading, ready } = useAccessGuard();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!ready) return;
    getPhotos().then((data) => {
      setPhotos(data);
      setFetching(false);
    });
  }, [ready]);

  if (loading || !ready || fetching) {
    return (
      <>
        <AmbientGlow />
        <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px" }}>
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
            style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.6 }}
          >
            Anlık kareler.
          </p>
        </header>

        <MasonryGallery photos={photos} uid={user!.uid} />

        <Footer />
      </div>
    </>
  );
}
