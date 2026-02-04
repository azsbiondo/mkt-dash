import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));

  const expected = process.env.VIEWER_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "VIEWER_PASSWORD not set" }, { status: 500 });
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // Simple session cookie; good enough for internal shared-password gate
  res.cookies.set("mktdash_session", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });

  return res;
}
