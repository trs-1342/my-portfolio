// app/thanks/page.js
import Nav from "@/components/Nav";
import ThanksCard from "@/components/ThanksCard";
import ThemeToggle from "@/components/ThemeToggle";
import { thanksGroups } from "@/lib/thanks";

export const metadata = { title: "Teşekkür ederim =)" };

export default function ThanksPage() {
  const byKey = Object.fromEntries(thanksGroups.map((g) => [g.key, g]));

  return (
    <main className="page thanks-page">
      <ThemeToggle />

      <Nav />

      <section className="thanks-stack">
        <h1 className="page-title">Teşekkürler</h1>
        <p className="thanks-intro">
          Bu sayfada Hayatımdaki önemli insanlara teşekkür etmek istiyorum.
        </p>
        {/* Ailem */}
        <ThanksCard
          icon={byKey.family?.icon}
          title={byKey.family?.title || "Ailem"}
          people={byKey.family?.people || []}
        />

        {/* Arkadaşlar */}
        <ThanksCard
          icon={byKey.friends?.icon}
          title="Değerli Arkadaşlarıma"
          people={byKey.friends?.people || []}
          footnote="ve diğer adını yazmadıklarım"
        />

        {/* Virtual Frends */}
        <ThanksCard
          icon={byKey.vfrends?.icon}
          title="Değerli Sanal Arkadaşlarıma"
          people={byKey.vfrends?.people || []}
          footnote="ve diğer adını yazmadıklarım"
        />

        {/* Ortaokul */}
        <ThanksCard
          icon={byKey.ortaokul?.icon}
          title={byKey.ortaokul?.title || "Ortaokul Hocalarım"}
          people={byKey.ortaokul?.people || []}
          footnote={
            (byKey.ortaokul?.people?.length ?? 0) > 0
              ? "ve diğer adını yazmadıklarım"
              : undefined
          }
        />

        {/* Lise */}
        <ThanksCard
          icon={byKey.lise?.icon}
          title={byKey.lise?.title || "Lise Hocaları"}
          people={byKey.lise?.people || []}
          footnote={
            (byKey.lise?.people?.length ?? 0) > 0
              ? "ve diğer adını yazmadıklarım"
              : undefined
          }
        />

        {/* Üniversite */}
        <ThanksCard
          icon={byKey.university?.icon}
          title={byKey.university?.title || "Üniversiteden"}
          people={byKey.university?.people || []}
          footnote={
            (byKey.university?.people?.length ?? 0) > 0
              ? "ve diğer adını yazmadıklarım"
              : undefined
          }
        />

        {/* Üniversite Arkadaşlarım */}
        <ThanksCard
          icon={byKey.universityFriends?.icon}
          title={byKey.universityFriends?.title || "Üniversite Arkadaşlarım"}
          people={byKey.universityFriends?.people || []}
          footnote={
            (byKey.universityFriends?.people?.length ?? 0) > 0
              ? "ve diğer adını yazmadıklarım"
              : undefined
          }
        />

        {/* Katkıda bulunanlar */}
        <ThanksCard
          icon={byKey.community?.icon}
          title={byKey.community?.title || "Katkıda Bulunanlar"}
          people={byKey.community?.people || []}
        />

        <p className="thanks-note">
          ve tekrar{" "}
          <a
            href="https://www.linkedin.com/in/bushra-dukhan-671869107/"
            target="_blank"
          >
            Anneme
          </a>{" "}
          teşekkür ederim.
        </p>
      </section>
    </main>
  );
}
