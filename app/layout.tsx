import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hattab.vercel.app";

export const metadata: Metadata = {
  title: "trs — Software Developer",
  description: "Mid-level Software Developer. C, Linux, Web.",
  openGraph: {
    title: "trs — Software Developer",
    description: "Mid-level Software Developer. C, Linux, Web.",
    url: BASE_URL,
    siteName: "trs",
    images: [
      {
        url: `${BASE_URL}/api/og?title=trs&desc=Software+Developer+%C2%B7+C%2C+Linux%2C+Web&type=page`,
        width: 1200,
        height: 630,
        alt: "trs — Software Developer",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "trs — Software Developer",
    description: "Mid-level Software Developer. C, Linux, Web.",
    images: [`${BASE_URL}/api/og?title=trs&desc=Software+Developer+%C2%B7+C%2C+Linux%2C+Web&type=page`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Tema flash'ını önle — render öncesi localStorage okur */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark-green';if(t==='light')t='light-green';if(t==='dark')t='dark-green';document.documentElement.setAttribute('data-theme',t);if(t.startsWith('light-'))document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
