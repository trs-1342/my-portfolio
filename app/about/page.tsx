import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSection from "@/components/about/ProfileSection";
import ConstellationTimeline from "@/components/about/ConstellationTimeline";
import CVSection from "@/components/about/CVSection";
import { getAboutConfigServer, getLifeEventsServer } from "@/lib/site-server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";
const _ogUrl   = `${BASE_URL}/api/og?` + new URLSearchParams({ title: "Hakkımda", desc: "Halil Hattab — Mid-level Software Developer", type: "about" }).toString();

export const metadata = {
  title: "Hakkımda — trs",
  description: "Halil Hattab — Mid-level Software Developer",
  openGraph: { title: "Hakkımda — trs", description: "Halil Hattab — Mid-level Software Developer", url: `${BASE_URL}/about`, images: [{ url: _ogUrl, width: 1200, height: 630 }] },
  twitter:    { card: "summary_large_image" as const, title: "Hakkımda — trs", images: [_ogUrl] },
};

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
        {/* Profil: 50/50 split */}
        <ProfileSection config={config} />

        {/* CV */}
        <CVSection cvFiles={config.cvFiles} />

        {/* Yıldız Haritası Zaman Çizelgesi */}
        <ConstellationTimeline events={lifeEvents} />

        <Footer />
      </div>
    </>
  );
}
