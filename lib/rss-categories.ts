export const RSS_CATEGORIES = [
  // Teknoloji
  { id: "ai-ml",               label: "Yapay Zeka (AI / ML)",                   group: "Teknoloji" },
  { id: "cybersecurity",       label: "Siber Güvenlik",                          group: "Teknoloji" },
  { id: "programming",         label: "Yazılım Geliştirme (Programming / Dev)",  group: "Teknoloji" },
  { id: "open-source",         label: "Açık Kaynak (Open Source)",               group: "Teknoloji" },
  { id: "cloud-devops",        label: "Bulut Bilişim (Cloud / DevOps)",           group: "Teknoloji" },
  { id: "data-science",        label: "Veri Bilimi & Big Data",                  group: "Teknoloji" },
  { id: "mobile",              label: "Mobil Teknoloji (Android / iOS)",          group: "Teknoloji" },
  { id: "hardware",            label: "Donanım (Hardware)",                      group: "Teknoloji" },
  { id: "startup",             label: "Girişimcilik & Startup",                  group: "Teknoloji" },
  { id: "fintech",             label: "FinTech",                                 group: "Teknoloji" },
  { id: "gaming",              label: "Oyun Teknolojileri",                      group: "Teknoloji" },
  { id: "robotics-iot",        label: "Robotik & IoT",                           group: "Teknoloji" },
  { id: "space",               label: "Uzay & Havacılık",                        group: "Teknoloji" },
  { id: "ar-vr",               label: "AR / VR (Metaverse)",                     group: "Teknoloji" },
  { id: "blockchain",          label: "Blockchain & Web3",                       group: "Teknoloji" },
  { id: "ecommerce",           label: "E-Ticaret Teknolojileri",                 group: "Teknoloji" },
  { id: "telecom",             label: "Telekomünikasyon (5G vb.)",               group: "Teknoloji" },
  { id: "tech-news",           label: "Teknoloji Haberleri (Genel)",             group: "Teknoloji" },
  { id: "product-launch",      label: "Ürün Lansmanları",                        group: "Teknoloji" },
  { id: "tools-libs",          label: "Yazılım Araçları & Kütüphaneler",         group: "Teknoloji" },
  // Havacılık
  { id: "aviation",            label: "Havacılık (Aviation)",                    group: "Havacılık" },
  { id: "defense-aviation",    label: "Askeri Havacılık (Defense Aviation)",     group: "Havacılık" },
  { id: "commercial-aviation", label: "Sivil Havacılık (Commercial Aviation)",   group: "Havacılık" },
  { id: "drone-uav",           label: "İnsansız Hava Araçları (İHA / Drone)",    group: "Havacılık" },
  { id: "space-rocket",        label: "Uzay & Roket Teknolojileri",              group: "Havacılık" },
  { id: "aerospace-eng",       label: "Uçak Mühendisliği (Aerospace Eng.)",      group: "Havacılık" },
  { id: "air-traffic",         label: "Hava Trafik & Operasyon Sistemleri",      group: "Havacılık" },
  { id: "aviation-safety",     label: "Havacılık Güvenliği (Aviation Safety)",   group: "Havacılık" },
] as const;

export type RssCategoryId = typeof RSS_CATEGORIES[number]["id"];

export const RSS_CATEGORY_MAP = Object.fromEntries(
  RSS_CATEGORIES.map((c) => [c.id, c])
) as Record<string, { id: string; label: string; group: string }>;
