/**
 * HSounds veri servisi — Firebase Admin SDK kullanır (server-side only).
 */

import { adminDb } from "./firebase-admin";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;      // HTML string
  created_at: string;   // ISO 8601
  read_time: number;    // dakika
  is_published: boolean;
  likes?: string[];     // beğenen kullanıcıların UID listesi
}

export interface RssFeed {
  id: string;
  source_name: string;
  source_icon: string;  // emoji, varsayılan '🌐'
  feed_url: string;     // RSS feed URL'si
}

export interface RssPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;      // HTML
  excerpt: string;
  is_published: boolean;
  pinned: boolean;
  created_at: string;   // ISO 8601
}

/* ── Duyurular ── */

export async function getAnnouncements(): Promise<Announcement[]> {
  const snap = await adminDb.collection("announcements").get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Announcement))
    .filter((a) => a.is_published)
    .sort((a, b) => {
      // Sabitlenmiş duyurular önce
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.created_at.localeCompare(a.created_at);
    });
}

/* ── Makale CRUD ── */

export async function getArticles(): Promise<Article[]> {
  const snap = await adminDb.collection("hsounds_articles").get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Article))
    .filter((a) => a.is_published)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const snap = await adminDb
    .collection("hsounds_articles")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  const article = { id: d.id, ...d.data() } as Article;
  return article.is_published ? article : null;
}

/* ── RSS Kaynakları ── */

export async function getRssFeeds(): Promise<RssFeed[]> {
  const snap = await adminDb.doc("site_config/hsounds_feeds").get();
  if (!snap.exists) return [];
  return ((snap.data()?.feeds ?? []) as RssFeed[]);
}

export async function getRssFeedById(id: string): Promise<RssFeed | null> {
  const feeds = await getRssFeeds();
  return feeds.find((f) => f.id === id) ?? null;
}

/* ── RSS XML Parser ── */

function extractCdata(raw: string): string {
  return raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? extractCdata(m[1].trim()) : "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function fetchRssPosts(feedUrl: string): Promise<RssPost[]> {
  if (!feedUrl) return [];
  try {
    const res = await fetch(feedUrl, {
      cache: "no-store",
      headers: { "User-Agent": "trs-portfolio/1.0", "Accept": "application/rss+xml, application/xml, text/xml, */*" },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: RssPost[] = [];
    const itemRe = /<item>([\s\S]*?)<\/item>/gi;
    let m: RegExpExecArray | null;

    while ((m = itemRe.exec(xml)) !== null) {
      const block = m[1];
      const title = extractTag(block, "title");
      const link  = extractTag(block, "link") || extractTag(block, "guid");
      const pubDate     = extractTag(block, "pubDate");
      const description = stripHtml(extractTag(block, "description")).slice(0, 280);
      const guid        = extractTag(block, "guid") || link;

      if (title && link) {
        items.push({ title, link, pubDate, description, guid });
      }
    }

    return items.slice(0, 20);
  } catch {
    return [];
  }
}
