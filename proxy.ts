import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Cloudflare Security Layer Check
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  const isProd = process.env.NODE_ENV === 'production';

  // Ensure requests route through Cloudflare in production
  if (isProd && !cfConnectingIp) {
    console.warn(`[Cloudflare Security Block] Direct request detected on path: ${pathname}`);
    return new NextResponse(
      JSON.stringify({ 
        error: "Direct access forbidden. All requests must route through the Cloudflare security layer." 
      }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  // Detect background Next.js internal prefetch links
  const isPrefetch = req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('purpose') === 'prefetch';

  const token = req.cookies.get('token')?.value;

  // Helper to apply standard security headers
  const addSecurityHeaders = (res: NextResponse) => {
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data: https://esderos.eotcmk.org; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );
    return res;
  };

  // Helper to safely navigate unauthorized dropouts without poisoning router page cache stores
  const handleUnauthorized = (destinationPath: string, clearCookie = false) => {
    let response;
    if (isPrefetch) {
      response = NextResponse.next();
      response.headers.set('x-middleware-redirect', new URL(destinationPath, req.url).toString());
      response.headers.set('x-middleware-cache', 'no-cache');
    } else {
      response = NextResponse.redirect(new URL(destinationPath, req.url));
      response.headers.set('x-middleware-cache', 'no-cache');
    }
    
    if (clearCookie) {
      // Invalidate the invalid/expired session cookie immediately
      response.cookies.set('token', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
      });
    }
    
    return addSecurityHeaders(response);
  };

  // 2. Core Token Validation Check
  if (!token) {
    console.log("Auth Proxy: Token missing for path:", pathname);
    if (pathname.startsWith('/dashboard')) {
      return handleUnauthorized('/login');
    }
    return addSecurityHeaders(NextResponse.next());
  }

  try {
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    const userRole = payload.role as string;

    // 3. Comprehensive Role Hierarchy Matrix Matchers (Includes subpages via startsWith)
    if (pathname.startsWith('/dashboard/admin')) {
      if (userRole !== 'ADMIN') {
        return handleUnauthorized('/dashboard/unauthorized');
      }
      const isSuper = payload.isSuperAdmin as boolean;
      const superOnlyPaths = [
        '/dashboard/admin/finance',
        '/dashboard/admin/settings',
        '/dashboard/admin/reports',
        '/dashboard/admin/manage-admins'
      ];
      if (superOnlyPaths.some(p => pathname.startsWith(p)) && !isSuper) {
        console.log("Auth Proxy: Non-super-admin blocked from path:", pathname);
        return handleUnauthorized('/dashboard/unauthorized');
      }
    }
    if (pathname.startsWith('/dashboard/faculty') && userRole !== 'FACULTY' && userRole !== 'ADMIN') {
      return handleUnauthorized('/dashboard/unauthorized');
    }
    if (pathname.startsWith('/dashboard/student') && userRole !== 'STUDENT') {
      return handleUnauthorized('/dashboard/unauthorized');
    }

    return addSecurityHeaders(NextResponse.next());
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Auth Proxy Validation Error for path:", pathname, "-", errorMsg);

    return handleUnauthorized(`/login?error=${encodeURIComponent(errorMsg)}`, true);
  }
}

// Intercept wildcard catchers for all dashboards, logins, program views, etc.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/apply',
    '/programs/:path*',
    '/alumni',
  ],
};