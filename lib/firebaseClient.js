// /lib/firebaseClient.js

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Tekil Firebase app
export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Tekil Auth instance (bunu import ediyorsun)
export const auth = getAuth(firebaseApp);

// İsteğe bağlı provider export’u (istersen doğrudan bunu da kullanabilirsin)
export const googleProvider = new GoogleAuthProvider();

// Default export ekli (eski kodlar firebaseApp default bekliyorsa kırılmasın)
export default firebaseApp;
