import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  if (!token) {
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  try {
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
  } catch (err) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};