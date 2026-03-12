/* Hakkımda sayfası üst bölüm — 50/50 split */
import { readdirSync } from "fs";
import { join } from "path";
import Image from "next/image";

function getFirstPhoto(): string | null {
  try {
    const dir = join(process.cwd(), "public", "myphotos");
    const file = readdirSync(dir).find((f) =>
      /\.(jpe?g|png|webp|avif|gif)$/i.test(f)
    );
    return file ? `/myphotos/${file}` : null;
  } catch {
    return null;
  }
}

export default function ProfileSection() {
  const photo = getFirstPhoto();
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "48px",
        alignItems: "center",
        minHeight: "100svh",
        paddingTop: "100px",
        paddingBottom: "60px",
      }}
    >
      {/* Sol — İçerik */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* İsim */}
        <div className="anim-fade-up d1">
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--text)",
              marginBottom: "6px",
            }}
          >
            Halil Hattab
          </h1>

          {/* Takma ad */}
          <div
            className="mono"
            style={{
              fontSize: "1.1rem",
              color: "var(--accent)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            @trs
          </div>
        </div>

        {/* Ünvan etiketi */}
        <div className="anim-fade-up d2">
          <span
            className="glass"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "999px",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "var(--accent)",
              boxShadow: "0 0 16px var(--accent-glow)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                boxShadow: "0 0 8px var(--accent)",
              }}
            />
            Mid-level Software Developer
          </span>
        </div>

        {/* Bio */}
        <div
          className="anim-fade-up d3"
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <p style={{ color: "var(--text-2)", lineHeight: 1.8, fontSize: "0.96rem" }}>
            Merhaba! Ben Halil — yazılım dünyasına lise yıllarında adım attım ve o günden
            bu yana kod yazmak hem hobim hem de tutkum oldu. Arch Linux üzerinde C ile
            sistem programlama, modern web teknolojileriyle full-stack geliştirme yapıyorum.
          </p>
          <p style={{ color: "var(--text-2)", lineHeight: 1.8, fontSize: "0.96rem" }}>
            İstanbul Gelişim Üniversitesi Yazılım Mühendisliği 1. sınıf öğrencisiyim.
            Akademik hayatımı freelance projeler ve açık kaynak katkılarıyla harmanlıyorum.
          </p>
          <p style={{ color: "var(--text-2)", lineHeight: 1.8, fontSize: "0.96rem" }}>
            Amacım; teknolojinin hızla değiştiği bu çağda{" "}
            <span style={{ color: "var(--text)", fontWeight: 600 }}>
              ürün çıkartmaya odaklı
            </span>{" "}
            üretmek ve insanların hayatına gerçekten dokunan projeler geliştirmek.
          </p>
        </div>

        {/* CTA butonlar */}
        <div
          className="anim-fade-up d4"
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <a href="https://github.com/trs-1342" className="btn btn-accent" target="_blank" rel="noopener noreferrer">
            ⌨️ GitHub
          </a>
          <a href="/contact" className="btn btn-ghost">
            ✉️ İletişim
          </a>
        </div>
      </div>

      {/* Sağ — Fotoğraf kartı */}
      <div className="anim-fade-up d3" style={{ display: "flex", justifyContent: "center" }}>
        <div
          className="glass"
          style={{
            width: "100%",
            maxWidth: "460px",
            aspectRatio: "3 / 4",
            position: "relative",
            overflow: "hidden",
            borderRadius: "24px",
          }}
        >
          {/* Fotoğraf veya placeholder */}
          {photo ? (
            <Image
              src={photo}
              alt="Halil Hattab"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, var(--bg-2) 0%, var(--bg) 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <span style={{ fontSize: "5rem" }}>🧑‍💻</span>
              <span className="mono" style={{ fontSize: "0.78rem", color: "var(--text-3)", textAlign: "center" }}>
                /public/myphotos/<br />klasörüne fotoğraf ekle
              </span>
            </div>
          )}

          {/* Kenar gradient maskesi — fotoğraf karıştıktan sonra aktif */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 50%, var(--bg) 90%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Köşe etiketi */}
          <div
            className="mono"
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              zIndex: 10,
              fontSize: "0.72rem",
              color: "var(--text-3)",
              background: "var(--panel)",
              backdropFilter: "blur(12px)",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid var(--border)",
            }}
          >
            Halil Hattab — 2026
          </div>
        </div>
      </div>

      {/* Mobil: tek sütun */}
      <style>{`
        @media (max-width: 768px) {
          section:first-of-type {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </section>
  );
}
