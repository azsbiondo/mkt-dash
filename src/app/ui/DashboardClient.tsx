"use client";

import { useEffect, useMemo, useState } from "react";

type Trend = { pct: number; direction: "up" | "down"; tone: "good" | "bad" };
type Tile = { title: string; value: string | number; subtitle?: string; trend?: Trend };

function TrendPill({ trend }: { trend: Trend }) {
  const isUp = trend.direction === "up";
  const good = trend.tone === "good";

  const bg = good ? "#DCFCE7" : "#FEE2E2";
  const fg = good ? "#166534" : "#991B1B";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 10px",
      borderRadius: 999,
      background: bg,
      color: fg,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap"
    }}>
      <span style={{ fontSize: 12 }}>{isUp ? "▲" : "▼"}</span>
      {Math.abs(trend.pct).toFixed(1)}%
    </span>
  );
}

function KpiTile({ tile }: { tile: Tile }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 16,
      minHeight: 150,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{tile.title}</div>
        {tile.trend ? <TrendPill trend={tile.trend} /> : null}
      </div>

      <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, color: "#111827", lineHeight: 1 }}>
        {tile.value}
      </div>

      <div style={{ fontSize: 12, color: "#6b7280" }}>{tile.subtitle ?? ""}</div>
    </div>
  );
}

function Top3Tile({ title }: { title: string }) {
  // Placeholder UI — we’ll wire to DB next
  const [items, setItems] = useState(["", "", ""]);

  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 16,
      minHeight: 150,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{title}</div>
      {items.map((v, i) => (
        <input
          key={i}
          value={v}
          placeholder={`#${i + 1}`}
          onChange={(e) => {
            const next = [...items];
            next[i] = e.target.value;
            setItems(next);
          }}
          style={{
            width: "100%",
            padding: "9px 10px",
            border: "1px solid #d1d5db",
            borderRadius: 10,
          }}
        />
      ))}
      <div style={{ fontSize: 12, color: "#6b7280" }}>Saved until edited (DB wiring next).</div>
    </div>
  );
}

export default function DashboardClient() {
  const [asOf, setAsOf] = useState<string>(() => {
    // ISO date default (NY time will be enforced server-side later; this is a UI default)
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const pursuitsTiles: Tile[] = useMemo(() => [
    { title: "Open Tasks", value: 0, subtitle: "As of " + asOf, trend: { pct: 0, direction: "up", tone: "bad" } },
    { title: "Cycle Time", value: "0d 00h", subtitle: "Avg (working hours) last 30 days", trend: { pct: 0, direction: "down", tone: "good" } },
    { title: "Completions", value: 0, subtitle: "Completed in last 30 days", trend: { pct: 0, direction: "up", tone: "good" } },
  ], [asOf]);

  const creativeTiles: Tile[] = useMemo(() => [
    { title: "Open Tasks", value: 0, subtitle: "As of " + asOf, trend: { pct: 0, direction: "up", tone: "bad" } },
    { title: "Cycle Time", value: "0d 00h", subtitle: "Avg (working hours) last 30 days", trend: { pct: 0, direction: "down", tone: "good" } },
    { title: "Completions", value: 0, subtitle: "Completed in last 30 days", trend: { pct: 0, direction: "up", tone: "good" } },
  ], [asOf]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main style={{ padding: 22, background: "#F3F4F6", minHeight: "100vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#111827" }}>Marketing Dashboard</h1>
          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>
            Report as of (NY): <strong>{asOf}</strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #d1d5db" }}
          />
          <a
            href={`/print?asOf=${asOf}`}
            target="_blank"
            rel="noreferrer"
            style={{ padding: "9px 12px", borderRadius: 10, background: "#111827", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 13 }}
          >
            Print View
          </a>
          <button
            onClick={logout}
            style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #d1d5db", background: "white", fontWeight: 700, fontSize: 13 }}
          >
            Logout
          </button>
        </div>
      </header>

      <section style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 10 }}>Pursuits</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {pursuitsTiles.map((t) => <KpiTile key={t.title} tile={t} />)}
          <Top3Tile title="Top 3 (manual)" />
        </div>
      </section>

      <section>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 10 }}>Creative</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {creativeTiles.map((t) => <KpiTile key={t.title} tile={t} />)}
          <Top3Tile title="Top 3 (manual)" />
        </div>
      </section>
    </main>
  );
}
