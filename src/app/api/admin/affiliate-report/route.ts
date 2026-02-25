import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { affiliateReportSchema } from "@/lib/validation";
import { listLogs, getLogsByKeys } from "@/lib/submission-log";
import {
  getAffiliateByCode,
  calculateCommission,
  AffiliateRecord,
} from "@/lib/affiliate-store";

interface AffiliateReportRow {
  code: string;
  name: string;
  salesCount: number;
  totalRevenue: number; // Total amount charged (after discount)
  totalDiscount: number; // Total discount given
  commissionOwed: number; // Total commission to pay
  commissionType: string;
  commissionValue: number;
}

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const expectedToken = process.env.ADMIN_LOG_TOKEN;
  return !!(expectedToken && token === expectedToken);
}

/** GET — Generate affiliate earnings report for a date range */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const parsed = affiliateReportSchema.safeParse({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "startDate and endDate (YYYY-MM-DD) are required" },
        { status: 400 }
      );
    }

    const { startDate, endDate } = parsed.data;

    // Collect all logs in the date range by iterating day by day
    const allKeys: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (
      let d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().slice(0, 10);
      const { keys } = await listLogs({ datePrefix: dateStr });
      allKeys.push(...keys);
    }

    // Fetch all log entries
    const entries = await getLogsByKeys(allKeys);

    // Filter to successful sales with affiliate codes
    const affiliateSales = entries.filter(
      (e) => e.status === "success" && e.affiliateCode
    );

    // Group by affiliate code
    const grouped: Record<
      string,
      { salesCount: number; totalRevenue: number; totalDiscount: number }
    > = {};

    for (const sale of affiliateSales) {
      const code = sale.affiliateCode.toLowerCase();
      if (!grouped[code]) {
        grouped[code] = { salesCount: 0, totalRevenue: 0, totalDiscount: 0 };
      }
      grouped[code].salesCount += 1;
      grouped[code].totalDiscount += sale.discountAmount || 0;
    }

    // Build report rows with commission calculations
    const rows: AffiliateReportRow[] = [];
    let totalCommission = 0;
    let totalSales = 0;
    let totalDiscountGiven = 0;

    const codes = Object.keys(grouped);
    for (const code of codes) {
      const data = grouped[code];

      // Look up current affiliate config for commission calculation
      const affiliate = await getAffiliateByCode(code);

      let commissionOwed = 0;
      let commissionType = "unknown";
      let commissionValue = 0;
      let name = code;

      if (affiliate) {
        name = affiliate.name;
        commissionType = affiliate.commissionType;
        commissionValue = affiliate.commissionValue;

        // Commission is per-sale: either fixed ₪ amount or percentage
        if (affiliate.commissionType === "fixed") {
          commissionOwed = data.salesCount * affiliate.commissionValue;
        } else {
          // Percentage commission — calculate per sale
          for (const sale of affiliateSales.filter(
            (s) => s.affiliateCode.toLowerCase() === code
          )) {
            commissionOwed += calculateCommission(
              affiliate as AffiliateRecord,
              sale.discountAmount || 0
            );
          }
        }
      }

      rows.push({
        code: affiliate?.code || code,
        name,
        salesCount: data.salesCount,
        totalRevenue: 0,
        totalDiscount: data.totalDiscount,
        commissionOwed,
        commissionType,
        commissionValue,
      });

      totalCommission += commissionOwed;
      totalSales += data.salesCount;
      totalDiscountGiven += data.totalDiscount;
    }

    // Sort by sales count descending
    rows.sort((a, b) => b.salesCount - a.salesCount);

    return NextResponse.json({
      startDate,
      endDate,
      rows,
      totals: {
        totalSales,
        totalDiscountGiven,
        totalCommission,
        affiliateCount: rows.length,
      },
    });
  } catch (err) {
    console.error("[admin/affiliate-report] GET error:", err);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
