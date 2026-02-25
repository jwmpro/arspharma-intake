/**
 * Hybrid rate limiter: fast in-memory checks backed by Netlify Blobs
 * for persistence across serverless cold starts.
 */

import { getStore } from "@netlify/blobs";

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix ms
}

const memStore = new Map<string, RateLimitEntry>();
const BLOB_STORE_NAME = "rate-limits";
const loadedFromBlob = new Set<string>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  memStore.forEach((entry, key) => {
    if (now > entry.resetAt) {
      memStore.delete(key);
      loadedFromBlob.delete(key);
    }
  });
}

/** Persist rate limit entry to Netlify Blobs (fire-and-forget). */
function persistEntry(key: string, entry: RateLimitEntry) {
  try {
    const store = getStore(BLOB_STORE_NAME);
    store.setJSON(key.replace(/[^a-zA-Z0-9_-]/g, "_"), entry).catch(() => {});
  } catch {
    // Blob store may not be available locally
  }
}

/** Try to restore rate limit state from blobs on cold start. */
async function restoreEntry(key: string): Promise<RateLimitEntry | null> {
  try {
    const store = getStore(BLOB_STORE_NAME);
    const blobKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
    const entry = (await store.get(blobKey, { type: "json" })) as RateLimitEntry | null;
    if (entry && Date.now() <= entry.resetAt) {
      return entry;
    }
  } catch {
    // Blob store may not be available locally
  }
  return null;
}

/**
 * Check if a request is within rate limits.
 * Uses in-memory store backed by Netlify Blobs for cold-start persistence.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  cleanup();

  const now = Date.now();
  let entry = memStore.get(key);

  // On cold start, try to restore from blobs
  if (!entry && !loadedFromBlob.has(key)) {
    loadedFromBlob.add(key);
    const restored = await restoreEntry(key);
    if (restored) {
      memStore.set(key, restored);
      entry = restored;
    }
  }

  if (!entry || now > entry.resetAt) {
    const newEntry = { count: 1, resetAt: now + windowMs };
    memStore.set(key, newEntry);
    persistEntry(key, newEntry);
    return { allowed: true, remaining: max - 1 };
  }

  entry.count += 1;
  persistEntry(key, entry);

  if (entry.count > max) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: max - entry.count };
}

/**
 * Extract client IP from Next.js request headers.
 * On Netlify, ONLY trust x-nf-client-connection-ip (set by Netlify edge,
 * not user-controllable). Other headers are dev-only fallbacks.
 */
export function getClientIp(headers: Headers): string {
  const netlifyIp = headers.get("x-nf-client-connection-ip");
  if (netlifyIp) return netlifyIp;

  if (process.env.NODE_ENV === "development") {
    return (
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip") ||
      "127.0.0.1"
    );
  }

  return "unknown";
}
