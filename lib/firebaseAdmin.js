// lib/firebaseAdmin.js
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const app =
  getApps()[0] ||
  initializeApp({
    credential: cert({
      projectId: process.env.F_PROJECT_ID,
      clientEmail: process.env.F_CLIENT_EMAIL,
      privateKey: process.env.F_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });

export const adminAuth = getAuth(app);
export const db = getFirestore(app);
