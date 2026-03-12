import {
  doc, getDoc, setDoc, updateDoc,
  serverTimestamp, deleteDoc,
  collection, addDoc,
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
