import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mobileRedirectMiddleware } from './middleware/mobileRedirect';

export function middleware(request: NextRequest) {
  // Handle mobile redirection
  const mobileResponse = mobileRedirectMiddleware(request);
  if (mobileResponse.status === 307) { // Redirect response
    return mobileResponse;
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};