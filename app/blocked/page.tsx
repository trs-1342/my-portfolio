import Link from "next/link";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";

const PAGE_LABELS: Record<string, string> = {
  "/contact":  "İletişim Formu",
  "/hsounds":  "Hsounds",
  "/photos":   "Fotoğraflar",
  "/profile":  "Profil",
  "/settings": "Ayarlar",
};

interface Props {
  searchParams: Promise<{ path?: string; banned?: string; pages?: string }>;
}

export default async function BlockedPage({ searchParams }: Props) {
  const { path = "/", banned = "0", pages = "" } = await searchParams;

  const fullyBanned   = banned === "1";
  const blockedPages  = pages.split(",").filter(Boolean);
  const otherBlocked  = blockedPages.filter((p) => p !== path);
  const listToShow    = fullyBanned ? blockedPages : otherBlocked;

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div
        className="page-content"
        style={{
          paddingTop: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div
          className="glass anim-fade-up"
          style={{
            borderRadius: "24px",
            padding: "48px 40px",
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            border: "1px solid rgba(239,68,68,0.2)",
            boxShadow: "0 0 40px rgba(239,68,68,0.06)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🚫</div>

          <h1
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
            }}
          >
            {fullyBanned ? "Hesabın Engellendi" : "Bu Sayfaya Erişim Kısıtlandı"}
          </h1>

          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--text-2)",
              lineHeight: 1.7,
              marginBottom: "24px",
            }}
          >
            {fullyBanned
              ? "Hesabın yönetici tarafından tamamen engellendi. Tüm özel sayfalara erişimin kısıtlandı."
              : `${PAGE_LABELS[path] ?? path} sayfasına erişimin yönetici tarafından kısıtlandı.`}
          </p>

          {listToShow.length > 0 && (
            <div
              style={{
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "24px",
                textAlign: "left",
              }}
            >
              <p
                className="mono"
                style={{
                  fontSize: "0.68rem",
                  color: "#ef4444",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "8px",
                }}
              >
                {fullyBanned ? "Kısıtlanan erişimler" : "Diğer kısıtlanan sayfalar"}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {listToShow.map((p) => (
                  <span
                    key={p}
                    style={{
                      padding: "3px 10px",
                      borderRadius: "999px",
                      background: "rgba(239,68,68,0.08)",
                      color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.2)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {PAGE_LABELS[p] ?? p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link href="/" className="btn btn-ghost" style={{ display: "inline-flex" }}>
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </>
  );
}
