import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateDiscountSchema } from "@/lib/validation";
import { validateDiscountCode } from "@/lib/affiliate-store";

const ONE_HOUR = 60 * 60 * 1000;
const IP_MAX = 20; // 20 validation attempts per IP per hour

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // Rate limit to prevent code enumeration
  const ipCheck = await checkRateLimit(
    `ip:${ip}:validate-discount`,
    IP_MAX,
    ONE_HOUR
  );
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const parsed = validateDiscountSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { code } = parsed.data;
  const result = await validateDiscountCode(code);

  if (!result.valid || !result.affiliate) {
    // Generic message — don't reveal whether code exists vs expired vs maxed
    return NextResponse.json({
      valid: false,
      message: "Invalid or expired discount code",
    });
  }

  const affiliate = result.affiliate;
  return NextResponse.json({
    valid: true,
    discountType: affiliate.discountType,
    discountValue: affiliate.discountValue,
  });
}
