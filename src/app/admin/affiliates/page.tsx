import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AffiliateManager from "./AffiliateManager";

export default async function AffiliatesPage() {
  // Auth via HTTP-only cookie — same pattern as /admin/logs
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const expectedToken = process.env.ADMIN_LOG_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    redirect("/admin/login");
  }

  return (
    <html lang="en">
      <head>
        <title>Gever Health - Affiliate Management</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          padding: "24px",
          background: "#f9fafb",
          color: "#111827",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "24px", marginBottom: "4px", marginTop: 0 }}>
                Affiliate Management
              </h1>
              <p style={{ color: "#6b7280", marginTop: 0 }}>
                Manage discount codes, affiliates, and view earnings reports
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href="/admin/logs"
                style={{
                  color: "#4b5e3c",
                  textDecoration: "none",
                  fontSize: "14px",
                  padding: "8px 16px",
                  border: "1px solid #4b5e3c",
                  borderRadius: "6px",
                }}
              >
                ← Submission Logs
              </a>
              <a
                href="/admin/analytics"
                style={{
                  color: "#4b5e3c",
                  textDecoration: "none",
                  fontSize: "14px",
                  padding: "8px 16px",
                  border: "1px solid #4b5e3c",
                  borderRadius: "6px",
                }}
              >
                Analytics
              </a>
            </div>
          </div>
          <AffiliateManager />
        </div>
      </body>
    </html>
  );
}
