"use client";

import { useState, useEffect, useCallback } from "react";

interface Affiliate {
  id: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  commissionType: "percentage" | "fixed";
  commissionValue: number;
  expiresAt: string | null;
  maxUses: number | null;
  usageCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReportRow {
  code: string;
  name: string;
  salesCount: number;
  totalDiscount: number;
  commissionOwed: number;
  commissionType: string;
  commissionValue: number;
}

interface ReportData {
  startDate: string;
  endDate: string;
  rows: ReportRow[];
  totals: {
    totalSales: number;
    totalDiscountGiven: number;
    totalCommission: number;
    affiliateCount: number;
  };
}

const defaultForm = {
  name: "",
  code: "",
  discountType: "fixed" as "percentage" | "fixed",
  discountValue: 50,
  commissionType: "percentage" as "percentage" | "fixed",
  commissionValue: 10,
  expiresAt: "",
  maxUses: "",
  active: true,
};

export default function AffiliateManager() {
  // Affiliate list state
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Report state
  const [showReport, setShowReport] = useState(false);
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  // Delete confirmation
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const loadAffiliates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/affiliates");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setAffiliates(data.affiliates || []);
    } catch {
      setError("Failed to load affiliates");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAffiliates();

    // Set default report dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setReportEndDate(end.toISOString().slice(0, 10));
    setReportStartDate(start.toISOString().slice(0, 10));
  }, [loadAffiliates]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingCode(null);
    setShowForm(false);
    setFormError("");
  };

  const handleEdit = (affiliate: Affiliate) => {
    setForm({
      name: affiliate.name,
      code: affiliate.code,
      discountType: affiliate.discountType,
      discountValue: affiliate.discountValue,
      commissionType: affiliate.commissionType,
      commissionValue: affiliate.commissionValue,
      expiresAt: affiliate.expiresAt
        ? affiliate.expiresAt.slice(0, 10)
        : "",
      maxUses: affiliate.maxUses !== null ? String(affiliate.maxUses) : "",
      active: affiliate.active,
    });
    setEditingCode(affiliate.code);
    setShowForm(true);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      discountType: form.discountType,
      discountValue: form.discountValue,
      commissionType: form.commissionType,
      commissionValue: form.commissionValue,
      expiresAt: form.expiresAt || null,
      maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
      active: form.active,
    };

    try {
      const isEdit = editingCode !== null;
      const res = await fetch("/api/admin/affiliates", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit ? { ...payload, originalCode: editingCode } : payload
        ),
      });

      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to save");
        setFormLoading(false);
        return;
      }

      resetForm();
      loadAffiliates();
    } catch {
      setFormError("Failed to save affiliate");
    }
    setFormLoading(false);
  };

  const handleDelete = async (code: string) => {
    try {
      const res = await fetch(
        `/api/admin/affiliates?code=${encodeURIComponent(code)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete");
        return;
      }
      setDeletingCode(null);
      loadAffiliates();
    } catch {
      setError("Failed to delete affiliate");
    }
  };

  const handleGenerateReport = async () => {
    if (!reportStartDate || !reportEndDate) return;
    setReportLoading(true);
    setReportError("");
    setReportData(null);

    try {
      const res = await fetch(
        `/api/admin/affiliate-report?startDate=${reportStartDate}&endDate=${reportEndDate}`
      );
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json();
      setReportData(data);
    } catch {
      setReportError("Failed to generate report");
    }
    setReportLoading(false);
  };

  // Shared styles
  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    padding: "20px",
    marginBottom: "20px",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "8px 16px",
    fontSize: "14px",
    background: "#4b5e3c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  };

  const btnSecondary: React.CSSProperties = {
    padding: "8px 16px",
    fontSize: "14px",
    background: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
  };

  const btnDanger: React.CSSProperties = {
    padding: "6px 12px",
    fontSize: "13px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    borderRadius: "6px",
    cursor: "pointer",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "4px",
  };

  return (
    <div>
      {/* Action bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          style={btnPrimary}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Affiliate
        </button>
        <button
          style={btnSecondary}
          onClick={() => setShowReport(!showReport)}
        >
          {showReport ? "Hide Report" : "📊 Earnings Report"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
          <button
            onClick={() => setError("")}
            style={{
              float: "right",
              background: "none",
              border: "none",
              color: "#991b1b",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: "18px",
              marginTop: 0,
              marginBottom: "16px",
            }}
          >
            {editingCode ? "Edit Affiliate" : "Add New Affiliate"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Dr. Cohen"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Discount Code *</label>
                <input
                  style={{ ...inputStyle, textTransform: "uppercase", fontFamily: "monospace" }}
                  value={form.code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      code: e.target.value.replace(/[^A-Za-z0-9_-]/g, ""),
                    })
                  }
                  placeholder="DRCOHEN50"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>

              <div>
                <label style={labelStyle}>Discount Type</label>
                <select
                  style={inputStyle}
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountType: e.target.value as "percentage" | "fixed",
                    })
                  }
                >
                  <option value="fixed">Fixed (₪)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>
                  Discount Value{" "}
                  {form.discountType === "fixed" ? "(₪)" : "(%)"}
                </label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  min={1}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Commission Type</label>
                <select
                  style={inputStyle}
                  value={form.commissionType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      commissionType: e.target.value as
                        | "percentage"
                        | "fixed",
                    })
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₪ per sale)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>
                  Commission Value{" "}
                  {form.commissionType === "fixed" ? "(₪)" : "(%)"}
                </label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.commissionValue}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      commissionValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  min={0}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Expiry Date (optional)</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Max Uses (optional)</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: e.target.value })
                  }
                  min={1}
                  placeholder="Unlimited"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  style={{ width: "18px", height: "18px" }}
                />
                <label htmlFor="active" style={{ fontSize: "14px", fontWeight: 600 }}>
                  Active
                </label>
              </div>
            </div>

            {formError && (
              <p
                style={{
                  color: "#991b1b",
                  fontSize: "14px",
                  marginTop: "12px",
                  marginBottom: 0,
                }}
              >
                {formError}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  ...btnPrimary,
                  opacity: formLoading ? 0.6 : 1,
                }}
              >
                {formLoading
                  ? "Saving..."
                  : editingCode
                  ? "Update Affiliate"
                  : "Create Affiliate"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={btnSecondary}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Earnings Report */}
      {showReport && (
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: "18px",
              marginTop: 0,
              marginBottom: "16px",
            }}
          >
            📊 Affiliate Earnings Report
          </h2>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "end",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                style={{ ...inputStyle, width: "auto" }}
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                style={{ ...inputStyle, width: "auto" }}
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={reportLoading || !reportStartDate || !reportEndDate}
              style={{
                ...btnPrimary,
                opacity: reportLoading ? 0.6 : 1,
              }}
            >
              {reportLoading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {reportError && (
            <p style={{ color: "#991b1b", fontSize: "14px" }}>
              {reportError}
            </p>
          )}

          {reportData && (
            <div>
              {/* Totals */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                {[
                  {
                    label: "Total Sales",
                    value: reportData.totals.totalSales,
                  },
                  {
                    label: "Affiliates",
                    value: reportData.totals.affiliateCount,
                  },
                  {
                    label: "Total Discount",
                    value: `₪${reportData.totals.totalDiscountGiven}`,
                  },
                  {
                    label: "Commission Owed",
                    value: `₪${reportData.totals.totalCommission}`,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "#f9fafb",
                      padding: "12px 16px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Report table */}
              {reportData.rows.length > 0 ? (
                <div style={{ overflow: "auto" }}>
                  <table
                    style={{
                      borderCollapse: "collapse",
                      width: "100%",
                      fontSize: "13px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f9fafb",
                          borderBottom: "2px solid #e5e7eb",
                        }}
                      >
                        {[
                          "Affiliate",
                          "Code",
                          "Sales",
                          "Total Discount",
                          "Commission Rate",
                          "Commission Owed",
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
                      {reportData.rows.map((row) => (
                        <tr
                          key={row.code}
                          style={{
                            borderBottom: "1px solid #e5e7eb",
                          }}
                        >
                          <td style={{ padding: "8px" }}>{row.name}</td>
                          <td
                            style={{
                              padding: "8px",
                              fontFamily: "monospace",
                            }}
                          >
                            {row.code}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {row.salesCount}
                          </td>
                          <td style={{ padding: "8px" }}>
                            ₪{row.totalDiscount}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {row.commissionType === "fixed"
                              ? `₪${row.commissionValue}/sale`
                              : `${row.commissionValue}%`}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              fontWeight: 700,
                              color: "#166534",
                            }}
                          >
                            ₪{row.commissionOwed}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: "20px",
                  }}
                >
                  No affiliate sales in this date range
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Affiliates Table */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "18px", marginTop: 0, marginBottom: "16px" }}>
          Affiliates ({affiliates.length})
        </h2>

        {loading ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
            Loading...
          </p>
        ) : affiliates.length === 0 ? (
          <p
            style={{
              color: "#9ca3af",
              textAlign: "center",
              padding: "40px",
            }}
          >
            No affiliates yet. Click &quot;Add Affiliate&quot; to create one.
          </p>
        ) : (
          <div style={{ overflow: "auto" }}>
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                minWidth: "900px",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  {[
                    "Name",
                    "Code",
                    "Discount",
                    "Commission",
                    "Usage",
                    "Status",
                    "Expiry",
                    "Actions",
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
                {affiliates.map((a) => (
                  <tr
                    key={a.id}
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <td style={{ padding: "8px", fontWeight: 500 }}>
                      {a.name}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        fontFamily: "monospace",
                        fontSize: "13px",
                      }}
                    >
                      {a.code}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {a.discountType === "fixed"
                        ? `₪${a.discountValue}`
                        : `${a.discountValue}%`}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {a.commissionType === "fixed"
                        ? `₪${a.commissionValue}/sale`
                        : `${a.commissionValue}%`}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {a.usageCount}
                      {a.maxUses !== null ? ` / ${a.maxUses}` : ""}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span
                        style={{
                          background: a.active ? "#dcfce7" : "#fee2e2",
                          color: a.active ? "#166534" : "#991b1b",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {a.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "8px", fontSize: "12px" }}>
                      {a.expiresAt
                        ? new Date(a.expiresAt).toLocaleDateString(
                            "en-IL"
                          )
                        : "—"}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(a)}
                          style={{
                            ...btnSecondary,
                            padding: "4px 10px",
                            fontSize: "12px",
                          }}
                        >
                          Edit
                        </button>
                        {deletingCode === a.code ? (
                          <>
                            <button
                              onClick={() => handleDelete(a.code)}
                              style={{
                                ...btnDanger,
                                padding: "4px 10px",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingCode(null)}
                              style={{
                                ...btnSecondary,
                                padding: "4px 10px",
                                fontSize: "12px",
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeletingCode(a.code)}
                            style={{
                              ...btnDanger,
                              padding: "4px 10px",
                              fontSize: "12px",
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
