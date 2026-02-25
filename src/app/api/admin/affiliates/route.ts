import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { affiliateSchema } from "@/lib/validation";
import {
  listAffiliates,
  getAffiliateByCode,
  saveAffiliate,
  deleteAffiliate,
  createAffiliateRecord,
  AffiliateRecord,
} from "@/lib/affiliate-store";

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const expectedToken = process.env.ADMIN_LOG_TOKEN;
  return !!(expectedToken && token === expectedToken);
}

/** GET — List all affiliates */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const affiliates = await listAffiliates();
    return NextResponse.json({ affiliates });
  } catch (err) {
    console.error("[admin/affiliates] GET error:", err);
    return NextResponse.json(
      { error: "Failed to load affiliates" },
      { status: 500 }
    );
  }
}

/** POST — Create a new affiliate */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = affiliateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existing = await getAffiliateByCode(parsed.data.code);
    if (existing) {
      return NextResponse.json(
        { error: "An affiliate with this code already exists" },
        { status: 409 }
      );
    }

    const affiliate = createAffiliateRecord({
      name: parsed.data.name,
      code: parsed.data.code,
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      commissionType: parsed.data.commissionType,
      commissionValue: parsed.data.commissionValue,
      expiresAt: parsed.data.expiresAt ?? null,
      maxUses: parsed.data.maxUses ?? null,
      active: parsed.data.active,
    });

    await saveAffiliate(affiliate);
    return NextResponse.json({ affiliate }, { status: 201 });
  } catch (err) {
    console.error("[admin/affiliates] POST error:", err);
    return NextResponse.json(
      { error: "Failed to create affiliate" },
      { status: 500 }
    );
  }
}

/** PUT — Update an existing affiliate */
export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { originalCode, ...data } = body;

    if (!originalCode || typeof originalCode !== "string") {
      return NextResponse.json(
        { error: "originalCode is required" },
        { status: 400 }
      );
    }

    const parsed = affiliateSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await getAffiliateByCode(originalCode);
    if (!existing) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // If code is being renamed, check new code doesn't already exist
    const newCodeLower = parsed.data.code.toLowerCase();
    const oldCodeLower = originalCode.toLowerCase();
    if (newCodeLower !== oldCodeLower) {
      const conflict = await getAffiliateByCode(parsed.data.code);
      if (conflict) {
        return NextResponse.json(
          { error: "An affiliate with this code already exists" },
          { status: 409 }
        );
      }
    }

    const updated: AffiliateRecord = {
      ...existing,
      name: parsed.data.name,
      code: parsed.data.code,
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      commissionType: parsed.data.commissionType,
      commissionValue: parsed.data.commissionValue,
      expiresAt: parsed.data.expiresAt ?? null,
      maxUses: parsed.data.maxUses ?? null,
      active: parsed.data.active,
      updatedAt: new Date().toISOString(),
    };

    // If code changed, delete old key first
    if (newCodeLower !== oldCodeLower) {
      await deleteAffiliate(originalCode);
    }

    await saveAffiliate(updated);
    return NextResponse.json({ affiliate: updated });
  } catch (err) {
    console.error("[admin/affiliates] PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update affiliate" },
      { status: 500 }
    );
  }
}

/** DELETE — Remove an affiliate by code */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "code query param is required" },
        { status: 400 }
      );
    }

    const existing = await getAffiliateByCode(code);
    if (!existing) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    await deleteAffiliate(code);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/affiliates] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete affiliate" },
      { status: 500 }
    );
  }
}
