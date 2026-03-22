"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Korunan sayfalarda kullanılır.
 * 1. Giriş yapılmamışsa → /login
 * 2. Username kurulmamışsa → /setup-username
 * 3. Hesap engellenmişse → /blocked?banned=1
 * 4. Sayfa engellenmiş ise → /blocked?path=...
 *
 * requireLogin=false ise giriş zorunlu değil; sadece ban/block kontrolü yapılır.
 */
export function useAccessGuard(options?: { requireLogin?: boolean }) {
  const requireLogin = options?.requireLogin ?? true;
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (requireLogin) router.replace("/login");
      return;
    }

    if (!profile) {
      router.replace("/setup-username");
      return;
    }

    if (profile.status === "banned") {
      const pages = (profile.blockedPages ?? []).join(",");
      router.replace(`/blocked?banned=1&pages=${encodeURIComponent(pages)}`);
      return;
    }

    if (profile.blockedPages?.includes(pathname)) {
      const pages = (profile.blockedPages ?? []).join(",");
      router.replace(`/blocked?path=${encodeURIComponent(pathname)}&pages=${encodeURIComponent(pages)}`);
    }
  }, [loading, user, profile, pathname, router, requireLogin]);

  const ready = !loading && !!user && !!profile
    && profile.status !== "banned"
    && !profile.blockedPages?.includes(pathname);

  return { user, profile, loading, ready };
}
