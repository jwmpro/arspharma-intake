import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyOtpSchema, redactPhone } from "@/lib/validation";

const FIFTEEN_MIN = 15 * 60 * 1000;
const IP_MAX = 10;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    const ipCheck = await checkRateLimit(`ip:${ip}:verify-otp`, IP_MAX, FIFTEEN_MIN);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    // --- Validate input with Zod ---
    const parsed = verifyOtpSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }
    const { phone, code } = parsed.data;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
      return NextResponse.json({ success: false, error: "SMS service not configured" }, { status: 500 });
    }

    const twilioUrl = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, Code: code }),
    });

    const result = await response.json();

    if (response.ok && result.status === "approved") {
      console.log(`[verify-otp] Approved for ${redactPhone(phone)}`);
      return NextResponse.json({ success: true });
    } else {
      console.warn(`[verify-otp] Failed for ${redactPhone(phone)}: ${result.status || "unknown"}`);
      // Return generic error — no Twilio internals leaked to client
      return NextResponse.json(
        { success: false, error: "Invalid verification code" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
