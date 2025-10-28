// app/api/auth/session/route.ts (veya .js)
export const runtime = 'nodejs';

import { adminAuth } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';

export async function POST(req) {
  const { idToken } = await req.json();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 gün

  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

  // Next 15+: cookies() await edilmeli
  const store = await cookies();
  store.set('session', sessionCookie, {
    maxAge: Math.floor(expiresIn / 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // localde false olur
    path: '/',
    sameSite: 'lax',
  });

  return Response.json({ status: 'ok' });
}
