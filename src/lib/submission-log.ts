import { getStore } from "@netlify/blobs";
import { v4 as uuidv4 } from "uuid";

const STORE_NAME = "submission-logs";

export interface SubmissionLogEntry {
  id: string;
  masterId: string;
  timestamp: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  medicationType: string;
  planDuration: number;
  productId: string;
  status:
    | "success"
    | "capture_failed"
    | "beluga_error"
    | "validation_error"
    | "network_error"
    | "internal_error";
  httpStatus: number | null;
  belugaResponse: unknown;
  errorMessage: string | null;
  paymentIntentId: string;
  visitType: string;
  durationMs: number;
  affiliateCode: string;
  discountAmount: number;
  patientCity: string;
  paymentAmount: number;
}

type NewLogEntry = Omit<SubmissionLogEntry, "id" | "timestamp">;

function getBlobKey(timestamp: string, masterId: string): string {
  const date = timestamp.slice(0, 10); // "2026-02-22"
  const ms = new Date(timestamp).getTime();
  return `${date}/${ms}_${masterId}`;
}

export async function saveLog(entry: NewLogEntry): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const full: SubmissionLogEntry = {
      ...entry,
      id: uuidv4(),
      timestamp,
    };
    const store = getStore(STORE_NAME);
    const key = getBlobKey(timestamp, entry.masterId);
    await store.setJSON(key, full);
    console.log(`[submission-log] Saved: ${key} (${entry.status})`);
  } catch (err) {
    // CRITICAL: logging failure must never propagate to the user
    console.error("[submission-log] Failed to save log entry:", err);
  }
}

export async function listLogs(options?: {
  datePrefix?: string;
  limit?: number;
}): Promise<{ keys: string[] }> {
  const store = getStore(STORE_NAME);
  const result = await store.list({
    prefix: options?.datePrefix || "",
  });
  let keys = result.blobs.map((b) => b.key);
  // Most recent first
  keys.reverse();
  if (options?.limit) {
    keys = keys.slice(0, options.limit);
  }
  return { keys };
}

export async function getLog(
  key: string
): Promise<SubmissionLogEntry | null> {
  try {
    const store = getStore(STORE_NAME);
    return (await store.get(key, { type: "json" })) as SubmissionLogEntry;
  } catch {
    return null;
  }
}

export async function getLogsByKeys(
  keys: string[]
): Promise<SubmissionLogEntry[]> {
  const store = getStore(STORE_NAME);
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        return (await store.get(key, {
          type: "json",
        })) as SubmissionLogEntry;
      } catch {
        return null;
      }
    })
  );
  return entries.filter((e): e is SubmissionLogEntry => e !== null);
}
