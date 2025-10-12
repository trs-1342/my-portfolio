// lib/firebaseAdmin.js
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function resolvePK(raw) {
  return raw?.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

const app =
  getApps()[0] ||
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: resolvePK(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });

export const adminAuth = getAuth(app);
export const db = getFirestore(app);
