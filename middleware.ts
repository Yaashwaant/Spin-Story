import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth-edge";

// Define routes that are accessible without authentication
const publicRoutes = [
  "/", // Root path for informative website
  "/login", 
  "/signup", 
  "/forgot-password", 
  "/reset-password",
  "/bdr/login"
];

// Define user-specific routes (regular customers)
const userRoutes = [
  "/dashboard",
  "/profile", 
  "/settings", 
  "/wardrobe", 
  "/outfit-planner", 
  "/onboarding",
  "/shop",
  "/recommend"
];

// Define BDR-specific routes
const bdrRoutes = ["/bdr", "/bdr/dashboard", "/bdr/customers"];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  console.log(`Middleware: Checking ${pathname}, token: ${token ? 'present' : 'missing'}`);

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  const isBdrRoute = bdrRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  const isUserRoute = userRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  console.log(`Middleware: isPublicRoute=${isPublicRoute}, isUserRoute=${isUserRoute}, isBdrRoute=${isBdrRoute}`);

  // If user is NOT authenticated
  if (!token) {
    console.log(`Middleware: No token found`);
    // If trying to access a non-public route, redirect to login
    if (!isPublicRoute) {
      console.log(`Middleware: Redirecting to login from ${pathname}`);
      // Special handling for BDR routes - redirect to BDR login instead of regular login
      if (isBdrRoute) {
        return NextResponse.redirect(new URL("/bdr/login", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    console.log(`Middleware: Allowing access to public route ${pathname}`);
  }

  // If user IS authenticated, verify token and check roles
  if (token) {
    console.log(`Middleware: Token found, verifying...`);
    const decoded = await verifyToken(token);
    
    // If token is invalid, redirect to login
    if (!decoded) {
      console.log(`Middleware: Invalid token, redirecting to login`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userRole = decoded.role;
    console.log(`Middleware: Valid token, user role: ${userRole}`);

    // Redirect authenticated users away from public auth pages
    if (isPublicRoute && !pathname.startsWith("/bdr")) {
      console.log(`Middleware: Authenticated user accessing public route, redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // If trying to access BDR login while authenticated, redirect to BDR dashboard
    if (pathname === "/bdr/login") {
      console.log(`Middleware: Authenticated user accessing BDR login, redirecting to BDR dashboard`);
      return NextResponse.redirect(new URL("/bdr", request.url));
    }

    // Role-based access control
    if (isUserRoute && (userRole === "BDR" || userRole === "ADMIN")) {
      // BDR/ADMIN trying to access user pages - redirect to BDR dashboard
      console.log(`Middleware: BDR/ADMIN trying to access user route, redirecting to BDR dashboard`);
      return NextResponse.redirect(new URL("/bdr", request.url));
    }

    if (isBdrRoute && userRole === "USER") {
      // Regular user trying to access BDR pages - redirect to user dashboard
      console.log(`Middleware: USER trying to access BDR route, redirecting to user dashboard`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow authenticated users to access BDR customer pages
    if (pathname.startsWith("/bdr/customers/")) {
      console.log(`Middleware: Allowing access to BDR customer page`);
      return NextResponse.next();
    }
  }

  console.log(`Middleware: Allowing access to ${pathname}`);
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)$).*)",
  ],
};