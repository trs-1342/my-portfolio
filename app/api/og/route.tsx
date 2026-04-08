import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/** Font dosyaları route dizininde — Vercel edge bundler build sırasında bundle eder */
const regularFontP = fetch(new URL("./Inter.ttf", import.meta.url)).then((r) =>
  r.arrayBuffer()
);
const boldFontP = fetch(new URL("./Inter-Bold.ttf", import.meta.url)).then(
  (r) => r.arrayBuffer()
);

const TYPE_META: Record<string, { label: string; icon: string }> = {
  article:  { label: "Makale",    icon: "✍" },
  rss:      { label: "RSS",       icon: "◉" },
  project:  { label: "Proje",     icon: "⌨" },
  photos:   { label: "Fotoğraf",  icon: "◻" },
  about:    { label: "Hakkımda",  icon: "◈" },
  contact:  { label: "İletişim",  icon: "✉" },
  hsounds:  { label: "HSounds",   icon: "♫" },
  page:     { label: "trs.dev",   icon: "◈" },
};

/** GET /api/og?title=…&desc=…&type=…&meta=… */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title") ?? "trs";
  const desc  = searchParams.get("desc")  ?? "Software Developer · C, Linux, Web";
  const type  = searchParams.get("type")  ?? "page";
  const meta  = searchParams.get("meta")  ?? "";

  const { label, icon } = TYPE_META[type] ?? TYPE_META.page;

  const [regular, bold] = await Promise.all([regularFontP, boldFontP]);

  const fontSize = title.length > 50 ? 44 : title.length > 30 ? 54 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "#09090f",
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse 70% 50% at 50% 110%, rgba(16,185,129,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Sol kenar çizgisi */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            display: "flex",
            background:
              "linear-gradient(180deg, transparent 0%, #10B981 25%, #10B981 75%, transparent 100%)",
          }}
        />

        {/* İçerik */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "56px 80px",
            justifyContent: "space-between",
          }}
        >
          {/* Üst satır */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#10B981",
                  letterSpacing: "-0.02em",
                  display: "flex",
                }}
              >
                trs
              </span>
              <span
                style={{
                  width: 1,
                  height: 18,
                  background: "#1e293b",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  color: "#475569",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                hattab.vercel.app
              </span>
            </div>

            {/* Tür etiketi */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 16px",
                borderRadius: 999,
                border: "1px solid rgba(16,185,129,0.3)",
                background: "rgba(16,185,129,0.08)",
              }}
            >
              <span style={{ fontSize: 16, display: "flex" }}>{icon}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#10B981",
                  display: "flex",
                }}
              >
                {label}
              </span>
            </div>
          </div>

          {/* Orta: başlık + açıklama */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div
              style={{
                fontSize,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                maxWidth: 980,
                display: "flex",
              }}
            >
              {title}
            </div>

            {desc && (
              <div
                style={{
                  fontSize: 21,
                  color: "#64748b",
                  lineHeight: 1.5,
                  maxWidth: 780,
                  display: "flex",
                }}
              >
                {desc.length > 120 ? desc.slice(0, 117) + "…" : desc}
              </div>
            )}
          </div>

          {/* Alt satır */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {meta ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#10B981",
                    display: "flex",
                  }}
                />
                <span
                  style={{
                    fontSize: 15,
                    color: "#64748b",
                    display: "flex",
                  }}
                >
                  {meta}
                </span>
              </div>
            ) : (
              <div style={{ display: "flex" }} />
            )}

            <span
              style={{
                fontSize: 13,
                color: "#1e293b",
                letterSpacing: "0.04em",
                display: "flex",
              }}
            >
              © trs {new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* Alt çizgi */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            display: "flex",
            background:
              "linear-gradient(90deg, #10B981 0%, rgba(16,185,129,0.3) 50%, transparent 100%)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: bold,    weight: 700, style: "normal" },
      ],
    }
  );
}
