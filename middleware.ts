import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/auth/register",
  "/auth/login",
  "/auth/verify-email",
  "/api/auth/register",
];

const adminPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without authentication
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for authentication (this is a placeholder - implement with your auth provider)
  const session = request.cookies.get("session")?.value;

  // Protect admin routes
  if (adminPaths.some((path) => pathname.startsWith(path))) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Check if user is admin (implement role check)
    // const userRole = request.headers.get("x-user-role");
    // if (userRole !== "admin") {
    //   return NextResponse.redirect(new URL("/", request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
