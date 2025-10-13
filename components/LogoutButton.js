// components/LogoutButton.js
"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const doLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  };
  return (
    <button className="btn" onClick={doLogout} type="button">
      Çıkış Yap
    </button>
  );
}
