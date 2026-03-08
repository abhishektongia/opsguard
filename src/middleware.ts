import { NextRequest, NextResponse } from 'next/server';

// List of public routes that don't require org slug
const publicRoutes = ['/', '/login', '/signup', '/docs', '/pricing', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Allow API calls to auth endpoints without subdomain
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Extract subdomain from hostname
  // localhost:3000 -> no subdomain (dev)
  // demo.localhost:3000 -> demo
  // acme.opsguard.com -> acme
  const parts = hostname.split('.');
  let subdomain: string | null = null;

  if (hostname.includes('localhost')) {
    // Development: extract from path or query
    // For now, we'll extract from path like /demo/dashboard
    const pathParts = pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] && !pathParts[1].startsWith('api')) {
      subdomain = pathParts[1];
    }
  } else {
    // Production: extract from subdomain
    // Remove port if present
    const host = hostname.split(':')[0];
    if (host !== 'opsguard.com' && host !== 'app.opsguard.com' && parts.length > 1) {
      subdomain = parts[0];
    }
  }

  // If no subdomain found for workspace routes, redirect to login
  if (!subdomain && pathname !== '/' && !publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add subdomain to request headers for use in API routes and pages
  const requestHeaders = new Headers(request.headers);
  if (subdomain) {
    requestHeaders.set('x-org-slug', subdomain);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
