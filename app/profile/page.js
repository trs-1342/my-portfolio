export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";
import Link from "next/link";

// Server-side oturum okuma (aynı cookie)
async function getMe() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;

  try {
    const dec = await adminAuth.verifySessionCookie(token, true);
    const email = dec.email || `${dec.uid}@noemail.local`;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, image: true },
    });
    return user;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const me = await getMe();

  if (!me) {
    // Artık login sayfasına YÖNLENDİRMİYORUZ; sayfada uyarı + link gösteriyoruz
    return (
      <div className="px-6 py-10">
        <h1 className="text-xl font-semibold mb-3">Giriş gerekli</h1>
        <p className="mb-6 opacity-80">
          Hesap bilgilerini görmek için Google ile giriş yap.
        </p>
        <Link href="/login" className="underline">
          Google ile giriş yap
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">Hesap</h1>
      <div className="flex items-center gap-4">
        {me.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={me.image}
            alt="avatar"
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-neutral-700" />
        )}
        <div>
          <div className="font-medium">{me.name || "İsimsiz"}</div>
          <div className="opacity-70 text-sm">{me.email}</div>
        </div>
      </div>
    </div>
  );
}
