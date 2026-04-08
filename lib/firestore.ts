import {
  doc, getDoc, setDoc, updateDoc,
  serverTimestamp, deleteDoc,
  collection, addDoc,
  getDocs, query, orderBy, where,
  arrayUnion, arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  role: "user" | "admin";
  status: "active" | "banned" | "pending";
  createdAt: unknown; // Firestore Timestamp
  blockedPages?: string[]; // engellenmiş sayfa path'leri
  features?: {
    rss?:           boolean; // RSS takibi ve email bildirimleri
    articles?:      boolean; // makale bildirimleri
    announcements?: boolean; // duyuru bildirimleri
  };
  settings: {
    navbarPosition: "top" | "bottom";
    theme: string; // tema ID: "dark-green", "dark-red", "light-blue" vb.
  };
  notifications: {
    email:              boolean;
    newMessage:         boolean;
    system:             boolean;
    newArticle?:        boolean; // yeni makale yayınlandığında
    newRssFeed?:        boolean; // (eski) yeni RSS kaynağı eklendiğinde — artık kullanılmıyor
    newRssPost?:        boolean; // RSS akışında yeni yazı çıktığında
    newAnnouncement?:   boolean; // yeni duyuru yayınlandığında
  };
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

/* Kullanıcı profili oluştur */
export async function createUserProfile(
  uid: string,
  data: Pick<UserProfile, "email" | "username" | "displayName" | "photoURL">
) {
  if (!db) return; // Build hatasını önleyen kritik kontrol

  const isAdmin = ADMIN_EMAIL && data.email === ADMIN_EMAIL;

  await setDoc(doc(db, "users", uid), {
    uid,
    email:       data.email,
    username:    data.username.toLowerCase(),
    displayName: data.displayName,
    photoURL:    data.photoURL,
    role:        isAdmin ? "admin" : "user",
    status:      isAdmin ? "active" : "pending",
    createdAt:   serverTimestamp(),
    settings: {
      navbarPosition: "top",
      theme:          "dark",
    },
    notifications: {
      email:            true,
      newMessage:       true,
      system:           true,
      newArticle:       true,
      newRssPost:       true,
      newAnnouncement:  true,
    },
  });

  await setDoc(doc(db, "usernames", data.username.toLowerCase()), { uid });
}

/* Giriş yapıldığında admin rolünü garantile */
export async function ensureAdminRole(uid: string, email: string) {
  if (!db || !ADMIN_EMAIL || email !== ADMIN_EMAIL) return;

  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists() && snap.data().role !== "admin") {
    await updateDoc(doc(db, "users", uid), { role: "admin" });
  }
}

/* Kullanıcı profili getir */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;

  const data = snap.data() as UserProfile;

  if (!data.notifications) {
    data.notifications = { email: true, newMessage: true, system: true, newArticle: true, newRssPost: true, newAnnouncement: true };
  } else {
    // Eski profillerde eksik olabilecek alanlar için varsayılan
    data.notifications.newRssPost       ??= true;
    data.notifications.newAnnouncement  ??= true;
  }
  return data;
}

/* Username müsait mi? */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!db) return false;
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return !snap.exists();
}

/* Profil güncelle */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "displayName" | "photoURL" | "settings" | "notifications" | "features">>
) {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), data as Record<string, unknown>);
}

/* Kullanıcı özellik tercihlerini güncelle (admin veya kullanıcı) */
export async function updateUserFeatures(
  uid: string,
  features: NonNullable<UserProfile["features"]>
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), { features });
}

/* Username güncelle */
export async function updateUsername(uid: string, oldUsername: string, newUsername: string) {
  if (!db) return;

  if (!(await isUsernameAvailable(newUsername))) throw new Error("Bu username zaten alınmış.");

  await updateDoc(doc(db, "users", uid), { username: newUsername.toLowerCase() });
  await setDoc(doc(db, "usernames", newUsername.toLowerCase()), { uid });
  await deleteDoc(doc(db, "usernames", oldUsername.toLowerCase()));
}

