// app/profile/page.js
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Nav from "@/components/Nav";
import { adminAuth } from "@/lib/firebaseAdmin";
import Link from "next/link";

export const metadata = { title: "Profil — Halil Hattab" };

export default async function ProfilePage() {
  // 🔧 Next 15: cookies() async
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) redirect("/login");

  let user;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    user = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: decoded.name ?? "",
      picture: decoded.picture ?? "",
      provider: decoded.firebase?.sign_in_provider ?? "google",
    };
  } catch {
    redirect("/login");
  }

  return (
    <main className="profile-wrap">
      <Nav />
      <section className="profile-card">
        <div className="profile-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.picture || "/avatar-fallback.png"}
            alt="Profil fotoğrafı"
            className="profile-avatar"
          />
          <div className="profile-id">
            <h1>{user.name || "İsimsiz Kullanıcı"}</h1>
            <p className="muted">{user.email}</p>
            <p className="muted">Sağlayıcı: {user.provider}</p>
          </div>
        </div>

        <div className="profile-meta">
          <div>
            <span className="tag">UID</span>
            <code>{user.uid}</code>
          </div>
        </div>

        <div className="profile-actions">
          <Link className="btn btn-primary" href="/">
            Anasayfa
          </Link>
          <a className="btn btn-danger" href="/api/auth/logout">
            Çıkış Yap
          </a>
        </div>
      </section>
    </main>
  );
}
