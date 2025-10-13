// app/api/debug/admin/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin"; // ✅ ensureAdmin değil

export async function GET() {
  return NextResponse.json({ ready: Boolean(adminAuth) });
}
