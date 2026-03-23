import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

/* Font — public/fonts/Inter.ttf */
let fontData: ArrayBuffer | null = null;
async function getFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;
  const buf = await readFile(path.join(process.cwd(), "public/fonts/Inter.ttf"));
  fontData = buf.buffer as ArrayBuffer;
  return fontData;
}

/* Tür etiketleri */
const TYPE_META: Record<string, { label: string; icon: string }> = {
  article:    { label: "/hsounds/makale",  icon: "📝" },
  rss:        { label: "/hsounds/rss",     icon: "📡" },
  project:    { label: "/my-projects",     icon: "⌨️" },
  photos:     { label: "/photos",          icon: "📸" },
  about:      { label: "/about",           icon: "👤" },
  contact:    { label: "/contact",         icon: "✉️" },
  hsounds:    { label: "/hsounds",         icon: "🎵" },
  page:       { label: "/trs",             icon: "◈"  },
};

/* GET /api/og?title=...&desc=...&type=...&meta=... */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title    = searchParams.get("title")    ?? "trs";
  const desc     = searchParams.get("desc")     ?? "Software Developer · C, Linux, Web";
  const type     = searchParams.get("type")     ?? "page";
  const meta     = searchParams.get("meta")     ?? ""; // örn: "8 dk okuma  ·  12 Mart 2026"

  const { label, icon } = TYPE_META[type] ?? TYPE_META.page;

  const font = await getFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          background: "#09090f",
          position: "relative",
          fontFamily: "Inter",
          overflow: "hidden",
        }}
      >
        {/* Arka plan desen — soldan sağa gradient çizgiler */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "radial-gradient(ellipse 80% 60% at 50% 120%, rgba(16,185,129,0.12) 0%, transparent 70%)",
        }} />

        {/* Sol accent çubuk */}
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: 4,
          background: "linear-gradient(180deg, transparent 0%, #10B981 30%, #10B981 70%, transparent 100%)",
          display: "flex",
        }} />

        {/* Sağ üst dekoratif waveform */}
        <div style={{
          position: "absolute",
          right: 80,
          top: 60,
          display: "flex",
          alignItems: "center",
          gap: 5,
          opacity: 0.15,
        }}>
          {[18, 40, 28, 56, 20, 48, 14, 36, 24, 52, 16, 44].map((h, i) => (
            <div key={i} style={{
              width: 8,
              height: h,
              borderRadius: 4,
              background: "#10B981",
              display: "flex",
            }} />
          ))}
        </div>

        {/* İçerik */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "60px 80px",
          justifyContent: "space-between",
        }}>

          {/* Üst: logo + tür etiketi */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{
                fontFamily: "Inter",
                fontSize: 28,
                fontWeight: 700,
                color: "#10B981",
                letterSpacing: "-0.02em",
                display: "flex",
              }}>
                trs
              </div>
              <div style={{
                width: 1,
                height: 20,
                background: "#1e293b",
                display: "flex",
              }} />
              <div style={{
                fontFamily: "Inter",
                fontSize: 13,
                color: "#475569",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "flex",
              }}>
                {label}
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}>
              <span style={{ fontSize: 18, display: "flex" }}>{icon}</span>
              <span style={{
                fontFamily: "Inter",
                fontSize: 13,
                color: "#10B981",
                fontWeight: 600,
                display: "flex",
              }}>
                {type === "page" ? "trs.dev" : type}
              </span>
            </div>
          </div>

          {/* Orta: başlık + açıklama */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              fontFamily: "Inter",
              fontSize: title.length > 50 ? 48 : title.length > 30 ? 58 : 68,
              fontWeight: 700,
              color: "#f8fafc",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              display: "flex",
              maxWidth: 960,
            }}>
              {title}
            </div>

            {desc && (
              <div style={{
                fontFamily: "Inter",
                fontSize: 22,
                color: "#64748b",
                lineHeight: 1.5,
                maxWidth: 800,
                display: "flex",
              }}>
                {desc.length > 120 ? desc.slice(0, 117) + "..." : desc}
              </div>
            )}
          </div>

          {/* Alt: meta bilgi + domain */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            {meta ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "flex",
                }} />
                <div style={{
                  fontFamily: "Inter",
                  fontSize: 16,
                  color: "#64748b",
                  display: "flex",
                }}>
                  {meta}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex" }} />
            )}

            <div style={{
              fontFamily: "Inter",
              fontSize: 15,
              color: "#1e293b",
              letterSpacing: "0.04em",
              display: "flex",
            }}>
              hattab.vercel.app
            </div>
          </div>

        </div>

        {/* Alt çizgi */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg, #10B981 0%, rgba(16,185,129,0.2) 40%, transparent 100%)",
          display: "flex",
        }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: font,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: font,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
