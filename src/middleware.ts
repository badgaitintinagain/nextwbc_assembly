import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Middleware function to protect routes
export async function middleware(request: NextRequest) {
  // Get token if user is authenticated
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthenticated = !!token;

  // Define protected paths
  const protectedPaths = ["/prediction"];
  const authPaths = ["/signin", "/signup"];
  const currentPath = request.nextUrl.pathname;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    currentPath.startsWith(path)
  );

  // Redirect to login if accessing protected path without authentication
  if (isProtectedPath && !isAuthenticated) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect already logged in users away from login/register pages
  if (authPaths.some(path => currentPath.startsWith(path)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Define which paths this middleware will run on
export const config = {
  matcher: [
    "/prediction/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/signin",
    "/signup",
  ],
};