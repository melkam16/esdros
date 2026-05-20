import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Create a response that redirects the user back to the login page
  const response = NextResponse.redirect(new URL('/login', req.url));

  const isLocalhost = req.headers.get('host')?.includes('localhost') || req.headers.get('host')?.includes('127.0.0.1');

  // Invalidate and delete the session token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isLocalhost,
    sameSite: 'lax',
    maxAge: 0, // Immediately expire the cookie
    path: '/',
  });

  return response;
}
