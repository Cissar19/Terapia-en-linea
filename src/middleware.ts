import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("__session")?.value;

  // Protect routes that require authentication
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profesional") ||
    pathname.startsWith("/mi-panel") ||
    pathname.startsWith("/agendar")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect auth pages if already logged in
  if (pathname === "/login" || pathname === "/registro") {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profesional/:path*", "/mi-panel/:path*", "/agendar/:path*", "/login", "/registro"],
};
