import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSection from "@/components/about/ProfileSection";
import ConstellationTimeline from "@/components/about/ConstellationTimeline";
import CVSection from "@/components/about/CVSection";
import { getAboutConfigServer, getLifeEventsServer } from "@/lib/site-server";

export const metadata = {
  title: "Hakkımda — trs",
  description: "Halil Hattab — Mid-level Software Developer",
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
