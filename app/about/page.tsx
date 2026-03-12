import { readdirSync } from "fs";
import { join } from "path";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSection from "@/components/about/ProfileSection";
import ConstellationTimeline from "@/components/about/ConstellationTimeline";
import CVSection from "@/components/about/CVSection";

export const metadata = {
  title: "Hakkımda — trs",
  description: "Halil Hattab — Mid-level Software Developer",
};

function getCVFile(): string | null {
  try {
    const dir = join(process.cwd(), "public", "doc");
    const files = readdirSync(dir).filter((f) => /\.pdf$/i.test(f));
    return files.length > 0 ? `/doc/${files[0]}` : null;
  } catch {
    return null;
  }
}

export default function AboutPage() {
  const cvFile = getCVFile();

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content">
        {/* Profil: 50/50 split */}
        <ProfileSection />

        {/* CV */}
        <CVSection file={cvFile} />

        {/* Yıldız Haritası Zaman Çizelgesi */}
        <ConstellationTimeline />

        <Footer />
      </div>
    </>
  );
}
