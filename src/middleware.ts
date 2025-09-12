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

  // Very permissive CSP for debugging - this will be logged to the console
  const csp = [
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
    "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
    "style-src * 'unsafe-inline' data:;",
    "img-src * data: blob: 'unsafe-inline';",
    "connect-src * 'unsafe-inline';",
    "font-src * data:;",
    `report-uri ${reportUri}`,
    "report-to default"
  ].join(' ');

  // Set security headers
  response.headers.set('Content-Security-Policy-Report-Only', csp);
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
