import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThanksContent from "@/components/thanks/ThanksContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";
const _ogUrl   = `${BASE_URL}/api/og?` + new URLSearchParams({ title: "Teşekkürler", desc: "Bu yolda yanımda olan herkese.", type: "page" }).toString();

export const metadata = {
  title: "Teşekkürler — trs",
  description: "Bu yolda yanımda olan herkese.",
  openGraph: { title: "Teşekkürler — trs", description: "Bu yolda yanımda olan herkese.", url: `${BASE_URL}/thanks`, images: [{ url: _ogUrl, width: 1200, height: 630 }] },
  twitter:    { card: "summary_large_image" as const, title: "Teşekkürler — trs", images: [_ogUrl] },
};

export default function ThanksPage() {
  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px" }}>
        <header style={{ marginBottom: "64px" }}>
          <p className="mono anim-fade-up" style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>
            /thanks
          </p>
          <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "14px" }}>
            Teşekkürler
          </h1>
          <p className="anim-fade-up d3" style={{ color: "var(--text-2)", fontSize: "0.96rem", lineHeight: 1.7, maxWidth: "520px" }}>
            Bir şeyler inşa etmek asla tek başına yapılan bir iş değildir.
            Bu sayfa, bu yolda yanımda olan — bilseler de bilmeseler de — herkese.
          </p>
        </header>

        <ThanksContent />

        <Footer />
      </div>
    </>
  );
}
