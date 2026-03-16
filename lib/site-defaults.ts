/**
 * Hardcoded varsayılan değerler — hem server (SSR) hem client (admin) tarafında kullanılır.
 * Firebase import içermez.
 */

import type { HomepageConfig, SkillItem, Project, MenuItem, AboutConfig, LifeEvent, ProjectsPageConfig } from "./firestore";

export const DEFAULT_HOMEPAGE: HomepageConfig = {
  heroLevel: "mid",
  heroText: "Software Enginner",
  aboutText:
    "İstanbul Gelişim Üniversitesi'nde Yazılım Mühendisliği öğrencisiyim.\nArch Linux'u keşfediyor, C diliyle algoritma mantığını ve modern web teknolojilerini öğreniyorum.\nTeknik becerilerimi ürün çıkartmaya odaklıyım.\nTeknoloji dünyası ile yakından ilgileniyor, gelişime ve öğrenmeye açık birisiyim.",
  buttons: [
    { id: "b1", label: "Projeleri Gör", href: "/my-projects", variant: "accent", order: 0 },
    { id: "b2", label: "İletişim",      href: "/contact",     variant: "ghost",  order: 1 },
  ],
  skillBadges: [
    { id: "sb1", label: "C",          order: 0 },
    { id: "sb2", label: "Linux",      order: 1 },
    { id: "sb3", label: "Arch",       order: 2 },
    { id: "sb4", label: "Next.js",    order: 3 },
    { id: "sb5", label: "JavaScript", order: 4 },
    { id: "sb6", label: "TypeScript", order: 5 },
    { id: "sb7", label: "AI",         order: 6 },
  ],
};

export const DEFAULT_SKILLS: SkillItem[] = [
  { id: "s1",  category: "Fundamentals", icon: "⚙️", name: "C Language",      desc: "Algoritma & Sistem Mantığı",        order: 0  },
  { id: "s2",  category: "Fundamentals", icon: "🐧", name: "Linux",            desc: "Arch, Debian, Bash Scripting",       order: 1  },
  { id: "s3",  category: "Fundamentals", icon: "🔀", name: "Git & VCS",        desc: "Sürüm Kontrolü ve İş Akışı",        order: 2  },
  { id: "s4",  category: "Frontend",     icon: "⚛️", name: "Next.js / React",  desc: "SSR, App Router & Vite",             order: 3  },
  { id: "s5",  category: "Frontend",     icon: "🔷", name: "TypeScript",        desc: "Type-Safe Development",              order: 4  },
  { id: "s6",  category: "Frontend",     icon: "🎨", name: "Responsive UI",     desc: "Tailwind CSS & Modern Design",       order: 5  },
  { id: "s7",  category: "Frontend",     icon: "🌐", name: "Web Tech",          desc: "HTML5, CSS3, JS (ES2024)",           order: 6  },
  { id: "s8",  category: "Backend",      icon: "🟩", name: "Node.js / Express", desc: "REST API & Server Logic",            order: 7  },
  { id: "s9",  category: "Backend",      icon: "🔥", name: "Firebase",          desc: "Auth, Firestore & Hosting",          order: 8  },
  { id: "s10", category: "Backend",      icon: "🗄️", name: "MySQL / Postgres", desc: "Veri Modelleme & CRUD",              order: 9  },
  { id: "s11", category: "Backend",      icon: "🛡️", name: "Security",         desc: "JWT, bcrypt & AES Şifreleme",        order: 10 },
  { id: "s12", category: "Modern Tech",  icon: "🤖", name: "AI Automation",     desc: "n8n, OpenAI & Claude API, OpenClaw", order: 11 },
  { id: "s13", category: "Mobile",       icon: "📱", name: "Mobile Dev",        desc: "Souq & RSS App",                     order: 12 },
  { id: "s14", category: "DevOps",       icon: "☁️", name: "Deployment",       desc: "Ubuntu VPS, Nginx & PM2 (Temel)",    order: 13 },
  { id: "s15", category: "DevOps",       icon: "🌐", name: "Infrastructure",    desc: "SSL (Certbot) & Domain/DNS",         order: 14 },
  { id: "s16", category: "DevOps",       icon: "🐳", name: "Docker",            desc: "Containerization (Temel)",           order: 15 },
];

