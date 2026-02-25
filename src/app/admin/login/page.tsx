"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        router.push("/admin/logs");
      } else {
        setError("Invalid token");
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>Admin Login</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "80px 24px", background: "#f9fafb" }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
          <h1 style={{ fontSize: 24, marginBottom: 24 }}>Admin Login</h1>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token"
            style={{ width: "100%", padding: "10px 14px", fontSize: 16, border: "1px solid #d1d5db", borderRadius: 8, boxSizing: "border-box" }}
          />
          {error && <p style={{ color: "#dc2626", fontSize: 14, marginTop: 8 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !token}
            style={{ width: "100%", padding: "10px 14px", fontSize: 16, background: "#4b5e3c", color: "white", border: "none", borderRadius: 8, cursor: "pointer", marginTop: 12 }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </body>
    </html>
  );
}
