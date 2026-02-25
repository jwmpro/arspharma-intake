import { getStore } from "@netlify/blobs";

/**
 * Temporary server-side form data storage keyed by PaymentIntent ID.
 * Used to survive Apple Pay / 3DS redirects when sessionStorage is blocked
 * (e.g. Safari private browsing).
 *
 * Data is deleted after retrieval (one-time read).
 */
const STORE_NAME = "form-sessions";

export async function saveFormSession(
  paymentIntentId: string,
  formData: Record<string, unknown>,
  lang: string
): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.setJSON(paymentIntentId, {
    formData,
    lang,
    createdAt: new Date().toISOString(),
  });
}

export async function getFormSession(
  paymentIntentId: string
): Promise<{ formData: Record<string, unknown>; lang: string } | null> {
  try {
    const store = getStore(STORE_NAME);
    const data = await store.get(paymentIntentId, { type: "json" }) as {
      formData: Record<string, unknown>;
      lang: string;
    } | null;

    if (data) {
      // One-time read: delete after retrieval to avoid PII lingering
      store.delete(paymentIntentId).catch(() => {});
    }

    return data;
  } catch {
    return null;
  }
}
