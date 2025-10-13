// app/api/auth/login/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createSessionFromIdToken } from "@/lib/auth-helpers";

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken)
      return NextResponse.json(
        { ok: false, error: "missing_id_token" },
        { status: 400 }
      );
    await createSessionFromIdToken(idToken);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 400 }
    );
  }
}