/* Hesap sil */
export async function deleteUserData(uid: string, username: string) {
  if (!db) return;
  await deleteDoc(doc(db, "users", uid));
  await deleteDoc(doc(db, "usernames", username.toLowerCase()));
}

/* İletişim formu mesajını Firestore'a kaydet */
export async function saveContactMessage(data: {
  name: string;
  email: string;
  category: string;
  message: string;
}) {
  if (!db) return;
  await addDoc(collection(db, "contacts"), {
    ...data,
    createdAt: serverTimestamp(),
    read: false,
  });
}

/* Kullanıcının tema tercihini kaydet */
export async function updateUserTheme(uid: string, themeId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), { "settings.theme": themeId });
}

/* ── Footer Types & CRUD ── */

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  icon?: string;
  order: number;
}

export interface FooterConfig {
  motto: string;
  copyright: string;
  socials: FooterLink[];
  pages: FooterLink[];
}

const FOOTER_DEFAULTS: FooterConfig = {
  motto:     "I defend the moral concept in software.",
  copyright: "© 2026 — trs. Tüm hakları saklıdır.",
  socials: [
    { id: "gh", label: "GitHub",    href: "https://github.com/trs-1342",          icon: "⌨️", order: 0 },
    { id: "ig", label: "Instagram", href: "https://instagram.com/trs.1342",       icon: "📸", order: 1 },
    { id: "li", label: "LinkedIn",  href: "https://linkedin.com/in/halilhattabh", icon: "💼", order: 2 },
    { id: "em", label: "Email",     href: "mailto:hattab1342@gmail.com",           icon: "✉️", order: 3 },
  ],
  pages: [
    { id: "p1", label: "Hakkımda",    href: "/about",       order: 0 },
    { id: "p2", label: "Projeler",    href: "/my-projects", order: 1 },
    { id: "p3", label: "Fotoğraflar", href: "/photos",      order: 2 },
    { id: "p4", label: "Hsounds",     href: "/hsounds",     order: 3 },
    { id: "p5", label: "Teşekkürler", href: "/thanks",      order: 4 },
    { id: "p6", label: "İletişim",    href: "/contact",     order: 5 },
  ],
};

export async function getFooterConfig(): Promise<FooterConfig> {
  if (!db) return FOOTER_DEFAULTS;
  const snap = await getDoc(doc(db, "site_config", "footer"));
  if (!snap.exists()) return FOOTER_DEFAULTS;
  return snap.data() as FooterConfig;
}

export async function setFooterConfig(data: FooterConfig): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "footer"), data);
}

/* ── Thanks (Teşekkürler) Types & CRUD ── */

export interface ThanksPerson {
  id: string;
  name: string;
  message: string;
  color: string;       // hex (#ef4444)
  url?: string | null; // null → Firestore'da undefined sorununu önler
  highlight: boolean;
  order: number;
}

export interface ThanksCategory {
  id: string;
  title: string;
  icon: string;
  order: number;
  people: ThanksPerson[];
}

export async function getThanksCategories(): Promise<ThanksCategory[]> {
  if (!db) return [];
  const snap = await getDoc(doc(db, "site_config", "thanks"));
  if (!snap.exists()) return [];
  return (snap.data()?.categories ?? []) as ThanksCategory[];
}

export async function setThanksCategories(categories: ThanksCategory[]): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "thanks"), { categories });
}

/* Site varsayılan temasını getir (giriş yapmayan ziyaretçiler için) */
export async function getSiteTheme(): Promise<string | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "site_config", "appearance"));
  if (!snap.exists()) return null;
  return (snap.data()?.theme as string) ?? null;
}

/* Site varsayılan temasını güncelle (sadece admin) */
export async function setSiteTheme(themeId: string): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "appearance"), { theme: themeId }, { merge: true });
}

/* Kullanıcı durumunu güncelle (admin) */
export async function updateUserStatus(uid: string, status: "active" | "banned" | "pending") {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), { status });
}

/* Hesabı onayla — pending → active (admin) */
export async function approveUser(uid: string) {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), { status: "active" });
}

/* Kullanıcının engellenmiş sayfalarını güncelle (admin) */
export async function updateUserBlockedPages(uid: string, blockedPages: string[]) {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), { blockedPages });
}

