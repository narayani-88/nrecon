import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CSP Report endpoint to collect violation reports
const reportUri = '/api/csp-violation';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Skip API routes and static files
  if (request.nextUrl.pathname.startsWith('/api') || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.includes('.')) {
    return response;
  }

  // Generate a unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Add the nonce to the response headers so it can be used in _document.tsx
  response.headers.set('x-nonce', nonce);
  
  // Define the CSP with nonce and required sources
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // More permissive CSP for development
  const csp = [
    // Base restrictions
    `default-src 'self' ${isDevelopment ? '*' : 'https://nrecon.netlify.app'}`,
    
    // Scripts - very permissive for development
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: ${isDevelopment ? '*' : ''}`,
    `script-src-elem 'self' 'unsafe-inline' https: http: ${isDevelopment ? '*' : ''}`,
    
    // Styles - allow all for development
    `style-src 'self' 'unsafe-inline' https: http: ${isDevelopment ? '*' : ''}`,
    `style-src-elem 'self' 'unsafe-inline' https: http: ${isDevelopment ? '*' : ''}`,
    
    // Fonts and images
    `font-src 'self' data: https: http: ${isDevelopment ? '*' : ''}`,
    `img-src 'self' data: blob: https: http: ${isDevelopment ? '*' : ''}`,
    
    // Connections
    `connect-src 'self' https: wss: http: ${isDevelopment ? '*' : ''}`,
    
    // Other
    `frame-src 'self' https: http: ${isDevelopment ? '*' : ''}`,
    `media-src 'self' blob: data: https: http: ${isDevelopment ? '*' : ''}`,
    `worker-src 'self' blob: ${isDevelopment ? '*' : ''}`,
    `child-src 'self' blob: ${isDevelopment ? '*' : ''}`,
    `object-src '${isDevelopment ? 'self' : 'none'}'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    // Temporarily removed upgrade-insecure-requests for local development
    // `upgrade-insecure-requests`
  ].join(' ');

  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Report-To', JSON.stringify({
    group: 'default',
    max_age: 10886400,
    endpoints: [{ url: reportUri }],
    include_subdomains: true
  }));

  // Log CSP headers for debugging
  console.log('CSP Header Set:', csp);

  return response;
}

// Match all routes except API routes and static files
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:ico|svg|png|jpg|jpeg|gif|webp|css|js|woff2?|ttf|eot|map|json)$).*)',
    },
  ],
};
