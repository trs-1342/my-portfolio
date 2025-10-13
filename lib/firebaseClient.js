// lib/firebaseClient.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // vs...
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// Apple (OAuthProvider)
export const appleProvider = new OAuthProvider("apple.com");
// isteğe bağlı scope'lar
appleProvider.addScope("email");
appleProvider.addScope("name");
// locale ayarı (opsiyonel)
appleProvider.setCustomParameters({ locale: "tr" });
