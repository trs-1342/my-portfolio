// lib/firebaseAdmin.js
import "server-only";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let appSingleton = null;

function normalizePrivateKey(raw) {
  if (!raw) return "";
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key;
}

export function ensureAdmin() {
  if (appSingleton) return appSingleton;

  const projectId = process.env.F_PROJECT_ID;
  const clientEmail = process.env.F_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.F_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "[firebaseAdmin] F_PROJECT_ID / F_CLIENT_EMAIL / F_PRIVATE_KEY eksik."
    );
  }

  appSingleton =
    getApps()[0] ||
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });

  return appSingleton;
}

export function adminAuth() {
  return getAuth(ensureAdmin());
}
export function adminDb() {
  return getFirestore(ensureAdmin());
}
export const isAdminReady = () =>
  Boolean(
    process.env.F_PROJECT_ID &&
      process.env.F_CLIENT_EMAIL &&
      process.env.F_PRIVATE_KEY
  );
