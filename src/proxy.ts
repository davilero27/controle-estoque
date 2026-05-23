import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/produtos",
  "/vendas",
  "/historico",
  "/analytics",
  "/organizacao",
  "/onboarding/organization",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = request.cookies.has(
    "stockpro_session"
  );

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/produtos/:path*",
    "/vendas/:path*",
    "/historico/:path*",
    "/analytics/:path*",
    "/organizacao/:path*",
    "/onboarding/organization",
    "/login",
  ],
};
