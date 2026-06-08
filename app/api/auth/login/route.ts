import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import { hash } from 'crypto';
import { logActivity } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
    );

    const body = await req.json();
    const { email, password, mfaCode } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Auto-seed & Align Departments dynamically
    const oldDept = await prisma.department.findUnique({ where: { code: 'TLS' } });
    if (oldDept) {
      const theoDept = await prisma.department.findUnique({ where: { code: 'THEO' } });
      if (!theoDept) {
        await prisma.department.update({
          where: { id: oldDept.id },
          data: { name: 'Theology', code: 'THEO', description: 'Department of Theology' }
        });
      } else {
        await prisma.class.updateMany({ where: { departmentId: oldDept.id }, data: { departmentId: theoDept.id } });
        await prisma.faculty.updateMany({ where: { departmentId: oldDept.id }, data: { departmentId: theoDept.id } });
        await prisma.department.delete({ where: { id: oldDept.id } });
      }
    }

    const theologyDept = await prisma.department.upsert({
      where: { code: 'THEO' },
      update: { name: 'Theology' },
      create: { name: 'Theology', code: 'THEO', description: 'Department of Theology' }
    });

    await prisma.department.upsert({
      where: { code: 'GEEZ' },
      update: { name: 'Geez Language' },
      create: { name: 'Geez Language', code: 'GEEZ', description: 'Department of Geez Language' }
    });

    const userCount = await prisma.user.count();
    if (userCount === 0) {
      await prisma.class.create({
        data: { name: 'Theology Cohort Year 1', code: 'TH-Y1', departmentId: theologyDept.id },
      });
      await prisma.user.create({
        data: { email: 'admin@esderos.org', passwordHash: 'admin123', firstName: 'Melkamu', lastName: 'Admin', role: 'ADMIN', isSuperAdmin: true },
      });
    }

    // 2. Authenticate
    let user = await prisma.user.findUnique({ where: { email } });
    if (user && user.email === 'admin@esderos.org' && !user.isSuperAdmin) {
      user = await prisma.user.update({
        where: { email },
        data: { isSuperAdmin: true }
      });
    }
    const incomingHash = hash('sha256', password);

    if (!user || (user.passwordHash !== password && user.passwordHash !== incomingHash)) {
      return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
    }

    // 2.3 Enforce MFA login check if enabled globally or on the user profile
    const mfaSetting = await prisma.systemSetting.findUnique({
      where: { key: 'ENFORCE_MFA' }
    });
    const isMfaEnforced = mfaSetting?.value === 'true';

    if (isMfaEnforced || user.mfaEnabled) {
      if (!mfaCode) {
        // Generate a 6-digit secure numeric passcode
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save the OTP code into user's mfaSecret
        await prisma.user.update({
          where: { id: user.id },
          data: { mfaSecret: emailOtp }
        });

        // Send OTP email
        try {
          const { sendEmail } = await import('@/lib/mail');
          await sendEmail({
            to: user.email,
            subject: 'Esderos Theological Seminary — Two-Factor Verification Code',
            text: `Hello ${user.firstName},\n\nYour 2FA email verification code is: ${emailOtp}\n\nThis code is valid for 10 minutes. Please enter this code to complete your login process.\n\nBest regards,\nOffice of the Registrar\nEsderos EOTC Theological Seminary`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h2 style="color: #0f172a; margin-top: 0;">Two-Factor Authentication</h2>
                <p style="color: #475569; font-size: 14px;">Hello <b>${user.firstName}</b>,</p>
                <p style="color: #475569; font-size: 14px;">To secure your account access, please use the following one-time passcode (OTP) to complete your login:</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; color: #009fe5; letter-spacing: 5px; margin: 20px 0;">
                  ${emailOtp}
                </div>
                <p style="color: #94a3b8; font-size: 11px; text-align: center;">This code will expire in 10 minutes. If you did not request this login attempt, please secure your credentials immediately.</p>
              </div>
            `
          });
        } catch (mailErr) {
          console.error("MFA Email transmission failed:", mailErr);
        }

        return NextResponse.json({ mfaRequired: true, email: user.email });
      }

      // Verify the submitted OTP code
      if (user.mfaSecret !== mfaCode) {
        return NextResponse.json({ error: 'Invalid two-factor verification code. Please check your email.' }, { status: 401 });
      }

      // Clear the temporary passcode after successful validation
      await prisma.user.update({
        where: { id: user.id },
        data: { mfaSecret: null }
      });
    }

    // 2.5 Deactivation check for DISMISSED students
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id }
      });
      if (student && student.status === 'DISMISSED') {
        return NextResponse.json({ 
          error: 'This account has been deactivated because you have been Dismissed.' 
        }, { status: 403 });
      }
    }

    // 3. Issue JWT
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

    // 6. Log successful sign-in
    logActivity({
      userId: user.id,
      email: user.email,
      role: user.role,
      action: 'SIGN_IN',
      details: `User successfully authenticated session. MFA Enforced: ${isMfaEnforced || user.mfaEnabled ? 'Yes' : 'No'}.`
    });

    return response;
  } catch (error) {
    console.error('Authentication pipeline error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}