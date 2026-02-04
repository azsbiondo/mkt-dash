import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_PREFIXES = ["/_next", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  // Allow login/logout routes
  if (pathname.startsWith("/api/login") || pathname.startsWith("/api/logout")) {
    return NextResponse.next();
  }

  // Everything else requires session cookie
  const session = req.cookies.get("mktdash_session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/health).*)"],
};
