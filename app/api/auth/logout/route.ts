import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logActivity } from '@/lib/audit';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (token) {
      const SECRET = new TextEncoder().encode(
        process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
      );
      const { payload } = await jwtVerify(token, SECRET);
      
      if (payload && payload.email) {
        logActivity({
          userId: payload.id as string,
          email: payload.email as string,
          role: payload.role as string,
          action: 'SIGN_OUT',
          details: 'User successfully ended session via logout.'
        });
      }
    }
  } catch (err) {
    // Fail silently to guarantee cookie clearance proceeds under any token state
  }

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
