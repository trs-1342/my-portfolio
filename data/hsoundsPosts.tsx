// data/hsoundsPosts.ts
export type HSoundsPost = {
    slug: string;
    title: string;
    summary: string;
    date: string;        // ISO tarih: "2025-11-17"
};

export const hsoundsPosts: HSoundsPost[] = [
    {
        slug: "rss-reader-v1",
        title: "RSS Reader App - İlk Sürüm",
        summary: "React Native ile geliştirdiğim RSS okuyucu uygulamasının ilk sürümünü yayınladım.",
        date: "2025-11-17",
    },
    {
        slug: "hsounds-ne-olacak",
        title: "HSounds Sayfasının Yol Haritası",
        summary: "Bu sayfada neler paylaşacağımı, proje ve fikirlerin nasıl akacağını anlattım.",
        date: "2025-11-18",
    },
    // Yeni post eklemek = buraya yeni obje eklemek
];
