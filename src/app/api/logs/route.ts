import { NextRequest, NextResponse } from "next/server";
import { listLogs, getLogsByKeys } from "@/lib/submission-log";

export async function GET(req: NextRequest) {
  // Auth via HTTP-only cookie or header only — never URL params
  const token =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("x-admin-token");
  const expectedToken = process.env.ADMIN_LOG_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = req.nextUrl.searchParams.get("date") || "";
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  try {
    const { keys } = await listLogs({ datePrefix: date, limit });
    const entries = await getLogsByKeys(keys);

    return NextResponse.json({
      count: entries.length,
      entries,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
