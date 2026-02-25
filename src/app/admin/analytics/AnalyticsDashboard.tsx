"use client";

import { useState, useCallback } from "react";

// --- Types ---

interface ScreenStat {
  screenId: string;
  views: number;
  dropOffs: number;
  dropOffRate: number;
  avgDurationMs: number;
  medianDurationMs: number;
}

interface FunnelStep {
  screenId: string;
  screenIndex: number;
  reached: number;
  percentage: number;
}

interface DashboardData {
  dateRange: { start: string; end: string };
  summary: {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    avgTotalTimeMs: number;
    medianTotalTimeMs: number;
  };
  screenStats: ScreenStat[];
  funnel: FunnelStep[];
}

// --- Helpers ---

const SCREEN_LABELS: Record<string, string> = {
  landing: "Landing Page",
  consent: "Initial Consent",
  dob: "Date of Birth",
  "male-conditions": "Male Conditions",
  "medical-conditions-text": "Medical Conditions",
  "medications-text": "Current Medications",
  "allergies-text": "Allergies",
  "affected-areas": "Affected Areas",
  duration: "Duration of Hair Loss",
  severity: "Severity",
  cause: "Suspected Cause",
  "doctor-eval": "Doctor Evaluation",
  "doctor-diagnosis": "Doctor Diagnosis",
  "doctor-eval-details": "Diagnosis Details",
  "scalp-conditions": "Scalp Conditions",
  dandruff: "Dandruff",
  "body-areas": "Other Body Areas",
  "body-areas-details": "Body Areas Details",
  treatments: "Previous Treatments",
  "treatments-details": "Treatment Details",
  "serious-conditions": "Serious Conditions",
  mood: "Mood Disorders",
  "mood-details": "Mood Details",
  "doctor-questions": "Questions for Doctor",
  truthfulness: "Truthfulness Declaration",
  "treatment-consent": "Treatment Consent",
  "phone-verify": "Phone Verification",
  "email-id": "Email & ID",
  shipping: "Shipping Address",
  "medication-select": "Medication Selection",
  "plan-select": "Plan Selection",
  checkout: "Checkout",
};

function formatDuration(ms: number): string {
  if (ms === 0) return "-";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${minutes}m ${rem}s`;
}

function getDefaultDates(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

// --- Styles ---

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  padding: "20px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  color: "#6b7280",
  marginBottom: "4px",
};

const valueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#111827",
};

const btnStyle: React.CSSProperties = {
  background: "#4b5e3c",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "8px 20px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
};

const thStyle: React.CSSProperties = {
  padding: "10px 8px",
  textAlign: "left" as const,
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  color: "#6b7280",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  fontSize: "13px",
  borderBottom: "1px solid #e5e7eb",
};

// --- Component ---

export default function AnalyticsDashboard() {
  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Filter funnel and screen stats to only show screens with views
  const visibleFunnel = data?.funnel.filter((f) => f.reached > 0) || [];
  const visibleScreenStats =
    data?.screenStats.filter((s) => s.views > 0) || [];

  return (
    <div>
      {/* Date range selector */}
      <div
        style={{
          ...cardStyle,
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <label style={{ fontSize: "14px", fontWeight: 500 }}>From:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={inputStyle}
        />
        <label style={{ fontSize: "14px", fontWeight: 500 }}>To:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={inputStyle}
        />
        <button
          onClick={loadAnalytics}
          disabled={loading}
          style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Loading..." : "Load Analytics"}
        </button>
        {error && (
          <span style={{ color: "#dc2626", fontSize: "14px" }}>{error}</span>
        )}
      </div>

      {!data && !loading && (
        <div
          style={{
            ...cardStyle,
            textAlign: "center",
            padding: "60px 20px",
            color: "#9ca3af",
          }}
        >
          Select a date range and click &quot;Load Analytics&quot; to view form
          statistics.
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div style={cardStyle}>
              <div style={labelStyle}>Total Sessions</div>
              <div style={valueStyle}>{data.summary.totalSessions}</div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Completed</div>
              <div style={valueStyle}>{data.summary.completedSessions}</div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Completion Rate</div>
              <div style={valueStyle}>{data.summary.completionRate}%</div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Avg Total Time</div>
              <div style={valueStyle}>
                {formatDuration(data.summary.avgTotalTimeMs)}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Median Total Time</div>
              <div style={valueStyle}>
                {formatDuration(data.summary.medianTotalTimeMs)}
              </div>
            </div>
          </div>

          {/* Conversion funnel */}
          <div style={{ ...cardStyle, marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginTop: 0,
                marginBottom: "16px",
              }}
            >
              Conversion Funnel
            </h2>
            {visibleFunnel.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No data for selected period.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {visibleFunnel.map((step) => (
                  <div
                    key={step.screenId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "180px",
                        fontSize: "13px",
                        color: "#374151",
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {SCREEN_LABELS[step.screenId] || step.screenId}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: "#f3f4f6",
                        borderRadius: "4px",
                        height: "24px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(step.percentage, 1)}%`,
                          height: "100%",
                          background: "#4b5e3c",
                          borderRadius: "4px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: "100px",
                        fontSize: "13px",
                        color: "#6b7280",
                        flexShrink: 0,
                      }}
                    >
                      {step.reached} ({step.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Per-screen stats table */}
          <div style={{ ...cardStyle, overflow: "auto" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginTop: 0,
                marginBottom: "16px",
              }}
            >
              Per-Screen Statistics
            </h2>
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                minWidth: "700px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  <th style={thStyle}>Screen</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Views</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Drop-offs</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>
                    Drop-off %
                  </th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Avg Time</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>
                    Median Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleScreenStats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#9ca3af",
                      }}
                    >
                      No data for selected period.
                    </td>
                  </tr>
                ) : (
                  visibleScreenStats.map((s) => (
                    <tr key={s.screenId}>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>
                        {SCREEN_LABELS[s.screenId] || s.screenId}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {s.views}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {s.dropOffs}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          fontWeight: 600,
                          color: s.dropOffRate > 20 ? "#dc2626" : "#374151",
                          background:
                            s.dropOffRate > 20 ? "#fef2f2" : "transparent",
                        }}
                      >
                        {s.dropOffRate}%
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {formatDuration(s.avgDurationMs)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {formatDuration(s.medianDurationMs)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
