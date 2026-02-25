import { getStore } from "@netlify/blobs";
import { v4 as uuidv4 } from "uuid";

const STORE_NAME = "affiliates";

export interface AffiliateRecord {
  id: string;
  name: string;
  code: string; // Case-preserved display code
  discountType: "percentage" | "fixed";
  discountValue: number;
  commissionType: "percentage" | "fixed";
  commissionValue: number;
  expiresAt: string | null;
  maxUses: number | null;
  usageCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Get an affiliate by discount code (case-insensitive) */
export async function getAffiliateByCode(
  code: string
): Promise<AffiliateRecord | null> {
  try {
    const store = getStore(STORE_NAME);
    const data = await store.get(code.toLowerCase(), { type: "json" });
    return data as AffiliateRecord;
  } catch {
    return null;
  }
}

/** Save (create or update) an affiliate */
export async function saveAffiliate(affiliate: AffiliateRecord): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.setJSON(affiliate.code.toLowerCase(), affiliate);
}

/** Delete an affiliate by code */
export async function deleteAffiliate(code: string): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.delete(code.toLowerCase());
}

/** List all affiliates, sorted by createdAt descending */
export async function listAffiliates(): Promise<AffiliateRecord[]> {
  const store = getStore(STORE_NAME);
  const result = await store.list({ prefix: "" });
  const affiliates = await Promise.all(
    result.blobs.map(async (blob) => {
      try {
        return (await store.get(blob.key, {
          type: "json",
        })) as AffiliateRecord;
      } catch {
        return null;
      }
    })
  );
  return affiliates
    .filter((a): a is AffiliateRecord => a !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/** Increment usage count for an affiliate (fire-and-forget safe) */
export async function incrementUsage(code: string): Promise<void> {
  try {
    const affiliate = await getAffiliateByCode(code);
    if (!affiliate) return;
    affiliate.usageCount += 1;
    affiliate.updatedAt = new Date().toISOString();
    await saveAffiliate(affiliate);
  } catch (err) {
    console.error("[affiliate-store] Failed to increment usage:", err);
  }
}

/** Validate a discount code — returns validity + affiliate if valid */
export async function validateDiscountCode(code: string): Promise<{
  valid: boolean;
  affiliate?: AffiliateRecord;
  reason?: string;
}> {
  const affiliate = await getAffiliateByCode(code);

  if (!affiliate) {
    return { valid: false, reason: "not_found" };
  }

  if (!affiliate.active) {
    return { valid: false, reason: "inactive" };
  }

  if (affiliate.expiresAt) {
    const expiry = new Date(affiliate.expiresAt);
    if (expiry < new Date()) {
      return { valid: false, reason: "expired" };
    }
  }

  if (affiliate.maxUses !== null && affiliate.usageCount >= affiliate.maxUses) {
    return { valid: false, reason: "max_uses_reached" };
  }

  return { valid: true, affiliate };
}

/** Calculate discount amount in NIS */
export function calculateDiscount(
  affiliate: AffiliateRecord,
  originalPrice: number
): number {
  if (affiliate.discountType === "fixed") {
    return Math.min(affiliate.discountValue, originalPrice);
  }
  // percentage
  return Math.round((originalPrice * affiliate.discountValue) / 100);
}

/** Calculate commission amount in NIS */
export function calculateCommission(
  affiliate: AffiliateRecord,
  saleAmount: number
): number {
  if (affiliate.commissionType === "fixed") {
    return affiliate.commissionValue;
  }
  // percentage
  return Math.round((saleAmount * affiliate.commissionValue) / 100);
}

/** Create a new affiliate record with defaults */
export function createAffiliateRecord(
  data: Omit<
    AffiliateRecord,
    "id" | "usageCount" | "createdAt" | "updatedAt"
  >
): AffiliateRecord {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    ...data,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}
