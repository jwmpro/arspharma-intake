/**
 * Client-side analytics tracking module.
 * Accumulates screen visit data in memory and sends session summaries
 * via navigator.sendBeacon() to /api/analytics/event.
 *
 * No PII is collected — only anonymous session IDs, screen IDs, and timestamps.
 */

interface ScreenVisit {
  screenId: string;
  enteredAt: number;
  exitedAt: number | null;
  durationMs: number;
}

interface SessionData {
  sessionId: string;
  lang: "he" | "en";
  deviceType: "mobile" | "tablet" | "desktop";
  referrer: string;
  startedAt: string;
  screens: ScreenVisit[];
  lastScreenId: string;
  completed: boolean;
}

let session: SessionData | null = null;

function generateId(): string {
  // Simple random ID — no crypto dependency needed for anonymous analytics
  return (
    Math.random().toString(36).slice(2) +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getReferrerHost(): string {
  if (typeof document === "undefined") return "";
  try {
    const ref = document.referrer;
    if (!ref) return "";
    return new URL(ref).hostname;
  } catch {
    return "";
  }
}

export function initSession(lang: "he" | "en"): void {
  if (typeof window === "undefined") return;

  // Reuse session ID within the same browser tab
  let sessionId = sessionStorage.getItem("analytics_sid");
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem("analytics_sid", sessionId);
  }

  // Only init once per page load
  if (session && session.sessionId === sessionId) return;

  session = {
    sessionId,
    lang,
    deviceType: getDeviceType(),
    referrer: getReferrerHost(),
    startedAt: new Date().toISOString(),
    screens: [],
    lastScreenId: "",
    completed: false,
  };
}

export function trackScreenEnter(screenId: string): void {
  if (!session) return;

  // Close previous screen if still open
  const prev = session.screens[session.screens.length - 1];
  if (prev && prev.exitedAt === null) {
    prev.exitedAt = Date.now();
    prev.durationMs = prev.exitedAt - prev.enteredAt;
  }

  // Add new screen visit
  session.screens.push({
    screenId,
    enteredAt: Date.now(),
    exitedAt: null,
    durationMs: 0,
  });

  session.lastScreenId = screenId;
}

export function trackScreenLeave(screenId: string): void {
  if (!session) return;

  // Find the most recent visit to this screen and close it
  for (let i = session.screens.length - 1; i >= 0; i--) {
    const visit = session.screens[i];
    if (visit.screenId === screenId && visit.exitedAt === null) {
      visit.exitedAt = Date.now();
      visit.durationMs = visit.exitedAt - visit.enteredAt;
      break;
    }
  }
}

export function markCompleted(): void {
  if (!session) return;
  session.completed = true;
}

export function sendBeacon(): void {
  if (!session) return;

  const payload = JSON.stringify(session);
  const url = "/api/analytics/event";

  // navigator.sendBeacon is non-blocking and works during page unload
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    const sent = navigator.sendBeacon(url, blob);
    if (sent) return;
  }

  // Fallback: fetch with keepalive
  if (typeof fetch !== "undefined") {
    fetch(url, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {}); // Fire and forget
  }
}
