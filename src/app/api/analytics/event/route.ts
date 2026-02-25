import { NextRequest, NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/validation";
import {
  saveSession,
  getSession,
  type AnalyticsSession,
} from "@/lib/analytics-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const { allowed } = await checkRateLimit(`analytics:${ip}`, 200, 3600000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = analyticsEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const data = parsed.data;
    const date = data.startedAt.slice(0, 10);

    // Try to load existing session for upsert
    const existing = await getSession(date, data.sessionId);

    const session: AnalyticsSession = {
      sessionId: data.sessionId,
      startedAt: existing?.startedAt || data.startedAt,
      updatedAt: new Date().toISOString(),
      lang: data.lang,
      deviceType: data.deviceType,
      referrer: data.referrer,
      screens: data.screens,
      lastScreenId: data.lastScreenId,
      completed: data.completed || existing?.completed || false,
    };

    // Fire and forget — don't block the response
    saveSession(session).catch(() => {});

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
