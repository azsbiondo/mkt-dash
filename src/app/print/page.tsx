import Link from "next/link";

export default async function PrintPage(props: { searchParams: Promise<{ asOf?: string }> }) {
  const { asOf } = await props.searchParams;
  const date = asOf ?? new Date().toISOString().slice(0, 10);

  // For now we’ll just render a clean 16:9 canvas.
  // Later: this page will fetch /api/dashboard?asOf=... server-side and render real KPIs.
  return (
    <main style={{ margin: 0, padding: 0, background: "#111827" }}>
      <div style={{
        width: 1920,
        height: 1080,
        margin: "0 auto",
        background: "#F3F4F6",
        padding: 28,
        boxSizing: "border-box",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#111827" }}>Marketing Dashboard</div>
            <div style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>Report as of (NY): {date}</div>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            <Link href="/" style={{ color: "#111827" }}>Back to dashboard</Link>
          </div>
        </div>

        <div style={{ color: "#6b7280", fontSize: 14 }}>
          Print view placeholder (16:9). Next step is wiring KPI data + PDF export.
        </div>
      </div>
    </main>
  );
}
