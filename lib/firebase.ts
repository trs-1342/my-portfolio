import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/* .env.local henüz doldurulmamışsa Firebase'i başlatma */
const isConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isConfigured) {
  app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db   = getFirestore(app);
} else if (typeof window !== "undefined") {
  console.warn("[firebase] NEXT_PUBLIC_FIREBASE_API_KEY eksik — .env.local dosyasını doldur.");
}

export { auth, db };
export const googleProvider = new GoogleAuthProvider();
export const firebaseReady  = isConfigured;
