// app/hsounds/page.js

import Link from "next/link";
import { hsoundsPosts } from "@/data/hsoundsPosts.ts";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "HSounds | Halil Hattab",
  description: "HSounds sayfasında geliştirdiğim projeleri, fikirleri ve deneyleri paylaşıyorum.",
};

export default function HSoundsPage() {
  return (
    <div>
      <div>
        <Nav />
        <ThemeToggle />
      </div>
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          HSounds
        </h1>

        <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
          Burada geliştirdiğim projeleri, fikirleri ve deneyleri paylaşıyorum.
          Bu sayfanın RSS feed&apos;ini kullanarak güncellemeleri uygulamandan takip edebilirsin.
        </p>

        <p style={{ marginBottom: "2rem", fontSize: "0.9rem", opacity: 0.7 }}>
          RSS adresi:{" "}
          <code>
            https://hattab.vercel.app/hsounds/rss.xml
          </code>
        </p>

        {hsoundsPosts.length === 0 ? (
          <p>Şimdilik paylaşım yok. Birazdan buralar dolar.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {hsoundsPosts
              .slice()
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((post) => (
                <li
                  key={post.slug}
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "1rem 1.25rem",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <h2 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                    {post.title}
                  </h2>
                  <small style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                    {new Date(post.date).toLocaleDateString("tr-TR")}
                  </small>
                  <p style={{ marginTop: "0.5rem", opacity: 0.8 }}>
                    {post.summary}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </main>
    </div>
  );
}
