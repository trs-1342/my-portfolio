// app/api/debug/token/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { idToken } = await req.json();
  const body = idToken?.split(".")[1];
  const claims = body
    ? JSON.parse(Buffer.from(body, "base64").toString("utf8"))
    : null;
  return NextResponse.json({
    envProject: process.env.F_PROJECT_ID,
    tokenAud: claims?.aud,
    tokenIss: claims?.iss, // https://securetoken.google.com/<projectId>
  });
}
