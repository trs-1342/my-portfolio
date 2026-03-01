export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminAuth } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";

function normalizeGoogleAvatar(url, size = 128) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("googleusercontent.com")) {
      if (u.searchParams.has("sz")) {
        u.searchParams.set("sz", String(size));
        return u.toString();
      }
      return `${u.toString()}=s${size}-c`;
    }
    return u.toString();
  } catch {
    return url;
  }
}

async function getMe() {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;

  try {
    const dec = await adminAuth.verifySessionCookie(token, true);
    const email = dec.email || `${dec.uid}@noemail.local`;

    return await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, image: true },
    });
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const me = await getMe();
  if (!me) redirect("/login");

  const img = normalizeGoogleAvatar(me.image, 128);

  return (
    <>
      <Nav />
      <ThemeToggle />
      <main className="profile-wrap">
        <section className="profile-card" aria-labelledby="profile-heading">
          <header className="profile-head">
            <Image
              src={`/api/avatar?u=${encodeURIComponent(img)}&sz=128`}
              width={72}
              height={72}
              className="profile-avatar"
              alt=""
              priority
            />

            <div className="profile-id">
              <h1 id="profile-heading">{me.name || "İsimsiz"}</h1>
              <div className="profile-email">{me.email}</div>
            </div>
          </header>

          <dl className="profile-rows">
            <div className="profile-row">
              <dt>Kullanıcı ID</dt>
              <dd>{me.id}</dd>
            </div>
            <div className="profile-row">
              <dt>Durum</dt>
              <dd>Aktif</dd>
            </div>
          </dl>

          <div className="profile-actions">
            <Link href="/" className="btn">Anasayfa</Link>
            <LogoutButton />
          </div>
        </section>
      </main>
    </>
  );
}
