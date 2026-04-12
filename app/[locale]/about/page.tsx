import { getTranslations } from "next-intl/server";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSection from "@/components/about/ProfileSection";
import ConstellationTimeline from "@/components/about/ConstellationTimeline";
import CVSection from "@/components/about/CVSection";
import { getAboutConfigServer, getLifeEventsServer } from "@/lib/site-server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  const ogUrl = `${BASE_URL}/api/og?` + new URLSearchParams({ title: t("title"), desc: t("description"), type: "about" }).toString();

  return {
    title: `${t("title")} — trs`,
    description: t("description"),
    openGraph: { title: `${t("title")} — trs`, description: t("description"), url: `${BASE_URL}/${locale}/about`, images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" as const, title: `${t("title")} — trs`, images: [ogUrl] },
  };
}

export default async function AboutPage() {
  const [config, lifeEvents] = await Promise.all([
    getAboutConfigServer(),
    getLifeEventsServer(),
  ]);

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content">
        <ProfileSection config={config} />
        <CVSection cvFiles={config.cvFiles} />
        <ConstellationTimeline events={lifeEvents} />
        <Footer />
      </div>
    </>
  );
}
