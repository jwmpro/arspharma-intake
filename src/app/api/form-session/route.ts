import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { saveFormSession, getFormSession } from "@/lib/form-session-store";

const ONE_HOUR = 60 * 60 * 1000;
const IP_MAX = 20; // generous limit — called once per payment attempt

/**
 * POST /api/form-session
 * Save form data server-side before Apple Pay / 3DS redirect.
 * Body: { paymentIntentId, formData, lang }
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const ipCheck = await checkRateLimit(`ip:${ip}:form-session`, IP_MAX, ONE_HOUR);
    if (!ipCheck.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const { paymentIntentId, formData, lang } = body;

    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }
    if (!formData || typeof formData !== "object") {
      return NextResponse.json({ error: "Missing formData" }, { status: 400 });
    }

    await saveFormSession(paymentIntentId, formData, lang || "he");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[form-session] POST error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

/**
 * GET /api/form-session?piId=pi_xxx
 * Retrieve saved form data after redirect. Data is deleted after read.
 */
export async function GET(req: NextRequest) {
  try {
    const piId = req.nextUrl.searchParams.get("piId");
    if (!piId) {
      return NextResponse.json({ error: "Missing piId" }, { status: 400 });
    }

    const session = await getFormSession(piId);
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error("[form-session] GET error:", err);
    return NextResponse.json({ error: "Failed to retrieve" }, { status: 500 });
  }
}
