import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the response to modify headers
  const response = NextResponse.next();
  
  // Only set CSP in production
  if (process.env.NODE_ENV === 'production') {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    
    // Set CSP header
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://nrecon.netlify.app`,
      "script-src-elem 'self' 'unsafe-inline' https://nrecon.netlify.app",
      "style-src 'self' 'unsafe-inline'",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://nrecon.netlify.app",
      "font-src 'self' data: https://fonts.gstatic.com https://nrecon.netlify.app",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://nrecon.netlify.app",
      "frame-src 'self' https://nrecon.netlify.app",
      "media-src 'self' blob: data: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');

    // Set security headers
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
