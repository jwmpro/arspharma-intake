import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createPaymentIntentSchema } from "@/lib/validation";
import { getProductOption } from "@/config/medications";
import { validateDiscountCode, calculateDiscount } from "@/lib/affiliate-store";

const ONE_HOUR = 60 * 60 * 1000;
const IP_MAX = 10; // 10 payment intents per IP per hour

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // --- Rate limit ---
    const ipCheck = await checkRateLimit(`ip:${ip}:create-pi`, IP_MAX, ONE_HOUR);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // --- Validate input with Zod ---
    const parsed = createPaymentIntentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { amount, currency, email, name, discountCode, selectedPlanId } = parsed.data;

    let finalAmount = amount;
    let appliedDiscount = 0;
    let affiliateCode = "";

    // --- If discount code provided, validate and compute server-side ---
    if (discountCode) {
      if (!selectedPlanId) {
        return NextResponse.json(
          { error: "Product selection required with discount code" },
          { status: 400 }
        );
      }

      const product = getProductOption(selectedPlanId);
      if (!product) {
        return NextResponse.json({ error: "Invalid product" }, { status: 400 });
      }

      const validation = await validateDiscountCode(discountCode);
      if (!validation.valid || !validation.affiliate) {
        return NextResponse.json(
          { error: "Invalid or expired discount code" },
          { status: 400 }
        );
      }

      const affiliate = validation.affiliate;
      appliedDiscount = calculateDiscount(affiliate, product.totalPrice);
      finalAmount = product.totalPrice - appliedDiscount;
      affiliateCode = discountCode.toLowerCase();

      // Sanity: final amount must be positive
      if (finalAmount <= 0) {
        return NextResponse.json({ error: "Invalid discount" }, { status: 400 });
      }
    }

    const stripe = getStripe();
    const amountInAgorot = Math.round(finalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInAgorot,
      currency,
      capture_method: "manual",
      automatic_payment_methods: { enabled: true },
      metadata: {
        customer_email: email || "",
        customer_name: name || "",
        source: "gever-health-intake",
        affiliateCode,
        originalAmount: String(amount),
        discountAmount: String(appliedDiscount),
      },
      receipt_email: email || undefined,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
