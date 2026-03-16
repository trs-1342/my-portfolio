import { getSkillsServer } from "@/lib/site-server";

export default async function Skills() {
  const skills = await getSkillsServer();
  const sorted = [...skills].sort((a, b) => a.order - b.order);

  return (
    <section className="py-8 px-4">
      <h2 className="mono anim-fade-up text-[0.78rem] text-gray-500 uppercase tracking-[0.15em] mb-8 border-b border-gray-800 pb-2">
        Yetenekler
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sorted.map((s, i) => (
          <div
            key={s.id}
            className={`mb-4 glass glass-hover p-6 flex flex-col items-center gap-3 text-center transition-all cursor-default anim-fade-up d${Math.min(i + 1, 8)}`}
          >
            <span className="text-3xl leading-none mb-1">{s.icon}</span>
            <div className="flex flex-col gap-1">
              <span className="skill-name font-bold text-sm text-gray-200 leading-tight">
                {s.name}
              </span>
              <span className="text-[9px] text-blue-500/90 font-mono uppercase tracking-widest">
                {s.category}
              </span>
            </div>
            <span className="text-[11px] text-gray-500 font-mono leading-relaxed mt-1">
              {s.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
