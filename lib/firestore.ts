import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs,
  serverTimestamp, deleteDoc,
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
}

/* Kullanıcı profili oluştur */
export async function createUserProfile(
  uid: string,
  data: Pick<UserProfile, "email" | "username" | "displayName" | "photoURL">
) {
  const profile: Omit<UserProfile, "createdAt"> & { createdAt: unknown } = {
    uid,
    email:       data.email,
    username:    data.username.toLowerCase(),
    displayName: data.displayName,
    photoURL:    data.photoURL,
    role:        "user",
    status:      "active",
    createdAt:   serverTimestamp(),
    settings: {
      navbarPosition: "top",
      theme:          "dark",
    },
  };

  await setDoc(doc(db, "users", uid), profile);
  /* Username index */
  await setDoc(doc(db, "usernames", data.username.toLowerCase()), { uid });
}

/* Kullanıcı profili getir */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/* Username'e göre uid bul */
export async function getUserByUsername(username: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return snap.exists() ? (snap.data().uid as string) : null;
}

/* Username müsait mi? */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return !snap.exists();
}

/* Profil güncelle */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "displayName" | "photoURL" | "settings">>
) {
  await updateDoc(doc(db, "users", uid), data as Record<string, unknown>);
}

/* Username güncelle */
export async function updateUsername(uid: string, oldUsername: string, newUsername: string) {
  const available = await isUsernameAvailable(newUsername);
  if (!available) throw new Error("Bu username zaten alınmış.");

  await updateDoc(doc(db, "users", uid), { username: newUsername.toLowerCase() });
  await setDoc(doc(db, "usernames", newUsername.toLowerCase()), { uid });
  await deleteDoc(doc(db, "usernames", oldUsername.toLowerCase()));
}

/* Hesap sil (Firestore verisi) */
export async function deleteUserData(uid: string, username: string) {
  await deleteDoc(doc(db, "users", uid));
  await deleteDoc(doc(db, "usernames", username.toLowerCase()));
}
