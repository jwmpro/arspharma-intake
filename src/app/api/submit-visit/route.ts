import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SCREENS } from "@/config/screens";
import { getProductOption } from "@/config/medications";
import { saveLog } from "@/lib/submission-log";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { submitVisitSchema, redactPhone, redactEmail } from "@/lib/validation";
import { incrementUsage } from "@/lib/affiliate-store";

const ONE_HOUR = 60 * 60 * 1000;
const IP_MAX = 5; // 5 submissions per IP per hour

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion });
}

function generateMasterId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return `gever_${ts}_${rand}`;
}

export async function POST(req: NextRequest) {
  let masterId = "";
  let patientName = "";
  let patientEmail = "";
  let patientPhone = "";
  let medicationType = "";
  let planDuration = 0;
  let productId = "";
  let visitType = "";
  let paymentIntentId = "";
  let affiliateCode = "";
  let discountAmount = 0;
  let patientCity = "";
  let paymentAmount = 0;

  try {
    const ip = getClientIp(req.headers);

    // --- Rate limit ---
    const ipCheck = await checkRateLimit(`ip:${ip}:submit-visit`, IP_MAX, ONE_HOUR);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // --- Validate input with Zod ---
    const rawBody = await req.json();
    const parsed = submitVisitSchema.safeParse(rawBody);
    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      console.error("[submit-visit] Validation failed:", JSON.stringify(parsed.error.issues));
      // Temporary debug: return field-level errors to pinpoint Apple Pay issue
      return NextResponse.json({ error: "Invalid request", _debug: fieldErrors }, { status: 400 });
    }
    const { formData } = parsed.data;
    paymentIntentId = parsed.data.paymentIntentId;

    const apiUrl = process.env.BELUGA_API_URL || "https://api-staging.belugahealth.com";
    const apiKey = process.env.BELUGA_API_KEY;
    const pharmacyId = process.env.BELUGA_PHARMACY_ID;

    // Capture patient details for logging
    patientName = `${formData.firstName} ${formData.lastName}`.trim();
    patientEmail = formData.email;
    patientPhone = formData.phone;
    patientCity = formData.city || "";

    if (!apiKey || !pharmacyId) {
      await saveLog({
        masterId: "N/A",
        patientName, patientEmail, patientPhone,
        medicationType: "neffy", planDuration: 12, productId: "N/A",
        status: "validation_error",
        httpStatus: null,
        belugaResponse: null,
        errorMessage: "API not configured",
        paymentIntentId, visitType: "unknown", durationMs: 0,
        affiliateCode: "", discountAmount: 0, patientCity, paymentAmount: 0,
      });
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }

    // --- Validate payment intent ownership & read affiliate metadata ---
    if (paymentIntentId) {
      try {
        const stripe = getStripe();
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        const piEmail = pi.metadata?.customer_email;
        if (piEmail && formData.email && piEmail.toLowerCase() !== formData.email.toLowerCase()) {
          console.warn(`[submit-visit] Payment intent email mismatch for ${redactEmail(formData.email)}`);
          return NextResponse.json({ error: "Invalid request", _debug: ["email_mismatch"] }, { status: 400 });
        }
        // Read affiliate data from PaymentIntent metadata
        affiliateCode = pi.metadata?.affiliateCode || "";
        discountAmount = parseFloat(pi.metadata?.discountAmount || "0");
      } catch {
        console.error("[submit-visit] Failed to verify payment intent ownership");
        return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
      }
    }

    // Determine visit type — Neffy form
    visitType = "neffyIntake";

    // Get selected medication using selectedPlanId
    const selectedPlanId = (rawBody?.selectedPlanId || formData.selectedPlanId || "neffy_single") as string;
    const product = getProductOption(selectedPlanId);
    if (!product) {
      productId = "invalid";
      await saveLog({
        masterId: "N/A",
        patientName, patientEmail, patientPhone,
        medicationType, planDuration, productId,
        status: "validation_error",
        httpStatus: null,
        belugaResponse: null,
        errorMessage: "Invalid product selection",
        paymentIntentId, visitType, durationMs: 0,
        affiliateCode: "", discountAmount: 0, patientCity, paymentAmount: 0,
      });
      return NextResponse.json({ error: "Invalid product selection" }, { status: 400 });
    }
    productId = product.id;
    paymentAmount = product.totalPrice - discountAmount;

    // Build Q/A pairs from questionnaire answers
    const qaPairs: Record<string, string> = {};
    let qIndex = 1;
    for (const screen of SCREENS) {
      if (screen.questionKey && formData.answers?.[screen.id]) {
        qaPairs[`Q${qIndex}`] = screen.questionKey;
        qaPairs[`A${qIndex}`] = formData.answers[screen.id];
        qIndex++;
      }
    }

    // Build the Beluga payload per createNoPay API spec
    masterId = generateMasterId();
    const payload = {
      formObj: {
        consentsSigned: true,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: "IL",
        zip: "0000000",
        sex: formData.sex,
        selfReportedMeds: formData.selfReportedMeds,
        allergies: formData.allergies,
        medicalConditions: formData.medicalConditions,
        patientPreference: [
          {
            name: product.medication.name,
            strength: product.medication.strength,
            quantity: product.medication.quantity,
            refills: product.medication.refills,
            medId: product.medication.medId,
          },
        ],
        ...qaPairs,
      },
      patientVerified: true,
      verificationId: formData.idNumber || "NA",
      pharmacyId,
      visitId: masterId,
      company: "geverHealth",
      visitType,
    };

    // Validate no empty fields (Beluga API requirement)
    const formObj = payload.formObj as Record<string, unknown>;
    for (const [key, value] of Object.entries(formObj)) {
      if (key.startsWith("Q") || key.startsWith("A")) continue;
      if (key === "patientPreference") continue;
      if (value === "" || value === null || value === undefined) {
        await saveLog({
          masterId,
          patientName, patientEmail, patientPhone,
          medicationType, planDuration, productId,
          status: "validation_error",
          httpStatus: null,
          belugaResponse: null,
          errorMessage: `Missing required field: ${key}`,
          paymentIntentId, visitType, durationMs: 0,
          affiliateCode: "", discountAmount: 0, patientCity, paymentAmount: 0,
        });
        // Don't expose field name to client
        return NextResponse.json(
          { error: "Missing required information" },
          { status: 400 }
        );
      }
    }

    // Submit to Beluga (timed)
    const startTime = Date.now();
    const response = await fetch(`${apiUrl}/visit/createNoPay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const durationMs = Date.now() - startTime;

    const result = await response.json();

    if (response.ok && result.status === 200) {
      // Beluga succeeded — capture the authorized payment
      if (paymentIntentId) {
        try {
          const stripe = getStripe();
          await stripe.paymentIntents.capture(paymentIntentId);
        } catch (captureErr) {
          // Treat capture failure as actual error — don't silently succeed
          console.error("[submit-visit] Payment capture failed for visit:", masterId);
          await saveLog({
            masterId,
            patientName, patientEmail, patientPhone,
            medicationType, planDuration, productId,
            status: "capture_failed",
            httpStatus: response.status,
            belugaResponse: result,
            errorMessage: captureErr instanceof Error ? captureErr.message : "Payment capture failed",
            paymentIntentId, visitType, durationMs,
            affiliateCode, discountAmount, patientCity, paymentAmount,
          });
          return NextResponse.json(
            {
              success: false,
              error: "Payment processing failed. Your visit was submitted — please contact support.",
              visitId: result.data?.visitId || result.data,
              masterId,
            },
            { status: 502 }
          );
        }
      }

      // Increment affiliate usage count on successful sale
      if (affiliateCode) {
        try {
          await incrementUsage(affiliateCode);
        } catch (err) {
          // Non-critical: don't fail submission if affiliate tracking fails
          console.error("[submit-visit] Affiliate usage tracking error:", err);
        }
      }

      await saveLog({
        masterId,
        patientName, patientEmail, patientPhone,
        medicationType, planDuration, productId,
        status: "success",
        httpStatus: response.status,
        belugaResponse: result,
        errorMessage: null,
        paymentIntentId, visitType, durationMs,
        affiliateCode, discountAmount, patientCity, paymentAmount,
      });
      return NextResponse.json({
        success: true,
        visitId: result.data?.visitId || result.data,
        masterId,
      });
    } else {
      // Beluga failed — cancel the authorized payment so user is not charged
      if (paymentIntentId) {
        try {
          const stripe = getStripe();
          await stripe.paymentIntents.cancel(paymentIntentId);
        } catch {
          console.error("[submit-visit] Payment cancel failed for visit:", masterId);
        }
      }

      // Log with redacted PII — don't expose Beluga internals to client
      console.error(`[submit-visit] Beluga error for ${redactEmail(patientEmail)}, visit: ${masterId}`);
      await saveLog({
        masterId,
        patientName, patientEmail, patientPhone,
        medicationType, planDuration, productId,
        status: "beluga_error",
        httpStatus: response.status,
        belugaResponse: result,
        errorMessage: result.error || "Visit submission failed",
        paymentIntentId, visitType, durationMs,
        affiliateCode, discountAmount, patientCity, paymentAmount,
      });
      return NextResponse.json(
        { success: false, error: "Visit submission failed" },
        { status: 502 }
      );
    }
  } catch (error) {
    // Redacted error logging — no PII in console
    console.error(`[submit-visit] Unexpected error for visit: ${masterId || "unknown"}`);

    // Cancel payment authorization on unexpected errors
    if (paymentIntentId) {
      try {
        const stripe = getStripe();
        await stripe.paymentIntents.cancel(paymentIntentId);
      } catch {
        console.error("[submit-visit] Payment cancel failed");
      }
    }

    await saveLog({
      masterId: masterId || "N/A",
      patientName, patientEmail, patientPhone,
      medicationType, planDuration, productId: productId || "N/A",
      status: error instanceof TypeError ? "network_error" : "internal_error",
      httpStatus: null,
      belugaResponse: null,
      errorMessage: error instanceof Error ? error.message : String(error),
      paymentIntentId, visitType: visitType || "unknown", durationMs: 0,
      affiliateCode, discountAmount, patientCity, paymentAmount,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
