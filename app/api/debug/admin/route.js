// app/api/debug/admin/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    ensureAdmin();
    return NextResponse.json({ ready: true });
  } catch (e) {
    return NextResponse.json(
      { ready: false, error: String(e.message || e) },
      { status: 500 }
    );
  }
}
