"use client";

import { useEffect, useMemo, useState } from "react";

type Trend = { pct: number; direction: "up" | "down"; tone: "good" | "bad" };
type Tile = { title: string; value: string | number; subtitle?: string; trend?: Trend };

type ApiKpi = {
  value?: number;
  trendPct: number;
  direction: "up" | "down";
  tone: "good" | "bad";
};

type ApiCycle = {
  valueMinutes: number;
  trendPct: number;
  direction: "up" | "down";
  tone: "good" | "bad";
};

type ApiRow = {
  open: ApiKpi;
  cycle: ApiCycle;
  completions: ApiKpi;
  top3: string[];
};

type DashboardResponse = {
  asOf: string;
  pursuits: ApiRow;
  creative: ApiRow;
};

function minutesToWorkdayString(totalMinutes: number) {
  const minutesPerWorkday = 8 * 60;
  const d = Math.floor(totalMinutes / minutesPerWorkday);
  const h = Math.floor((totalMinutes % minutesPerWorkday) / 60);
  return `${d}d ${String(h).padStart(2, "0")}h`;
}

function TrendPill({ trend }: { trend: Trend }) {
  const isUp = trend.direction === "up";
  const good = trend.tone === "good";

  const bg = good ? "#DCFCE7" : "#FEE2E2";
  const fg = good ? "#166534" : "#991B1B";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 12 }}>{isUp ? "▲" : "▼"}</span>
      {Math.abs(trend.pct).toFixed(1)}%
    </span>
  );
}

function KpiTile({ tile }: { tile: Tile }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
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

function Top3Tile({ title, items }: { title: string; items: string[] }) {
  // Still local-only for now; next phase we’ll persist in Postgres.
  const [local, setLocal] = useState(items?.length ? items : ["", "", ""]);

  useEffect(() => {
    setLocal(items?.length ? items : ["", "", ""]);
  }, [items]);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{title}</div>
      {local.map((v, i) => (
        <input
          key={i}
          value={v}
          placeholder={`#${i + 1}`}
          onChange={(e) => {
            const next = [...local];
            next[i] = e.target.value;
            setLocal(next);
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

function rowToTiles(row: ApiRow, asOf: string) {
  const openTrend: Trend = { pct: row.open.trendPct, direction: row.open.direction, tone: row.open.tone };
  const cycleTrend: Trend = { pct: row.cycle.trendPct, direction: row.cycle.direction, tone: row.cycle.tone };
  const compTrend: Trend = { pct: row.completions.trendPct, direction: row.completions.direction, tone: row.completions.tone };

  return [
    { title: "Open Tasks", value: row.open.value ?? 0, subtitle: `As of ${asOf}`, trend: openTrend },
    {
      title: "Cycle Time",
      value: minutesToWorkdayString(row.cycle.valueMinutes ?? 0),
      subtitle: "Avg (working hours) last 30 days",
      trend: cycleTrend,
    },
    { title: "Completions", value: row.completions.value ?? 0, subtitle: "Completed in last 30 days", trend: compTrend },
  ] as Tile[];
}

export default function DashboardClient() {
  const [asOf, setAsOf] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/dashboard?asOf=${encodeURIComponent(asOf)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = (await res.json()) as DashboardResponse;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [asOf]);

  const pursuitsTiles = useMemo(() => (data ? rowToTiles(data.pursuits, data.asOf) : []), [data]);
  const creativeTiles = useMemo(() => (data ? rowToTiles(data.creative, data.asOf) : []), [data]);

  return (
    <main style={{ padding: 22, background: "#F3F4F6", minHeight: "100vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#111827" }}>Marketing Dashboard</h1>
          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>
            Report as of (NY): <strong>{asOf}</strong>
            {loading ? <span style={{ marginLeft: 10 }}>(loading…)</span> : null}
          </div>
          {err ? <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{err}</div> : null}
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
          <Top3Tile title="Top 3 (manual)" items={data?.pursuits?.top3 ?? ["", "", ""]} />
        </div>
      </section>

      <section>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 10 }}>Creative</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {creativeTiles.map((t) => <KpiTile key={t.title} tile={t} />)}
          <Top3Tile title="Top 3 (manual)" items={data?.creative?.top3 ?? ["", "", ""]} />
        </div>
      </section>
    </main>
  );
}