export const DEFAULT_MENU: MenuItem[] = [
  { id: "m1", href: "/about",       label: "Hakkımda",    icon: "👤", order: 0 },
  { id: "m2", href: "/my-projects", label: "Projeler",    icon: "⚡", order: 1 },
  { id: "m3", href: "/photos",      label: "Fotoğraflar", icon: "📷", order: 2 },
  { id: "m4", href: "/hsounds",     label: "Hsounds",     icon: "🎵", order: 3 },
  { id: "m5", href: "/thanks",      label: "Teşekkürler", icon: "💫", order: 4 },
  { id: "m6", href: "/contact",     label: "İletişim",    icon: "✉️", order: 5 },
];

export const DEFAULT_ABOUT: AboutConfig = {
  name: "Halil Hattab",
  handle: "@trs",
  aboutLevel: "mid",
  aboutText: "Software Developer",
  bioText:
    "Merhaba! Ben Halil — yazılım dünyasına lise yıllarında adım attım ve o günden bu yana kod yazmak hem hobim hem de tutkum oldu. Arch Linux üzerinde C ile sistem programlama, modern web teknolojileriyle full-stack geliştirme yapıyorum.\n\nİstanbul Gelişim Üniversitesi Yazılım Mühendisliği 1. sınıf öğrencisiyim. Akademik hayatımı freelance projeler ve açık kaynak katkılarıyla harmanlıyorum.\n\nAmacım; teknolojinin hızla değiştiği bu çağda **ürün çıkartmaya odaklı** üretmek ve insanların hayatına gerçekten dokunan projeler geliştirmek.",
  buttons: [
    { id: "ab1", label: "⌨️ GitHub",   href: "https://github.com/trs-1342", variant: "accent", order: 0 },
    { id: "ab2", label: "✉️ İletişim", href: "/contact",                    variant: "ghost",  order: 1 },
  ],
  photos: [],
  cvFiles: [],
};

export const DEFAULT_LIFE_EVENTS: LifeEvent[] = [
  {
    id: "le0", order: 0,
    date: "09.09.2021", title: "Lise Başlangıcı",
    desc: "ŞBBKMTAL Bilişim Alanı'na kayıt. Yazılım dünyasının kapıları açıldı.",
    log: "> Sistem logu yükleniyor...\n> Lise dönemi başlatıldı [OK]\n> Bilişim modülü aktif [OK]\n> Yeni süreç başlatılıyor: trs [PID: 2021]",
    isCurrent: false,
  },
  {
    id: "le1", order: 1,
    date: "2024 — 2025", title: "Staj",
    desc: "Gerçek dünya deneyimi: staj projelerinde aktif geliştirme.",
    log: "> Staj modülü yükleniyor...\n> Bağlantı kuruldu: production_env [OK]\n> Deneyim +1 eklendi [OK]\n> İş yeri açma belgesi oluşturuldu [OK]",
    isCurrent: false,
  },
  {
    id: "le2", order: 2,
    date: "25.02.2025", title: "Proje Satışı",
    desc: "Gerçek ürün satış deneyimi: projenin aylar sonrasında satılması.",
    log: "> Staj modülü yükleniyor...\n> Bağlantı kuruldu: production_sale [OK]\n> Satış deneyimi +1 eklendi [OK]\n> İphone 13 faturası oluşturuldu [OK]",
    isCurrent: false,
  },
  {
    id: "le3", order: 3,
    date: "22.09.2025", title: "Üniversite",
    desc: "İstanbul Gelişim Üniversitesi — Yazılım Mühendisliği 1. Sınıf başlangıcı.",
    log: "> IGÜ bağlantısı kuruluyor...\n> Fakülte: Mühendislik [OK]\n> Bölüm: Yazılım Mühendisliği [OK]\n> Yeni akademik dönem başlatıldı [OK]",
    isCurrent: false,
  },
  {
    id: "le4", order: 4,
    date: "Bugün", title: "Aktif Geliştirici",
    desc: "Freelance projeler, açık kaynak katkıları ve süregelen öğrenme yolculuğu.",
    log: "> Sistem durumu kontrol ediliyor...\n> Tüm modüller aktif [OK]\n> Proje sayısı: 42+ [OK]\n> Öğrenme modu: while [OK]\n> trs@arch:~$ ",
    isCurrent: true,
  },
];