/* ── Admin Fonksiyonları ── */

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  createdAt: { seconds: number } | null;
  read: boolean;
}

/* Tüm iletişim mesajlarını getir (admin) */
export async function getContacts(): Promise<ContactMessage[]> {
  if (!db) return [];
  const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage));
}

/* Mesajı okundu olarak işaretle */
export async function markContactRead(id: string, read = true) {
  if (!db) return;
  await updateDoc(doc(db, "contacts", id), { read });
}

/* Mesajı sil */
export async function deleteContact(id: string) {
  if (!db) return;
  await deleteDoc(doc(db, "contacts", id));
}

/* Tüm kullanıcıları getir (admin) */
export async function getAllUsers(): Promise<UserProfile[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => d.data() as UserProfile);
}

/* ── Site Config Types ── */

export interface HeroButton {
  id: string;
  label: string;
  href: string;
  variant: "accent" | "ghost";
  order: number;
}

export interface SkillBadge {
  id: string;
  label: string;
  order: number;
}

export interface HomepageConfig {
  heroLevel: "junior" | "mid" | "senior";
  heroText: string;
  aboutText: string;
  buttons: HeroButton[];
  skillBadges: SkillBadge[];
}

export interface SkillItem {
  id: string;
  category: string;
  icon: string;
  name: string;
  desc: string;
  order: number;
}

export interface Project {
  id: string;
  slug?: string;          // URL slug — yoksa title'dan üretilir
  emoji: string;
  imageUrl?: string | null; // Firebase Storage URL
  title: string;
  desc: string;
  longDesc?: string;      // Detay sayfası için uzun açıklama
  highlights?: string[];  // Detay sayfası için öne çıkanlar
  lang: string;
  repo: string;
  live: string | null;
  pinned: boolean;
  active: boolean;
  status: string;
  stack: string[];
  order: number;
}

export interface ProjectsPageConfig {
  subtitle: string;
  initialized?: boolean; // true → kullanıcı en az bir kez proje ekledi/sildi; defaults gösterme
}

export interface MenuItem {
  id: string;
  href: string;
  label: string;
  icon: string;
  order: number;
}

/* ── Site Config CRUD (client-side) ── */

export async function getHomepageConfig(): Promise<HomepageConfig | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "site_config", "homepage"));
  if (!snap.exists()) return null;
  return snap.data() as HomepageConfig;
}

export async function setHomepageConfig(data: HomepageConfig): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "homepage"), data);
}

export async function getSkillsConfig(): Promise<SkillItem[] | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "site_config", "skills"));
  if (!snap.exists()) return null;
  return (snap.data()?.items ?? []) as SkillItem[];
}

export async function setSkillsConfig(items: SkillItem[]): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "skills"), { items });
}

export async function getMenuItems(): Promise<MenuItem[] | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "site_config", "menu"));
  if (!snap.exists()) return null;
  return (snap.data()?.items ?? []) as MenuItem[];
}

export async function setMenuItems(items: MenuItem[]): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "menu"), { items });
}

/* ── Projects CRUD (client-side) ── */

export async function getProjectsList(): Promise<Project[]> {
  if (!db) return [];
  const q    = query(collection(db, "projects"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
}

export async function addProject(data: Omit<Project, "id">): Promise<string> {
  if (!db) return "";
  const ref = await addDoc(collection(db, "projects"), data);
  /* Kullanıcı projeleri yönetmeye başladı — defaults artık gösterilmez */
  await setDoc(doc(db, "site_config", "projects_page"), { initialized: true }, { merge: true });
  return ref.id;
}

export async function updateProject(id: string, data: Partial<Omit<Project, "id">>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "projects", id), data as Record<string, unknown>);
}

export async function deleteProject(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, "projects", id));
  /* Silme de bir yönetim aksiyonu — initialized flag'ini koru */
  await setDoc(doc(db, "site_config", "projects_page"), { initialized: true }, { merge: true });
}

/** Admin proje yönetimine başladığında çağrılır — defaults bir daha gösterilmez */
export async function markProjectsInitialized(): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "projects_page"), { initialized: true }, { merge: true });
}

