import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define routes that are accessible without authentication
const publicRoutes = [
  "/", // Root path for informative website
  "/login", 
  "/signup", 
  "/forgot-password", 
  "/reset-password",
  "/bdr/login"
];

// Define BDR-specific routes
const bdrRoutes = ["/bdr", "/bdr/dashboard", "/bdr/customers"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  const isBdrRoute = bdrRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // If user is NOT authenticated
  if (!token) {
    // If trying to access a non-public route, redirect to login
    if (!isPublicRoute) {
      // Special handling for BDR routes - redirect to BDR login instead of regular login
      if (isBdrRoute) {
        return NextResponse.redirect(new URL("/bdr/login", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If user IS authenticated
  if (token) {
    // If trying to access regular public auth routes (like login/signup), redirect to dashboard
    if (isPublicRoute && !pathname.startsWith("/bdr")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // If trying to access BDR login while authenticated, redirect to BDR dashboard
    if (pathname === "/bdr/login") {
      return NextResponse.redirect(new URL("/bdr", request.url));
    }
    
    // Allow authenticated users to access BDR customer pages
    if (pathname.startsWith("/bdr/customers/")) {
      return NextResponse.next();
    }
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
     * - public assets like images in public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:jpg|jpeg|gif|png|svg|ico|webp)$).*)",
  ],
};