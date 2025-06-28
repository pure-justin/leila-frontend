import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.firebase.app https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://api.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com;",
};

// Protected API routes
const protectedApiRoutes = [
  '/api/admin',
  '/api/contractor',
  '/api/bookings',
  '/api/payments',
  '/api/users',
];

// Rate limit configuration
const rateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: {
    api: 60,
    auth: 5,
    public: 100,
  },
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // API route protection
  if (pathname.startsWith('/api')) {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `${clientIp}:${pathname}`;
    
    if (!checkRateLimit(rateLimitKey, pathname)) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(getRateLimitMax(pathname)),
          'X-RateLimit-Remaining': '0',
        },
      });
    }

    // CORS protection for API routes
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://heyleila.com',
      'https://www.heyleila.com',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
    ].filter(Boolean);

    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Check for API key or authentication for protected routes
    if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
      const authHeader = request.headers.get('authorization');
      const apiKey = request.headers.get('x-api-key');

      if (!authHeader && !apiKey) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // Validate API key format
      if (apiKey && !isValidApiKeyFormat(apiKey)) {
        return new NextResponse('Invalid API Key', { status: 401 });
      }
    }

    // Log suspicious requests
    if (isSuspiciousRequest(request)) {
      console.warn('[SECURITY] Suspicious request detected:', {
        ip: clientIp,
        path: pathname,
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      });
    }
  }

  // Prevent clickjacking on auth pages
  if (pathname.startsWith('/auth') || pathname.startsWith('/login')) {
    response.headers.set('X-Frame-Options', 'DENY');
  }

  return response;
}

function checkRateLimit(key: string, pathname: string): boolean {
  const now = Date.now();
  const limit = getRateLimitMax(pathname);
  
  const record = rateLimitStore.get(key);
  
  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + rateLimitConfig.windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

function getRateLimitMax(pathname: string): number {
  if (pathname.includes('/auth') || pathname.includes('/login')) {
    return rateLimitConfig.maxRequests.auth;
  }
  if (pathname.startsWith('/api')) {
    return rateLimitConfig.maxRequests.api;
  }
  return rateLimitConfig.maxRequests.public;
}

function isValidApiKeyFormat(apiKey: string): boolean {
  // Check for proper format (e.g., "sk_live_" or "pk_live_" for Stripe)
  const validPatterns = [
    /^sk_(test|live)_[a-zA-Z0-9]{24,}$/,
    /^pk_(test|live)_[a-zA-Z0-9]{24,}$/,
    /^[a-f0-9]{32}$/, // Generic 32-char hex
    /^[A-Za-z0-9+/]{43}=$/, // Base64 encoded
  ];
  
  return validPatterns.some(pattern => pattern.test(apiKey));
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    /\.\./g, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /eval\(/i, // Code injection
    /base64_decode/i, // PHP injection
    /\/etc\/passwd/i, // System file access
    /\.env/i, // Environment file access
  ];
  
  // Check URL
  if (suspiciousPatterns.some(pattern => pattern.test(pathname))) {
    return true;
  }
  
  // Check for bot/scanner user agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /sqlmap/i,
    /nikto/i,
    /scanner/i,
    /nmap/i,
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return true;
  }
  
  return false;
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