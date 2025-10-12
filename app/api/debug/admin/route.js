// app/api/debug/admin/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/firebaseAdmin";

export async function GET() {
  const ready = Boolean(ensureAdmin());
  return NextResponse.json({
    ready,
    hasProjectId: Boolean(process.env.F_PROJECT_ID),
    hasClientEmail: Boolean(process.env.F_CLIENT_EMAIL),
    hasPrivateKey: Boolean(process.env.F_PRIVATE_KEY),
    env: process.env.VERCEL_ENV || process.env.NODE_ENV,
  });
}
