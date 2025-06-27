import { NextRequest, NextResponse } from 'next/server';

// App Store and Play Store URLs (update with your actual app IDs when published)
const APP_STORE_URL = 'https://apps.apple.com/app/leila-home-services/id6747648334';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.heyleila.homeservice';

// Custom URL scheme for deep linking
const APP_SCHEME = 'leila://';

interface MobileDetection {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isTablet: boolean;
}

export function detectMobile(userAgent: string): MobileDetection {
  const ua = userAgent.toLowerCase();
  
  const isIOS = /iphone|ipod/.test(ua) || (/ipad/.test(ua) && 'ontouchend' in globalThis);
  const isAndroid = /android/.test(ua);
  const isTablet = /ipad|android(?!.*mobile)/.test(ua);
  const isMobile = (isIOS || isAndroid) && !isTablet;
  
  return {
    isMobile,
    isIOS,
    isAndroid,
    isTablet
  };
}

export function mobileRedirectMiddleware(request: NextRequest) {
  // Skip if it's an API route, static file, or special Next.js route
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // Has file extension
    pathname === '/mobile-redirect' // Prevent redirect loop
  ) {
    return NextResponse.next();
  }

  // Check if user has opted to continue to web version
  const cookies = request.cookies;
  const preferWeb = cookies.get('prefer-web-version');
  if (preferWeb?.value === 'true') {
    return NextResponse.next();
  }

  // Detect mobile device
  const userAgent = request.headers.get('user-agent') || '';
  const { isMobile, isIOS, isAndroid } = detectMobile(userAgent);

  // Only redirect phones, not tablets
  if (!isMobile) {
    return NextResponse.next();
  }

  // Check if it's a deep link that should open in app
  const deepLinkPaths = [
    '/booking/',
    '/service/',
    '/contractor/',
    '/profile',
    '/chat/'
  ];

  const shouldDeepLink = deepLinkPaths.some(path => pathname.startsWith(path));

  // Create the redirect URL
  const redirectUrl = new URL('/mobile-redirect', request.url);
  
  // Add query parameters for the redirect page
  redirectUrl.searchParams.set('platform', isIOS ? 'ios' : 'android');
  redirectUrl.searchParams.set('returnUrl', pathname);
  
  if (shouldDeepLink) {
    redirectUrl.searchParams.set('deepLink', `${APP_SCHEME}${pathname}`);
  }

  // Add store URLs
  redirectUrl.searchParams.set('storeUrl', isIOS ? APP_STORE_URL : PLAY_STORE_URL);

  return NextResponse.redirect(redirectUrl);
}

// Smart banner configuration for app promotion
export const smartBannerConfig = {
  ios: {
    appId: '6747648334',
    affiliateData: '', // Optional affiliate data
    appArgument: '' // Optional deep link argument
  },
  android: {
    appId: 'com.heyleila.homeservice',
    iconUrl: '/icon-192x192.png',
    appName: 'Leila - Home Services'
  }
};