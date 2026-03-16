import {
  doc, getDoc, setDoc, updateDoc,
  serverTimestamp, deleteDoc,
  collection, addDoc,
  getDocs, query, orderBy, where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  role: "user" | "admin";
  status: "active" | "banned";
  createdAt: unknown; // Firestore Timestamp
  blockedPages?: string[]; // engellenmiş sayfa path'leri
  settings: {
    navbarPosition: "top" | "bottom";
    theme: "dark" | "light";
  };
  notifications: {
    email:      boolean;
    newMessage: boolean;
    system:      boolean;
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
    status:      "active",
    createdAt:   serverTimestamp(),
    settings: {
      navbarPosition: "top",
      theme:          "dark",
    },
    notifications: {
      email:      true,
      newMessage: true,
      system:     true,
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
    data.notifications = { email: true, newMessage: true, system: true };
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
  data: Partial<Pick<UserProfile, "displayName" | "photoURL" | "settings" | "notifications">>
) {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), data as Record<string, unknown>);
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

/* Kullanıcı durumunu güncelle (admin) */
export async function updateUserStatus(uid: string, status: "active" | "banned") {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), { status });
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
  return ref.id;
}

export async function updateProject(id: string, data: Partial<Omit<Project, "id">>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "projects", id), data as Record<string, unknown>);
}

export async function deleteProject(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, "projects", id));
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

export interface PhotoItem {
  id: string;
  url: string;
  order: number;
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
  photos: PhotoItem[];
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
