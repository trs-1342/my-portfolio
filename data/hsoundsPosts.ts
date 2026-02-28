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
        summary: "React Native + AI ile geliştirdiğim RSS okuyucu uygulamasının ilk sürümünü yayınladım.",
        // connection: "",
        date: "2025-11-17",
    },
    {
        slug: "rss-reader-v2",
        title: "RSS Reader App - Yenile Butonu",
        summary: "RSS Reader uygulamasına yenile butonu ekledim, böylece kullanıcılar manuel olarak beslemeleri güncelleyebilir.",
        // connection: "",
        date: "2025-11-17",
    },
    {
        slug: "rss-reader-v3",
        title: "RSS Reader App - Yakında",
        summary: "RSS Reader uygulaması için yeni güncellemeler yakında olacak. Beklemede kalın...",
        // connection: "",
        date: "2026-02-27",
    }
];
