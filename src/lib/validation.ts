import { z } from "zod";

/** Israeli phone in E.164: +972 followed by 9 digits starting with 5 */
export const israeliPhoneSchema = z
  .string()
  .regex(/^\+972[5][0-9]{8}$/, "Invalid Israeli phone number");

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(254);

/** send-otp request body */
export const sendOtpSchema = z.object({
  phone: israeliPhoneSchema,
  turnstileToken: z.string().optional(),
});

/** verify-otp request body */
export const verifyOtpSchema = z.object({
  phone: israeliPhoneSchema,
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

/** create-payment-intent request body */
export const createPaymentIntentSchema = z.object({
  amount: z.number().positive().max(100000),
  currency: z.string().length(3).default("usd"),
  email: emailSchema.optional(),
  name: z.string().max(200).optional(),
  discountCode: z.string().max(50).optional(),
  selectedPlanId: z.string().max(50).optional(),
});

/** submit-visit request body */
export const submitVisitSchema = z.object({
  paymentIntentId: z.string().max(200).optional().default(""),
  selectedPlanId: z.string().max(50).optional(),
  formData: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    dob: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "DOB must be MM/DD/YYYY"),
    phone: z.string().max(20),
    email: emailSchema,
    address: z.string().min(1).max(500),
    city: z.string().min(1).max(100),
    state: z.string().max(50).optional().default(""),
    zip: z.string().max(10).optional().default(""),
    sex: z.string().max(20).optional().default(""),
    selfReportedMeds: z.string().max(2000).optional().default("None"),
    allergies: z.string().max(2000).optional().default("None"),
    medicalConditions: z.string().max(2000).optional().default("None"),
    idNumber: z.string().max(50).optional().default(""),
    selectedPlanId: z.string().max(50).optional().default("neffy_single"),
    // Questionnaire answers — dynamic keys
    answers: z.record(z.string(), z.string().max(1000)).optional().default({}),
    // Multi-select arrays
    conditionsChecklist: z.array(z.string()).optional().default([]),
    allergenTypes: z.array(z.string()).optional().default([]),
  }),
});

/** Redact a phone number for logging: +972*****1234 */
export function redactPhone(phone: string): string {
  if (phone.length <= 4) return "****";
  return phone.slice(0, 4) + "*****" + phone.slice(-4);
}

/** Redact an email for logging: j***@example.com */
export function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return local[0] + "***@" + domain;
}

/** validate-discount request body */
export const validateDiscountSchema = z.object({
  code: z.string().min(1).max(50).trim(),
});

/** Admin affiliate create/update request body */
export const affiliateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(2).max(50).regex(/^[A-Za-z0-9_-]+$/, "Code must be alphanumeric"),
  discountType: z.enum(["percentage", "fixed"]).default("fixed"),
  discountValue: z.number().positive().max(100000),
  commissionType: z.enum(["percentage", "fixed"]).default("percentage"),
  commissionValue: z.number().nonnegative().max(100000),
  expiresAt: z.string().nullable().optional().default(null),
  maxUses: z.number().int().positive().nullable().optional().default(null),
  active: z.boolean().default(true),
});

/** Admin affiliate report query params */
export const affiliateReportSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/** Analytics event payload from client beacon */
export const analyticsEventSchema = z.object({
  sessionId: z.string().min(1).max(100),
  lang: z.enum(["he", "en"]),
  deviceType: z.enum(["mobile", "tablet", "desktop"]),
  referrer: z.string().max(200).default(""),
  startedAt: z.string().max(30),
  lastScreenId: z.string().max(50),
  completed: z.boolean().default(false),
  screens: z
    .array(
      z.object({
        screenId: z.string().max(50),
        enteredAt: z.number().nonnegative(),
        exitedAt: z.number().nullable(),
        durationMs: z.number().nonnegative(),
      })
    )
    .max(50), // 32 screens + padding for back-navigation
});

/** Analytics dashboard date range query */
export const analyticsDateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/** Max request body size in bytes (100 KB) */
export const MAX_BODY_SIZE = 100 * 1024;
