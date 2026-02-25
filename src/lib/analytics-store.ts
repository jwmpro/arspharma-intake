import { getStore } from "@netlify/blobs";

const STORE_NAME = "analytics-sessions";

export interface ScreenVisit {
  screenId: string;
  enteredAt: number;        // unix ms
  exitedAt: number | null;
  durationMs: number;
}

export interface AnalyticsSession {
  sessionId: string;
  startedAt: string;        // ISO
  updatedAt: string;        // ISO
  lang: "he" | "en";
  deviceType: "mobile" | "tablet" | "desktop";
  referrer: string;         // hostname only
  screens: ScreenVisit[];   // ordered list of visited screens
  lastScreenId: string;
  completed: boolean;
}

function getBlobKey(date: string, sessionId: string): string {
  return `${date}/${sessionId}`;
}

export async function saveSession(session: AnalyticsSession): Promise<void> {
  try {
    const date = session.startedAt.slice(0, 10); // "YYYY-MM-DD"
    const store = getStore(STORE_NAME);
    const key = getBlobKey(date, session.sessionId);
    await store.setJSON(key, session);
  } catch (err) {
    // Fire-and-forget: analytics failure must never break anything
    console.error("[analytics-store] Failed to save session:", err);
  }
}

export async function getSession(
  date: string,
  sessionId: string
): Promise<AnalyticsSession | null> {
  try {
    const store = getStore(STORE_NAME);
    const key = getBlobKey(date, sessionId);
    return (await store.get(key, { type: "json" })) as AnalyticsSession;
  } catch {
    return null;
  }
}

export async function listSessionKeys(datePrefix: string): Promise<string[]> {
  const store = getStore(STORE_NAME);
  const result = await store.list({ prefix: datePrefix });
  return result.blobs.map((b) => b.key);
}

export async function getSessionsByKeys(
  keys: string[]
): Promise<AnalyticsSession[]> {
  const store = getStore(STORE_NAME);
  const sessions = await Promise.all(
    keys.map(async (key) => {
      try {
        return (await store.get(key, { type: "json" })) as AnalyticsSession;
      } catch {
        return null;
      }
    })
  );
  return sessions.filter((s): s is AnalyticsSession => s !== null);
}
