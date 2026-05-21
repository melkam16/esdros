import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import { hash } from 'crypto';

export async function POST(req: Request) {
  try {
    const SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
    );

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Auto-seed: create default admin if DB is empty
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const defaultDept = await prisma.department.create({
        data: { name: 'Department of Theology & Language Studies', code: 'TLS', description: 'Core seed department.' },
      });
      await prisma.class.create({
        data: { name: 'Theology Cohort Year 1', code: 'TH-Y1', departmentId: defaultDept.id },
      });
      await prisma.user.create({
        data: { email: 'admin@esdros.org', passwordHash: 'admin123', firstName: 'Melkamu', lastName: 'Admin', role: 'ADMIN', isSuperAdmin: true },
      });
    }

    // 2. Authenticate
    let user = await prisma.user.findUnique({ where: { email } });
    if (user && user.email === 'admin@esdros.org' && !user.isSuperAdmin) {
      user = await prisma.user.update({
        where: { email },
        data: { isSuperAdmin: true }
      });
    }
    const incomingHash = hash('sha256', password);

    if (!user || (user.passwordHash !== password && user.passwordHash !== incomingHash)) {
      return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
    }

    // 3. Issue JWT
    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role, isSuperAdmin: user.isSuperAdmin })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(SECRET);

    // 4. Detect local environment (HTTP) to skip secure flag
    const host = req.headers.get('host') || '';
    const isLocal =
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);

    // 5. Set cookie directly on the response object — this is the ONLY reliable way
    //    to guarantee Set-Cookie is serialized into the HTTP response on all runtimes.
    const response = NextResponse.json({ role: user.role });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !isLocal,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours in seconds (matches JWT expiration)
    });

    return response;
  } catch (error) {
    console.error('Authentication pipeline error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}