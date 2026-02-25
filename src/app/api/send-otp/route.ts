import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendOtpSchema, redactPhone } from "@/lib/validation";

const FIFTEEN_MIN = 15 * 60 * 1000;
const IP_MAX = 5;
const PHONE_MAX = 3;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    const ipCheck = await checkRateLimit(`ip:${ip}:send-otp`, IP_MAX, FIFTEEN_MIN);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // --- Validate input with Zod (includes Israeli phone format) ---
    const parsed = sendOtpSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }
    const { phone, turnstileToken } = parsed.data;

    const phoneCheck = await checkRateLimit(`phone:${phone}:send-otp`, PHONE_MAX, FIFTEEN_MIN);
    if (!phoneCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many codes sent to this number. Please try again later." },
        { status: 429 }
      );
    }

    // --- Cloudflare Turnstile (REQUIRED when secret is configured) ---
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json(
          { success: false, error: "CAPTCHA verification required" },
          { status: 403 }
        );
      }
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
          remoteip: ip,
        }),
      });
      const verifyResult = await verifyRes.json();
      if (!verifyResult.success) {
        return NextResponse.json(
          { success: false, error: "CAPTCHA verification failed" },
          { status: 403 }
        );
      }
    }

    // --- Send OTP via Twilio ---
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
      return NextResponse.json({ success: false, error: "SMS service not configured" }, { status: 500 });
    }

    const twilioUrl = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, Channel: "sms" }),
    });

    const result = await response.json();

    if (response.ok && result.status === "pending") {
      console.log(`[send-otp] Sent to ${redactPhone(phone)}`);
      return NextResponse.json({ success: true });
    } else {
      console.warn(`[send-otp] Failed for ${redactPhone(phone)}`);
      return NextResponse.json(
        { success: false, error: "Failed to send verification code" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
