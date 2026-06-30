import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * Middleware protects /admin/* routes (redirect to /login if not admin).
 * Also protects POST /api/products, DELETE /api/products/[id], and
 * DELETE /api/reviews/[id] — they return 401/403 for non-admin requests.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("auth_token")?.value;
  const payload = authCookie ? await verifyToken(authCookie) : null;

  // --- Admin page protection ---
  if (pathname.startsWith("/admin")) {
    if (!payload || payload.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- API route protection: admin-only mutations ---
  if (pathname.startsWith("/api/products") && ["POST", "PUT"].includes(request.method)) {
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { detail: "Unauthorized" },
        { status: 403 }
      );
    }
  }

  if (
    pathname.match(/^\/api\/products\/\d+$/) &&
    request.method === "DELETE"
  ) {
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { detail: "Unauthorized" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/products/:path*",
    "/api/reviews/:path*",
  ],
};
