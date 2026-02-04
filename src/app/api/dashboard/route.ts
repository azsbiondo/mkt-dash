import { NextResponse } from "next/server";

function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const asOf = url.searchParams.get("asOf") ?? new Date().toISOString().slice(0, 10);

  // Mock values for now (phase 1). Next phase we’ll compute from Postgres + Monday sync.
  const pursuits = {
    openNow: 28,
    openPrev: 18,
    cycleNowMinutes: 8 * 8 * 60 + 7 * 60, // 8d 07h (8-hour workday display)
    cyclePrevMinutes: 9 * 8 * 60,
    completionsNow: 41,
    completionsPrev: 36,
    top3: ["", "", ""],
  };

  const creative = {
    openNow: 12,
    openPrev: 14,
    cycleNowMinutes: 3 * 8 * 60 + 2 * 60,
    cyclePrevMinutes: 3 * 8 * 60 + 6 * 60,
    completionsNow: 22,
    completionsPrev: 19,
    top3: ["", "", ""],
  };

  const payload = {
    asOf,
    pursuits: {
      open: {
        value: pursuits.openNow,
        trendPct: pctChange(pursuits.openNow, pursuits.openPrev),
        direction: pursuits.openNow >= pursuits.openPrev ? "up" : "down",
        tone: pursuits.openNow >= pursuits.openPrev ? "bad" : "good",
      },
      cycle: {
        valueMinutes: pursuits.cycleNowMinutes,
        trendPct: pctChange(pursuits.cycleNowMinutes, pursuits.cyclePrevMinutes),
        direction: pursuits.cycleNowMinutes >= pursuits.cyclePrevMinutes ? "up" : "down",
        tone: pursuits.cycleNowMinutes >= pursuits.cyclePrevMinutes ? "bad" : "good",
      },
      completions: {
        value: pursuits.completionsNow,
        trendPct: pctChange(pursuits.completionsNow, pursuits.completionsPrev),
        direction: pursuits.completionsNow >= pursuits.completionsPrev ? "up" : "down",
        tone: pursuits.completionsNow >= pursuits.completionsPrev ? "good" : "bad",
      },
      top3: pursuits.top3,
    },
    creative: {
      open: {
        value: creative.openNow,
        trendPct: pctChange(creative.openNow, creative.openPrev),
        direction: creative.openNow >= creative.openPrev ? "up" : "down",
        tone: creative.openNow >= creative.openPrev ? "bad" : "good",
      },
      cycle: {
        valueMinutes: creative.cycleNowMinutes,
        trendPct: pctChange(creative.cycleNowMinutes, creative.cyclePrevMinutes),
        direction: creative.cycleNowMinutes >= creative.cyclePrevMinutes ? "up" : "down",
        tone: creative.cycleNowMinutes >= creative.cyclePrevMinutes ? "bad" : "good",
      },
      completions: {
        value: creative.completionsNow,
        trendPct: pctChange(creative.completionsNow, creative.completionsPrev),
        direction: creative.completionsNow >= creative.completionsPrev ? "up" : "down",
        tone: creative.completionsNow >= creative.completionsPrev ? "good" : "bad",
      },
      top3: creative.top3,
    },
  };

  return NextResponse.json(payload);
}
