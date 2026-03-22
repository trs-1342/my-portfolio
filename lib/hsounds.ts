/**
 * HSounds veri servisi — Firebase Admin SDK kullanır (server-side only).
 */

import { adminDb } from "./firebase-admin";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;   // HTML string
  created_at: string;   // ISO 8601
  read_time: number;    // dakika
  is_published: boolean;
}

export interface RssFeed {
  id: string;
  source_name: string;
  source_icon: string;  // emoji veya URL
  title: string;
  link: string;
  published_date: string; // ISO 8601
}

export async function getArticles(): Promise<Article[]> {
  /* is_published + created_at composite index gerektirmemek için
     tüm makaleleri çek, sonra filtrele ve sırala */
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

export async function getRssFeeds(): Promise<RssFeed[]> {
  const snap = await adminDb.doc("site_config/hsounds_feeds").get();
  if (!snap.exists) return [];
  return ((snap.data()?.feeds ?? []) as RssFeed[]);
}