export async function getProjectsPageConfig(): Promise<ProjectsPageConfig | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "site_config", "projects_page"));
  if (!snap.exists()) return null;
  return snap.data() as ProjectsPageConfig;
}

export async function setProjectsPageConfig(data: ProjectsPageConfig): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "projects_page"), data);
}

/* Okunmamış mesaj sayısı */
export async function getUnreadContactCount(): Promise<number> {
  if (!db) return 0;
  const q = query(collection(db, "contacts"), where("read", "==", false));
  const snap = await getDocs(q);
  return snap.size;
}

/* ── About Config Types ── */

/* About sayfası profil/slider fotoğrafı (site_config/about içinde saklanır) */
export interface AboutPhoto {
  id: string;
  url: string;
  order: number;
}

/* Galeri fotoğrafı (photos collection'ında saklanır) */
export interface PhotoItem {
  id: string;
  url: string;         // Firebase Storage download URL
  storagePath: string; // Firebase Storage path (silme için)
  title: string;
  caption: string;
  order: number;
  favorites: string[]; // favori yapan kullanıcıların UID listesi
  createdAt: unknown;
}

export interface CvFile {
  id: string;
  url: string;
  label: string;
  order: number;
}

export interface LifeEvent {
  id: string;
  date: string;
  title: string;
  desc: string;
  log: string;
  isCurrent: boolean;
  order: number;
}

export interface AboutConfig {
  name: string;
  handle: string;
  aboutLevel: "junior" | "mid" | "senior";
  aboutText: string;
  bioText: string;
  buttons: HeroButton[];
  photos: AboutPhoto[];
  cvFiles: CvFile[];
}

/* ── About Config CRUD (client-side) ── */

export async function getAboutConfig(): Promise<AboutConfig | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "site_config", "about"));
  if (!snap.exists()) return null;
  return snap.data() as AboutConfig;
}

export async function setAboutConfig(data: AboutConfig): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "about"), data);
}

/* ── Photos CRUD ── */

export async function getPhotos(): Promise<PhotoItem[]> {
  if (!db) return [];
  const q = query(collection(db, "photos"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PhotoItem));
}

export async function addPhoto(data: Omit<PhotoItem, "id">): Promise<string> {
  if (!db) return "";
  const ref2 = await addDoc(collection(db, "photos"), data);
  return ref2.id;
}

export async function updatePhoto(id: string, data: Partial<Omit<PhotoItem, "id">>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "photos", id), data as Record<string, unknown>);
}

export async function deletePhoto(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, "photos", id));
}

/* Makale beğeni ekle/çıkar */
export async function toggleArticleLike(articleId: string, uid: string, add: boolean): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "hsounds_articles", articleId), {
    likes: add ? arrayUnion(uid) : arrayRemove(uid),
  });
}

/* Favori ekle/çıkar */
export async function togglePhotoFavorite(photoId: string, uid: string, add: boolean): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "photos", photoId), {
    favorites: add ? arrayUnion(uid) : arrayRemove(uid),
  });
}

/* ── HSounds Types & CRUD (client-side) ── */

export interface HsArticle {
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

export interface HsRssFeed {
  id: string;
  source_name: string;
  source_icon: string;   // emoji, varsayılan '🌐'
  feed_url: string;      // RSS feed URL'si
  lastChecked?: string;       // ISO — son kontrol zamanı (cron)
  lastKnownGuids?: string[];  // bilinen son post GUID'leri (cron)
}

export interface HsAnnouncement {
  id: string;
  title: string;
  content: string;      // HTML
  excerpt: string;
  is_published: boolean;
  pinned: boolean;
  created_at: string;   // ISO 8601
}

export async function getHsArticles(): Promise<HsArticle[]> {
  if (!db) return [];
  const q = query(collection(db, "hsounds_articles"), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HsArticle));
}

export async function getHsArticle(id: string): Promise<HsArticle | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "hsounds_articles", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as HsArticle;
}

