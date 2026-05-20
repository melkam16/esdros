import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass authentication check for prefetch requests to prevent Vercel caching issues or redirect loops
  const isPrefetch = req.headers.get('next-router-prefetch') === '1' || 
                     req.headers.get('purpose') === 'prefetch';

  if (isPrefetch) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  if (!token) {
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  try {
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    const userRole = payload.role as string;

    if (pathname.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/unauthorized', req.url));
    }
    if (pathname.startsWith('/dashboard/faculty') && userRole !== 'FACULTY') {
      return NextResponse.redirect(new URL('/dashboard/unauthorized', req.url));
    }
    if (pathname.startsWith('/dashboard/student') && userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/dashboard/unauthorized', req.url));
    }

    return NextResponse.next();
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error("Auth Proxy Error:", errorMsg);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMsg)}`, req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
