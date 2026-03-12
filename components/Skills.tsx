import React from 'react';

interface Skill {
  category: string;
  icon: string;
  name: string;
  desc: string;
}

const skills: Skill[] = [
  // Fundamentals
  { category: "Fundamentals", icon: "⚙️", name: "C Language", desc: "Algoritma & Sistem Mantığı" },
  { category: "Fundamentals", icon: "🐧", name: "Linux", desc: "Arch, Debian, Bash Scripting" },
  { category: "Fundamentals", icon: "🔀", name: "Git & VCS", desc: "Sürüm Kontrolü ve İş Akışı" },

  // Frontend
  { category: "Frontend", icon: "⚛️", name: "Next.js / React", desc: "SSR, App Router & Vite" },
  { category: "Frontend", icon: "🔷", name: "TypeScript", desc: "Type-Safe Development" },
  { category: "Frontend", icon: "🎨", name: "Responsive UI", desc: "Tailwind CSS & Modern Design" },
  { category: "Frontend", icon: "🌐", name: "Web Tech", desc: "HTML5, CSS3, JS (ES2024)" },

  // Backend & DB
  { category: "Backend", icon: "🟩", name: "Node.js / Express", desc: "REST API & Server Logic" },
  { category: "Backend", icon: "🔥", name: "Firebase", desc: "Auth, Firestore & Hosting" },
  { category: "Backend", icon: "🗄️", name: "MySQL / Postgres", desc: "Veri Modelleme & CRUD" },
  { category: "Backend", icon: "🛡️", name: "Security", desc: "JWT, bcrypt & AES Şifreleme" },

  // AI & Automation
  { category: "Modern Tech", icon: "🤖", name: "AI Automation", desc: "n8n, OpenAI & Claude API, OpenClaw" },

  // Mobile
  { category: "Mobile", icon: "📱", name: "Mobile Dev", desc: "Souq & RSS App" },

  // DevOps & Deployment
  { category: "DevOps", icon: "☁️", name: "Deployment", desc: "Ubuntu VPS, Nginx & PM2 (Temel)" },
  { category: "DevOps", icon: "🌐", name: "Infrastructure", desc: "SSL (Certbot) & Domain/DNS" },
  { category: "DevOps", icon: "🐳", name: "Docker", desc: "Containerization (Temel)" }
];

export default function Skills() {
  return (
    <section className="py-8 px-4">
      <h2 className="mono anim-fade-up text-[0.78rem] text-gray-500 uppercase tracking-[0.15em] mb-8 border-b border-gray-800 pb-2">
        Yetenekler
      </h2>

      {/* grid-cols-2 ile her satırda 2 kart sağlandı, gap-4 ile aralarındaki mesafe artırıldı */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {skills.map((s, i) => (
          <div
            key={s.name}
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
