import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/** Tek satır \n kaçışlı veya çok satır private key'i normalize eder */
function normalizePrivateKey(raw) {
  if (!raw) return undefined;
  // Vercel vb. tek satır: \n → gerçek satır sonu
  if (raw.includes("\\n")) return raw.replace(/\\n/g, "\n");
  // Bazı paneller çift tırnak ekleyebilir
  return raw.replace(/^"(.*)"$/s, "$1");
}

const projectId = process.env.F_PROJECT_ID;
const clientEmail = process.env.F_CLIENT_EMAIL;
const privateKey = normalizePrivateKey(process.env.F_PRIVATE_KEY);

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "[firebaseAdmin] F_PROJECT_ID / F_CLIENT_EMAIL / F_PRIVATE_KEY env değişkenleri eksik."
  );
}

export async function ensureAdmin(sessionCookie) {
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded || null;
  } catch (e) {
    return null;
  }
}

const app =
  getApps()[0] ||
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

export const adminAuth = getAuth(app);
export const db = getFirestore(app);
