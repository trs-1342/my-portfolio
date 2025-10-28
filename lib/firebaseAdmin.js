import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function readServiceAccountFromEnv() {
  let projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || // fallback
    process.env.F_PROJECT_ID;

  let clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL || process.env.F_CLIENT_EMAIL;

  let privateKey =
    process.env.FIREBASE_PRIVATE_KEY || process.env.F_PRIVATE_KEY;

  if (privateKey && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  return { projectId, clientEmail, privateKey };
}

let app;

if (globalThis.__FIREBASE_ADMIN_APP__) {
  app = globalThis.__FIREBASE_ADMIN_APP__;
} else {
  const { projectId, clientEmail, privateKey } = readServiceAccountFromEnv();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin env eksik: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY"
    );
  }

  app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });

  globalThis.__FIREBASE_ADMIN_APP__ = app;
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app); // <-- sadece export; settings YOK
export default app;
