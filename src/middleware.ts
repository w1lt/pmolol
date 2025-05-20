import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // The middleware only runs on dynamic slug routes
  // We don't use it for routing, just for recording visits

  // Pass through for all non-slug routes
  const pathname = request.nextUrl.pathname;

  // Skip non-slug routes and known app routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/edit") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/_next") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // For slug routes, we'll let the [slug] route handle the page and analytics
  return NextResponse.next();
}

// Configure matcher for the middleware to run only on specific paths
export const config = {
  matcher: [
    // Skip all internal paths
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
