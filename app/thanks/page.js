// app/thanks/page.js
import Nav from "@/components/Nav";
import ThanksCard, { PersonChip } from "@/components/ThanksCard";
import { thanksGroups } from "@/lib/thanks";

export const metadata = { title: "Teşekkürler — Halil Hattab" };

export default function ThanksPage() {
  // Hızlı erişim için key -> group map
  const byKey = Object.fromEntries(thanksGroups.map((g) => [g.key, g]));

  return (
    <main className="page thanks-page">
      <Nav />

      <section className="thanks-stack">
        <h1 className="page-title">Teşekkürler</h1>
        <PersonChip
          person={{
            name: "Annem",
            url: "https://instagram.com/jolanar444",
          }}
        />

        {/* Arkadaşlar */}
        <ThanksCard
          icon={byKey.friends?.icon}
          title="Değerli Arkadaşlarıma"
          people={byKey.friends?.people || []}
          footnote="ve diğer adını yazmadıklarım"
        />

        {/* Lise hocaları */}
        <ThanksCard
          icon={byKey.mentors?.icon}
          title={byKey.mentors?.title || "Lise Hocalarıma"}
          people={byKey.mentors?.people || []}
          footnote="ve diğer adını yazmadıklarım"
        />

        {/* Üniversite */}
        <ThanksCard
          icon={byKey.university?.icon}
          title={byKey.university?.title || "Üniversite Hocalarıma"}
          people={byKey.university?.people || []}
        />

        {/* Katkıda bulunanlar */}
        {/* <ThanksCard
          icon={byKey.community?.icon}
          title={byKey.community?.title || "Katkıda Bulunanlar"}
          people={byKey.community?.people || []}
        /> */}
        <p className="thanks-note">ve tekrar anneme teşekkür ederim.</p>
      </section>
    </main>
  );
}
