import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link, redirect, useRouter, usePathname
// Bunları next/link ve next/navigation yerine kullan
export const { Link, redirect, useRouter, usePathname, getPathname } =
  createNavigation(routing);
