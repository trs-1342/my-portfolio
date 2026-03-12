import { readdirSync } from "fs";
import { join } from "path";
import PhotoSlider from "./PhotoSlider";

/* public/myphotos klasöründeki tüm görselleri otomatik oku */
function getPhotos(): string[] {
  try {
    const dir = join(process.cwd(), "public", "myphotos");
    return readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
      .map((f) => `/myphotos/${f}`);
  } catch {
    return [];
  }
}

export default function Hero() {
  const photos = getPhotos();
  return (
    <section
      id="hero"
      style={{
        paddingTop: "100px",
        paddingBottom: "80px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "48px",
        alignItems: "center",
        minHeight: "100svh",
      }}
    >
      {/* Sol — Metinler */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Küçük etiket */}
        <div
          className="anim-fade-up d1 mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 12px",
            borderRadius: "999px",
            background: "var(--accent-dim)",
            color: "var(--accent)",
            fontSize: "0.78rem",
            fontWeight: 600,
            width: "fit-content",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
            }}
          />
          available for work
        </div>

        {/* İsim */}
        <h1
          className="anim-fade-up d2 mono"
          style={{
            fontSize: "clamp(3.5rem, 8vw, 5.5rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "var(--text)",
          }}
        >
          trs
        </h1>

        {/* Ünvan */}
        <h2
          className="anim-fade-up d3"
          style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
            fontWeight: 500,
            color: "var(--text-2)",
            lineHeight: 1.3,
          }}
        >
          Mid-level{" "}
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>
            Software Developer
          </span>
        </h2>

        {/* Bio */}
        <p
          className="anim-fade-up d4"
          style={{
            color: "var(--text-2)",
            lineHeight: 1.7,
            fontSize: "0.97rem",
            maxWidth: "460px",
          }}
        >
          Arch Linux ortamında C ve modern web teknolojileri geliştiriyorum.
          Sistem programlama, web ve yazılım mimarisine olan ilgimi
          ahlaki değerleri koruyarak üretmeye dönüştürmeyi hedefliyorum.
        </p>

        {/* CTA butonlar */}
        <div className="anim-fade-up d5" style={{ display: "flex", gap: "12px" }}>
          <a href="#projects" className="btn btn-accent">
            Projeleri Gör
          </a>
          <a href="#contact" className="btn btn-ghost">
            İletişim
          </a>
        </div>

        {/* Teknoloji etiketleri */}
        <div
          className="anim-fade-up d6 mono"
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginTop: "4px",
          }}
        >
          {["C", "Linux", "Next.js", "TypeScript", "Arch"].map((t) => (
            <span
              key={t}
              style={{
                padding: "3px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                fontSize: "0.75rem",
                color: "var(--text-3)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Sağ — Fotoğraf kartı */}
      <div className="anim-fade-up d4">
        <div
          className="glass"
          style={{
            aspectRatio: "1 / 1",
            position: "relative",
            overflow: "hidden",
            borderRadius: "24px",
            maxWidth: "480px",
            marginLeft: "auto",
          }}
        >
          {/* Köşe süslemesi */}
          <div
            className="mono"
            style={{
              position: "absolute",
              top: 16,
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
            @trs-1342
          </div>

          <PhotoSlider photos={photos} />
        </div>
      </div>

      {/* Mobil stili */}
      <style>{`
        @media (max-width: 768px) {
          #hero {
            grid-template-columns: 1fr !important;
            padding-top: 80px !important;
            min-height: auto !important;
          }
          #hero > div:last-child {
            max-width: 100% !important;
          }
          #hero > div:last-child > div {
            margin-left: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
