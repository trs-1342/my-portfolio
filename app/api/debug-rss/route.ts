import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "mn265uqj66i0";
  const results: Record<string, unknown> = {};

  // Step 1: adminDb import
  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    results.adminDb = "OK";

    // Step 2: getRssFeeds raw
    try {
      const snap = await adminDb.doc("site_config/hsounds_feeds").get();
      results.snapExists = snap.exists;
      const data = snap.data();
      results.feedsCount = Array.isArray(data?.feeds) ? data.feeds.length : 0;
      results.feedIds = Array.isArray(data?.feeds)
        ? data.feeds.map((f: Record<string, unknown>) => f.id)
        : [];
    } catch (e) {
      results.firestoreError = String(e);
    }
  } catch (e) {
    results.adminDbError = String(e);
  }

  // Step 3: getRssFeedById
  try {
    const { getRssFeedById } = await import("@/lib/hsounds");
    try {
      const feed = await getRssFeedById(id);
      results.feedFound = !!feed;
      results.feedUrl = feed?.feed_url ?? null;
    } catch (e) {
      results.getRssFeedByIdError = String(e);
    }
  } catch (e) {
    results.hsoundsImportError = String(e);
  }

  return NextResponse.json(results);
}