export async function addHsArticle(data: Omit<HsArticle, "id">): Promise<string> {
  if (!db) return "";
  const ref = await addDoc(collection(db, "hsounds_articles"), data);
  return ref.id;
}

export async function updateHsArticle(id: string, data: Partial<Omit<HsArticle, "id">>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "hsounds_articles", id), data as Record<string, unknown>);
}

export async function deleteHsArticle(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, "hsounds_articles", id));
}

export async function getHsFeeds(): Promise<HsRssFeed[]> {
  if (!db) return [];
  const snap = await getDoc(doc(db, "site_config", "hsounds_feeds"));
  if (!snap.exists()) return [];
  return (snap.data()?.feeds ?? []) as HsRssFeed[];
}

export async function setHsFeeds(feeds: HsRssFeed[]): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "hsounds_feeds"), { feeds });
}

/* ── HSounds Duyurular CRUD (client-side) ── */

export async function getHsAnnouncements(): Promise<HsAnnouncement[]> {
  if (!db) return [];
  const q = query(collection(db, "announcements"), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HsAnnouncement));
}

export async function getHsAnnouncement(id: string): Promise<HsAnnouncement | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "announcements", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as HsAnnouncement;
}

export async function addHsAnnouncement(data: Omit<HsAnnouncement, "id">): Promise<string> {
  if (!db) return "";
  const ref = await addDoc(collection(db, "announcements"), data);
  return ref.id;
}

export async function updateHsAnnouncement(id: string, data: Partial<Omit<HsAnnouncement, "id">>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "announcements", id), data as Record<string, unknown>);
}

export async function deleteHsAnnouncement(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, "announcements", id));
}

export async function getLifeEvents(): Promise<LifeEvent[] | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "site_config", "life_events"));
  if (!snap.exists()) return null;
  return (snap.data()?.items ?? []) as LifeEvent[];
}

export async function setLifeEvents(items: LifeEvent[]): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "life_events"), { items });
}

/* ── Yorum Sistemi ── */

export interface Comment {
  id: string;
  articleId: string;
  authorUid: string;
  authorName: string;
  authorUsername: string;
  authorPhotoURL?: string | null;
  text: string;
  likes: string[];
  parentId: string | null;
  createdAt: { seconds: number; nanoseconds: number } | null;
}

export async function getComments(articleId: string): Promise<Comment[]> {
  if (!db) return [];
  const q = query(
    collection(db, "comments"),
    where("articleId", "==", articleId),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
}

export async function addComment(
  data: Omit<Comment, "id" | "createdAt" | "likes">,
): Promise<string> {
  if (!db) return "";
  const ref = await addDoc(collection(db, "comments"), {
    ...data,
    likes: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteComment(commentId: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, "comments", commentId));
}

export async function toggleCommentLike(
  commentId: string,
  uid: string,
  add: boolean,
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "comments", commentId), {
    likes: add ? arrayUnion(uid) : arrayRemove(uid),
  });
}

/* ── Site Bildirim Konfigürasyonu ── */

export interface SiteNotificationsConfig {
  rssEmailEnabled:           boolean; // Global RSS email switch
  articlesEmailEnabled:      boolean; // Global makale email switch
  announcementsEmailEnabled: boolean; // Global duyuru email switch
}

const NOTIF_DEFAULTS: SiteNotificationsConfig = {
  rssEmailEnabled:           true,
  articlesEmailEnabled:      true,
  announcementsEmailEnabled: true,
};

export async function getSiteNotificationsConfig(): Promise<SiteNotificationsConfig> {
  if (!db) return NOTIF_DEFAULTS;
  const snap = await getDoc(doc(db, "site_config", "notifications"));
  if (!snap.exists()) return NOTIF_DEFAULTS;
  const d = snap.data();
  return {
    rssEmailEnabled:           d.rssEmailEnabled           ?? true,
    articlesEmailEnabled:      d.articlesEmailEnabled       ?? true,
    announcementsEmailEnabled: d.announcementsEmailEnabled  ?? true,
  };
}

export async function setSiteNotificationsConfig(data: Partial<SiteNotificationsConfig>): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "site_config", "notifications"), data, { merge: true });
}
