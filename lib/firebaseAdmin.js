// lib/firebaseAdmin.js
import admin from "firebase-admin";

let app;
try {
  app = admin.app();
} catch {
  const projectId = process.env.F_PROJECT_ID;
  const clientEmail = process.env.F_CLIENT_EMAIL;
  let privateKey = process.env.F_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "[firebaseAdmin] F_PROJECT_ID / F_CLIENT_EMAIL / F_PRIVATE_KEY eksik."
    );
  }

  // Vercel/.env satırsonu kaçışlarını düzelt
  privateKey = privateKey.replace(/\\n/g, "\n");

  app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminAuth = () => admin.auth(app);
