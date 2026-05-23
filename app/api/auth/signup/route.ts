import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import { hash } from 'crypto';
import { generateSecret, verifyTotp } from '@/lib/totp';

function validatePassword(password: string): string | null {
  if (password.length <= 7) {
    return 'Password must be more than 7 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number (0-9).';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character (e.g. !, @, #, $, etc.).';
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
    );

    const body = await req.json();
    const { email, password, mfaSecret, mfaCode } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ success: false, error: passwordError }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active invitation found. Please contact the Registrar Office if you are an enrolled student.' 
      }, { status: 404 });
    }

    // Verify user role
    if (user.role !== 'STUDENT') {
      return NextResponse.json({ 
        success: false, 
        error: 'Sign up page is dedicated to student enrollment accounts.' 
      }, { status: 403 });
    }

    // Check if password hash is set to the invited state
    if (user.passwordHash !== '__INVITED__') {
      return NextResponse.json({ 
        success: false, 
        error: 'This account has already completed setup. Please sign in directly on the login portal.' 
      }, { status: 400 });
    }

    // Stage 1: If MFA verification is not provided, trigger the MFA setup phase
    if (!mfaSecret || !mfaCode) {
      const totpData = generateSecret(user.email);
      return NextResponse.json({
        success: true,
        step: 'mfa_setup',
        secret: totpData.secret,
        qrCodeDataUrl: totpData.qrCodeDataUrl
      });
    }

    // Stage 2: Verify TOTP verification code
    const isTotpValid = verifyTotp(mfaCode, mfaSecret);
    if (!isTotpValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Authenticator code. Please check your app and try again.' 
      }, { status: 400 });
    }

    // Hash and store the new password and enable MFA permanently
    const newHash = hash('sha256', password.trim());
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash: newHash,
        mfaSecret: mfaSecret,
        mfaEnabled: true
      }
    });

    // Create JWT Token
    const token = await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      isSuperAdmin: user.isSuperAdmin,
      isStandardAdmin: user.isStandardAdmin 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(SECRET);

    // Detect environment
    const host = req.headers.get('host') || '';
    const isLocal =
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      host.startsWith('192.168.') ||
      host.startsWith('10.');

    // Prepare Response and Set secure HTTP-only Cookie
    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !isLocal,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Sign Up API Handler Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
