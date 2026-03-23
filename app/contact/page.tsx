import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/contact/ContactForm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";
const _ogUrl   = `${BASE_URL}/api/og?` + new URLSearchParams({ title: "İletişim", desc: "Hata bildirimi, geri bildirim veya işbirliği için iletişim.", type: "contact" }).toString();

export const metadata = {
  title: "İletişim — trs",
  description: "Hata bildirimi, geri bildirim veya işbirliği için iletişim.",
  openGraph: { title: "İletişim — trs", description: "Hata bildirimi, geri bildirim veya işbirliği.", url: `${BASE_URL}/contact`, images: [{ url: _ogUrl, width: 1200, height: 630 }] },
  twitter:    { card: "summary_large_image" as const, title: "İletişim — trs", images: [_ogUrl] },
};

export default function ContactPage() {
  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px" }}>
        {/* Başlık */}
        <header style={{ marginBottom: "48px" }}>
          <p
            className="mono anim-fade-up d1"
            style={{
              fontSize: "0.72rem",
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "10px",
            }}
          >
            /contact
          </p>
          <h1
            className="anim-fade-up d2"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text)",
              marginBottom: "12px",
            }}
          >
            İletişim
          </h1>
          <p
            className="anim-fade-up d3"
            style={{
              color: "var(--text-2)",
              fontSize: "0.96rem",
              lineHeight: 1.7,
              maxWidth: "500px",
            }}
          >
            Hata bildirimi, geri bildirim, işbirliği teklifi ya da sadece selam vermek için —
            mesajın doğrudan ulaşır.
          </p>
        </header>

        {/* Form + Hızlı erişim */}
        <ContactForm />

        <Footer />
      </div>
    </>
  );
}
