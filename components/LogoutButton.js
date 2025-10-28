'use client'

export default function LogoutButton() {
  return (
    <button
      className="btn btn-danger"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      Çıkış yap
    </button>
  );
}