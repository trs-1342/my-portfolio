"use client";

import { useAuth } from "@/context/AuthContext";
import BlockedPage from "./BlockedPage";

interface Props {
  path: string;
  children: React.ReactNode;
}

export default function BlockedGuard({ path, children }: Props) {
  const { profile, loading } = useAuth();

  if (loading || !profile) return <>{children}</>;

  const fullyBanned = profile.status === "banned";
  const pageBanned  = profile.blockedPages?.includes(path) ?? false;

  if (fullyBanned || pageBanned) {
    return <BlockedPage profile={profile} currentPath={path} />;
  }

  return <>{children}</>;
}
