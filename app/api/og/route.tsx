import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/* Node.js runtime — edge'den farklı olarak fs destekler, boyut limiti yok */
export const runtime = "nodejs";

const cwd = process.cwd();

async function loadAsset(rel: string): Promise<Buffer> {
  return readFile(path.join(cwd, rel));
}

const TYPE_META: Record<string, { label: string }> = {
  article:  { label: "Makale"   },
  rss:      { label: "RSS"      },
  project:  { label: "Proje"    },
  photos:   { label: "Fotoğraf" },
  about:    { label: "Hakkımda" },
  contact:  { label: "İletişim" },
  hsounds:  { label: "HSounds"  },
  page:     { label: "trs.dev"  },
};

/** GET /api/og?title=…&desc=…&type=…&meta=… */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title") ?? "trs";
  const desc  = searchParams.get("desc")  ?? "Software Developer · C, Linux, Web";
  const type  = searchParams.get("type")  ?? "page";
  const meta  = searchParams.get("meta")  ?? "";

  const { label } = TYPE_META[type] ?? TYPE_META.page;

  const [regular, bold, photoBuffer] = await Promise.all([
    loadAsset("public/fonts/Inter.ttf"),
    loadAsset("public/fonts/Inter-Bold.ttf"),
    loadAsset("public/myphotos/halil.jpg"),
  ]);

  const photo = `data:image/jpeg;base64,${photoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "#09090b",
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Sağ üst kırmızı glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Sol alt kırmızı glow */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(220,38,38,0.10) 0%, transparent 70%)",
            display: "flex",
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
              "linear-gradient(180deg, transparent 0%, #dc2626 20%, #dc2626 80%, transparent 100%)",
          }}
        />

        {/* Sol içerik */}
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 0,
            bottom: 0,
            width: 680,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Üst etiket */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "4px 12px",
                borderRadius: 4,
                border: "1px solid rgba(220,38,38,0.4)",
                background: "rgba(220,38,38,0.08)",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#dc2626",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                {label}
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                color: "#3f3f46",
                letterSpacing: "0.06em",
                display: "flex",
              }}
            >
              hattab.vercel.app
            </span>
          </div>

          {/* trs — büyük */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              display: "flex",
            }}
          >
            trs
          </div>

          {/* Başlık (sayfa başlığı farklıysa) */}
          {title !== "trs" && (
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#f4f4f5",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginTop: 16,
                maxWidth: 620,
                display: "flex",
              }}
            >
              {title}
            </div>
          )}

          {/* Açıklama */}
          <div
            style={{
              fontSize: 20,
              color: "#71717a",
              lineHeight: 1.5,
              marginTop: title !== "trs" ? 10 : 16,
              maxWidth: 580,
              display: "flex",
            }}
          >
            {desc.length > 100 ? desc.slice(0, 97) + "…" : desc}
          </div>

          {/* Meta (opsiyonel) */}
          {meta && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#dc2626",
                  display: "flex",
                }}
              />
              <span style={{ fontSize: 14, color: "#52525b", display: "flex" }}>
                {meta}
              </span>
            </div>
          )}

          {/* Alıntı */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 40,
            }}
          >
            <div
              style={{
                width: 28,
                height: 2,
                background: "#dc2626",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: 15,
                color: "#52525b",
                fontStyle: "italic",
                letterSpacing: "0.01em",
                display: "flex",
              }}
            >
              &quot;I defend the moral concept in software.&quot;
            </span>
          </div>
        </div>

        {/* Sağ — fotoğraf (1:1, yumuşak köşe) */}
        <div
          style={{
            position: "absolute",
            right: 160,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 264,
              height: 264,
              borderRadius: 28,
              padding: 3,
              background: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt=""
              width={258}
              height={258}
              style={{
                borderRadius: 24,
                objectFit: "cover",
                display: "flex",
              }}
            />
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
              "linear-gradient(90deg, #dc2626 0%, rgba(220,38,38,0.3) 50%, transparent 100%)",
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
