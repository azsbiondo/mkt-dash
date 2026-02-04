"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Login failed");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={onSubmit} style={{ width: 420, border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Marketing Dashboard</h1>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>Enter the shared password to continue.</p>

        <label style={{ fontSize: 12, color: "#374151" }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            marginTop: 6,
            marginBottom: 12,
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 10,
          }}
        />

        {error && <div style={{ color: "#b91c1c", marginBottom: 10, fontSize: 13 }}>{error}</div>}

        <button
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "none",
            background: "#111827",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
