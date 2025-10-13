// /lib/firebaseAdmin.js
// Sadece Node.js tarafında import edin (API route'ları, server utils).

import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function readServiceAccountFromEnv() {
  // Birincil isimler
  let projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || // public olsa da proje id gizli değil, fallback olarak kabul
    process.env.F_PROJECT_ID;

  let clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL || process.env.F_CLIENT_EMAIL;

  let privateKey =
    process.env.FIREBASE_PRIVATE_KEY || process.env.F_PRIVATE_KEY;

  // \n kaçışlarını gerçek satır sonuna çevir
  if (privateKey && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  // Alternatif: JSON tek değişkende verdiysek
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if ((!projectId || !clientEmail || !privateKey) && json) {
    try {
      const obj = JSON.parse(json);
      projectId = projectId || obj.project_id;
      clientEmail = clientEmail || obj.client_email;
      privateKey = privateKey || obj.private_key;
    } catch {
      // yut
    }
  }

  return { projectId, clientEmail, privateKey };
}

let app;

if (globalThis.__FIREBASE_ADMIN_APP__) {
  app = globalThis.__FIREBASE_ADMIN_APP__;
} else {
  const { projectId, clientEmail, privateKey } = readServiceAccountFromEnv();

  const missing = [];
  if (!projectId) missing.push("projectId");
  if (!clientEmail) missing.push("clientEmail");
  if (!privateKey) missing.push("privateKey");

  if (missing.length) {
    const dbg = {
      have_PROJECT_ID: Boolean(projectId),
      have_CLIENT_EMAIL: Boolean(clientEmail),
      have_PRIVATE_KEY: Boolean(privateKey),
      // İSİMLER: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
      // ESKİ İSİMLER: F_PROJECT_ID / F_CLIENT_EMAIL / F_PRIVATE_KEY
    };
    throw new Error(
      `Firebase Admin env eksik: ${missing.join(", ")}. Debug=${JSON.stringify(
        dbg
      )}`
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

export const adminAuth = getAuth(app); // instance — fonksiyon gibi çağırma
export default app;
