import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Create a response that redirects the user back to the login page
  const response = NextResponse.redirect(new URL('/login', req.url));

  const host = req.headers.get('host') || '';
  const isLocal = host.includes('localhost') || 
                  host.includes('127.0.0.1') || 
                  host.startsWith('192.168.') || 
                  host.startsWith('10.') || 
                  /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);

  // Invalidate and delete the session token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isLocal,
    sameSite: 'lax',
    maxAge: 0, // Immediately expire the cookie
    path: '/',
  });

  return response;
}