export const DEFAULT_PROJECTS_PAGE: ProjectsPageConfig = {
  subtitle: "Açık kaynak çalışmalarım, kişisel projelerim ve aktif geliştirmeler.\nTerminali kullanarak projeleri keşfedebilirsin, bilgisayarımın anısına yaptım.",
};

export const DEFAULT_PROJECTS: Omit<Project, "id">[] = [
  {
    slug: "mnp", emoji: "🌐", title: "mnp",
    desc: "Kişisel portfolyo ve blog platformum.",
    longDesc: "Next.js App Router ile inşa edilmiş kişisel portfolyo sitesi. Firebase Auth, Firestore ve Vercel'de canlıda.",
    highlights: ["Firebase Auth (Email + Google)", "Firestore realtime", "Admin paneli", "Vercel deploy"],
    lang: "TypeScript | NextJS | Firebase Auth | Firestore | Vercel",
    repo: "https://github.com/trs-1342/mnp", live: "https://hllhttb.vercel.app",
    pinned: true, active: true, status: "Geliştiriliyor",
    stack: ["Next.js", "Firebase", "TypeScript", "Firebase Auth", "Vercel"], order: 0,
  },
  {
    slug: "budu", emoji: "🎨", title: "budu",
    desc: "İçerik üreticilerinin üyelik karşılığında kurs satabildikleri platform.",
    longDesc: "İçerik üreticilerinin kurs yayınlayıp üyelik sistemiyle gelir elde ettiği bir platform.",
    highlights: ["Üyelik sistemi", "Kurs yönetimi", "Ödeme entegrasyonu"],
    lang: "TypeScript | JavaScript | CSS",
    repo: "https://github.com/trs-1342/budu", live: "https://bushradukhan.com/",
    pinned: true, active: false, status: "Tamamlandı",
    stack: ["TypeScript", "JavaScript", "CSS"], order: 1,
  },
  {
    slug: "openuni", emoji: "🎓", title: "OpenUni",
    desc: "İstanbul Gelişim Üniversitesi öğrencileri için kanal tabanlı topluluk platformu.",
    longDesc: "IGÜ öğrencilerinin kanal oluşturup içerik paylaşabildiği gerçek zamanlı topluluk platformu.",
    highlights: ["Kanal tabanlı yapı", "Gerçek zamanlı mesajlaşma", "Firebase Storage", "Vercel deploy"],
    lang: "NextJS | Firebase Firestore & Authentication & Storage | Tailwind CSS | Vercel",
    repo: "https://github.com/trs-1342/openuni", live: "https://openigu.vercel.app",
    pinned: true, active: true, status: "Geliştiriliyor",
    stack: ["Next.js", "Firebase", "Tailwind CSS", "Vercel"], order: 2,
  },
  {
    slug: "souq", emoji: "📃", title: "Souq",
    desc: "Bilinen ilan uygulamalarının alternatifi.",
    longDesc: "Sahibinden ve benzeri uygulamalara alternatif, React Native ile geliştirilmiş ilan uygulaması.",
    highlights: ["React Native cross-platform", "Expo EAS Build", "APK çıktısı"],
    lang: "React Native | TypeScript | Expo & EAS & APK",
    repo: "https://github.com/trs-1342/souq", live: null,
    pinned: true, active: true, status: "Planlama",
    stack: ["React Native", "TypeScript", "Expo"], order: 3,
  },
  {
    slug: "c-dersleri", emoji: "⚙️", title: "c-dersleri",
    desc: "Üniversiteden alınan eğitim ile öğrencilerin topluluk oluşturup C dili ile geliştirdikleri repo.",
    longDesc: "IGÜ Yazılım Mühendisliği öğrencilerinin C dili öğrenme sürecini paylaştığı açık kaynak topluluk deposu.",
    highlights: ["Açık kaynak", "Topluluk katkısı", "C dili eğitimi", "Web sitesi"],
    lang: "C",
    repo: "https://github.com/IGU-Software-Community/c-dersleri", live: "https://cdws.vercel.app/",
    pinned: true, active: false, status: "Tamamlandı",
    stack: ["C"], order: 4,
  },
];
