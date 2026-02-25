import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { listLogs, getLogsByKeys, SubmissionLogEntry } from "@/lib/submission-log";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: "#dcfce7", text: "#166534" },
    beluga_error: { bg: "#fee2e2", text: "#991b1b" },
    validation_error: { bg: "#fef9c3", text: "#854d0e" },
    network_error: { bg: "#fce4ec", text: "#880e4f" },
    internal_error: { bg: "#f3e5f5", text: "#4a148c" },
  };
  const c = colors[status] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

function LogRow({ entry }: { entry: SubmissionLogEntry }) {
  const time = new Date(entry.timestamp);
  return (
    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
      <td style={{ padding: "8px", fontSize: "13px", whiteSpace: "nowrap" }}>
        {time.toLocaleDateString("en-IL")} {time.toLocaleTimeString("en-IL")}
      </td>
      <td style={{ padding: "8px" }}>
        <StatusBadge status={entry.status} />
      </td>
      <td style={{ padding: "8px", fontSize: "13px", fontFamily: "monospace" }}>
        {entry.masterId}
      </td>
      <td style={{ padding: "8px", fontSize: "13px" }}>{entry.patientName}</td>
      <td style={{ padding: "8px", fontSize: "13px" }}>{entry.patientEmail}</td>
      <td style={{ padding: "8px", fontSize: "13px" }}>{entry.patientPhone}</td>
      <td style={{ padding: "8px", fontSize: "13px" }}>{entry.patientCity || "-"}</td>
      <td style={{ padding: "8px", fontSize: "13px" }}>
        {entry.medicationType} / {entry.planDuration}mo
      </td>
      <td style={{ padding: "8px", fontSize: "13px", fontWeight: 600 }}>
        {entry.paymentAmount ? `₪${entry.paymentAmount}` : "-"}
      </td>
      <td style={{ padding: "8px", fontSize: "13px" }}>
        {entry.durationMs > 0 ? `${entry.durationMs}ms` : "-"}
      </td>
      <td
        style={{
          padding: "8px",
          fontSize: "12px",
          color: "#dc2626",
          maxWidth: "300px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {entry.errorMessage || "-"}
      </td>
    </tr>
  );
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; limit?: string }>;
}) {
  // Auth via HTTP-only cookie — token never appears in URL
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const expectedToken = process.env.ADMIN_LOG_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const limit = params.limit ? parseInt(params.limit, 10) : 100;
  const { keys } = await listLogs({
    datePrefix: params.date || "",
    limit,
  });
  const entries = await getLogsByKeys(keys);

  const successCount = entries.filter((e) => e.status === "success").length;
  const errorCount = entries.length - successCount;

  return (
    <html lang="en">
      <head>
        <title>Gever Health - Submission Logs</title>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
          <h1 style={{ fontSize: "24px", marginBottom: "4px", marginTop: 0 }}>
            Submission Logs
          </h1>
          <p style={{ color: "#6b7280", marginTop: 0, marginBottom: 0 }}>
            {entries.length} entries
            {params.date ? ` for ${params.date}` : ""} &middot;{" "}
            <span style={{ color: "#166534" }}>{successCount} success</span>{" "}
            &middot;{" "}
            <span style={{ color: "#991b1b" }}>{errorCount} errors</span>
          </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
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
            Analytics →
          </a>
          <a
            href="/admin/affiliates"
            style={{
              color: "#4b5e3c",
              textDecoration: "none",
              fontSize: "14px",
              padding: "8px 16px",
              border: "1px solid #4b5e3c",
              borderRadius: "6px",
            }}
          >
            Affiliates →
          </a>
          </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "auto",
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                minWidth: "1200px",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  {[
                    "Time",
                    "Status",
                    "Master ID",
                    "Patient",
                    "Email",
                    "Phone",
                    "City",
                    "Product",
                    "Amount",
                    "Duration",
                    "Error",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 8px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: "#6b7280",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#9ca3af",
                      }}
                    >
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <LogRow key={entry.id} entry={entry} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  );
}
