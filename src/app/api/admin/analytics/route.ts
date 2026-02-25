import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { analyticsDateRangeSchema } from "@/lib/validation";
import {
  listSessionKeys,
  getSessionsByKeys,
  type AnalyticsSession,
} from "@/lib/analytics-store";
import { SCREENS } from "@/config/screens";

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const expectedToken = process.env.ADMIN_LOG_TOKEN;
  return !!(expectedToken && token === expectedToken);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function computeStats(sessions: AnalyticsSession[]) {
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.completed).length;
  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  // Total time per session = last screen end - first screen start
  const sessionDurations = sessions
    .map((s) => {
      if (s.screens.length === 0) return 0;
      const first = s.screens[0].enteredAt;
      const last = s.screens[s.screens.length - 1];
      const end = last.exitedAt || last.enteredAt + last.durationMs;
      return end - first;
    })
    .filter((d) => d > 0);

  const avgTotalTimeMs =
    sessionDurations.length > 0
      ? Math.round(
          sessionDurations.reduce((a, b) => a + b, 0) /
            sessionDurations.length
        )
      : 0;
  const medianTotalTimeMs = median(sessionDurations);

  // Per-screen stats
  const screenOrder = SCREENS.map((s) => s.id);
  const screenStatsMap: Record<
    string,
    { views: number; dropOffs: number; durations: number[] }
  > = {};

  for (const id of screenOrder) {
    screenStatsMap[id] = { views: 0, dropOffs: 0, durations: [] };
  }

  for (const session of sessions) {
    // Count views and durations
    for (const visit of session.screens) {
      const stat = screenStatsMap[visit.screenId];
      if (!stat) continue;
      stat.views += 1;
      if (visit.durationMs > 0) {
        stat.durations.push(visit.durationMs);
      }
    }

    // Drop-off: if not completed, lastScreenId is where they left
    if (!session.completed && session.lastScreenId) {
      const stat = screenStatsMap[session.lastScreenId];
      if (stat) {
        stat.dropOffs += 1;
      }
    }
  }

  const screenStats = screenOrder.map((id) => {
    const stat = screenStatsMap[id];
    return {
      screenId: id,
      views: stat.views,
      dropOffs: stat.dropOffs,
      dropOffRate:
        stat.views > 0
          ? Math.round((stat.dropOffs / stat.views) * 100)
          : 0,
      avgDurationMs:
        stat.durations.length > 0
          ? Math.round(
              stat.durations.reduce((a, b) => a + b, 0) /
                stat.durations.length
            )
          : 0,
      medianDurationMs: median(stat.durations),
    };
  });

  // Funnel
  const funnel = screenOrder.map((id, index) => ({
    screenId: id,
    screenIndex: index,
    reached: screenStatsMap[id].views,
    percentage:
      totalSessions > 0
        ? Math.round((screenStatsMap[id].views / totalSessions) * 100)
        : 0,
  }));

  return {
    summary: {
      totalSessions,
      completedSessions,
      completionRate,
      avgTotalTimeMs,
      medianTotalTimeMs,
    },
    screenStats,
    funnel,
  };
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const parsed = analyticsDateRangeSchema.safeParse({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "startDate and endDate (YYYY-MM-DD) are required" },
        { status: 400 }
      );
    }

    const { startDate, endDate } = parsed.data;

    // Collect session keys day-by-day
    const allKeys: string[] = [];
    const start = new Date(startDate + "T00:00:00Z");
    const end = new Date(endDate + "T00:00:00Z");

    for (
      const d = new Date(start);
      d <= end;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const dateStr = d.toISOString().slice(0, 10);
      const keys = await listSessionKeys(dateStr);
      allKeys.push(...keys);
    }

    const sessions = await getSessionsByKeys(allKeys);
    const stats = computeStats(sessions);

    return NextResponse.json({
      dateRange: { start: startDate, end: endDate },
      ...stats,
    });
  } catch (err) {
    console.error("[admin/analytics] GET error:", err);
    return NextResponse.json(
      { error: "Failed to compute analytics" },
      { status: 500 }
    );
  }
}
