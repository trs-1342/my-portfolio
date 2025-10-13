// app/api/auth/logout/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { clearSessionAndRevoke } from "@/lib/auth-helpers";

export async function POST() {
  await clearSessionAndRevoke();
  return NextResponse.json({ ok: true });
}
