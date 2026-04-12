import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";

const OG_LOCALES: Record<string, string> = {
  tr: "tr_TR",
  en: "en_US",
  ar: "ar_SA",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    tr: "trs — Software Developer",
    en: "trs — Software Developer",
    ar: "trs — مطوّر برمجيات",
  };
  const descriptions: Record<string, string> = {
    tr: "Mid-level Software Developer. C, Linux, Web.",
    en: "Mid-level Software Developer. C, Linux, Web.",
    ar: "مطوّر برمجيات. C، Linux، Web.",
  };

  const title = titles[locale] ?? titles.en;
  const description = descriptions[locale] ?? descriptions.en;
  const ogLocale = OG_LOCALES[locale] ?? "en_US";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      siteName: "trs",
      images: [
        {
          url: `${BASE_URL}/api/og?title=trs&desc=Software+Developer+%C2%B7+C%2C+Linux%2C+Web&type=page`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        `${BASE_URL}/api/og?title=trs&desc=Software+Developer+%C2%B7+C%2C+Linux%2C+Web&type=page`,
      ],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        tr: `${BASE_URL}/tr`,
        en: `${BASE_URL}/en`,
        ar: `${BASE_URL}/ar`,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Geçersiz locale → 404
  if (!routing.locales.includes(locale as "tr" | "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <head>
        {/* Tema flash'ını önle — render öncesi localStorage okur */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark-green';if(t==='light')t='light-green';if(t==='dark')t='dark-green';document.documentElement.setAttribute('data-theme',t);if(t.startsWith('light-'))document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${isRTL ? notoArabic.variable : inter.variable} ${jetbrainsMono.variable}`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
