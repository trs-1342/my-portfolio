// app/profile/page.js  (Nav’ı üstte gösterdiğini varsayıyorum)
import Nav from "@/components/Nav";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebaseAdmin";
import Image from "next/image";

export const metadata = { title: "Hesabım — Halil Hattab" };

export default async function ProfilePage() {
  const jar = await cookies();
  const token = jar.get("session")?.value;
  if (!token) redirect("/login");

  let user;
  try {
    const decoded = await adminAuth().verifySessionCookie(token, true);
    user = {
      name: decoded.name ?? "Kullanıcı",
      email: decoded.email ?? "",
      picture: decoded.picture ?? "",
    };
  } catch {
    redirect("/login");
  }

  return (
    <>
      <Nav />
      <section className="profile-wrap">
        <div className="profile-card">
          <div className="profile-head">
            <div className="avatar">
              <Image
                src={user.picture || "/avatar-fallback.png"}
                alt="avatar"
                width={64}
                height={64}
                unoptimized
              />
            </div>
            <div>
              <h1 style={{ margin: 0 }}>Hesabım</h1>
              <div style={{ opacity: 0.8 }}>{user.name}</div>
              <div style={{ opacity: 0.7, fontSize: ".95rem" }}>
                {user.email}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <a className="chip" href="/api/auth/logout">
              Çıkış Yap
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
