// lib/firebaseAdmin.js
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let _auth = null;
let _db = null;

export function ensureAdmin() {
  if (_auth && _db) return { adminAuth: _auth, db: _db };

  const projectId = process.env.F_PROJECT_ID;
  const clientEmail = process.env.F_CLIENT_EMAIL;
  let privateKey = process.env.F_PRIVATE_KEY;

  // Env yoksa import anında patlatma, sadece null dön
  if (!projectId || !clientEmail || !privateKey) return null;

  privateKey = privateKey.replace(/\\n/g, "\n");

  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });

  _auth = getAuth(app);
  _db = getFirestore(app);
  return { adminAuth: _auth, db: _db };
}

export const isAdminReady = () => Boolean(ensureAdmin());
