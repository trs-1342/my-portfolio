import { getTranslations } from "next-intl/server";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/contact/ContactForm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  const ogUrl = `${BASE_URL}/api/og?` + new URLSearchParams({ title: t("title"), desc: t("description"), type: "contact" }).toString();

  return {
    title: `${t("title")} — trs`,
    description: t("description"),
    openGraph: { title: `${t("title")} — trs`, description: t("description"), url: `${BASE_URL}/${locale}/contact`, images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" as const, title: `${t("title")} — trs`, images: [ogUrl] },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px" }}>
        <header style={{ marginBottom: "48px" }}>
          <p className="mono anim-fade-up d1" style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>
            /contact
          </p>
          <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "12px" }}>
            {t("title")}
          </h1>
          <p className="anim-fade-up d3" style={{ color: "var(--text-2)", fontSize: "0.96rem", lineHeight: 1.7, maxWidth: "500px" }}>
            {t("description")}
          </p>
        </header>

        <ContactForm />

        <Footer />
      </div>
    </>
  );
}
