import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { hash } from 'crypto';
import { logActivity } from '@/lib/audit';
import { sendEmail } from '@/lib/mail';

function generateTemporaryPassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*?';
  
  // Select at least one from each category to fulfill validatePassword constraints
  const u = uppercase[Math.floor(Math.random() * uppercase.length)];
  const l = lowercase[Math.floor(Math.random() * lowercase.length)];
  const n = numbers[Math.floor(Math.random() * numbers.length)];
  const s = symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with a mixture to get length > 7 (e.g. 10 chars total)
  const all = uppercase + lowercase + numbers + symbols;
  let rest = '';
  for (let i = 0; i < 6; i++) {
    rest += all[Math.floor(Math.random() * all.length)];
  }
  
  const combined = u + l + n + s + rest;
  // Simple shuffle
  return combined.split('').sort(() => Math.random() - 0.5).join('');
}

export async function POST(req: Request) {
  try {
    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Target User ID is required' }, { status: 400 });
    }

    // 1. Authenticate user session
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    // 2. Fetch authenticated user details and verify admin clearance
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id as string }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden: Administrative access required' }, { status: 403 });
    }

    // 3. Find the target student/faculty user record to reset
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Target user record not found' }, { status: 404 });
    }

    if (targetUser.role !== 'STUDENT' && targetUser.role !== 'FACULTY') {
      return NextResponse.json({ success: false, error: 'Forbidden: Password resets are restricted to student and faculty profiles' }, { status: 403 });
    }

    // 4. Generate temporary password and encrypt
    const tempPassword = generateTemporaryPassword();
    const passwordHash = hash('sha256', tempPassword);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { passwordHash }
    });

    // 5. Send notification email
    const emailText = `Hello ${targetUser.firstName},\n\nAn administrator has reset your password for the Esdros Seminary Student Information System.\n\nYour temporary password is:\n${tempPassword}\n\nPlease sign in using this password and change it immediately inside your settings page.\n\nBlessings,\nEsdros Seminary IT Administration`;
    
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 25px; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; font-weight: 800;">Esdros Seminary IT Support</h2>
        <p>Hello <strong>${targetUser.firstName} ${targetUser.lastName}</strong>,</p>
        <p>An administrator has successfully reset your login password for the Esdros Seminary portal.</p>
        
        <div style="background-color: #fef3c7; border: 1px dashed #f59e0b; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #b45309; tracking-wider: 1px;">Temporary Credential</p>
          <strong style="color: #92400e; font-size: 24px; font-family: monospace; letter-spacing: 2px;">${tempPassword}</strong>
        </div>
        
        <p style="font-weight: 600; color: #1e293b;">Please log in with this temporary password and update it immediately in your user settings panel to secure your account.</p>
        
        <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #64748b;">
          <p style="margin: 0;">This is an automated administrative notification. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const mailResult = await sendEmail({
      to: targetUser.email,
      subject: 'Esdros Portal - Temporary Password Reset Notification',
      text: emailText,
      html: emailHtml
    });

    // 6. Log event to system audit logs
    logActivity({
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      action: 'RESET_PASSWORD',
      details: `Administratively reset password and sent temporary credentials to ${targetUser.role.toLowerCase()} ${targetUser.firstName} ${targetUser.lastName} (${targetUser.email}) via ${mailResult.mode}`
    });

    return NextResponse.json({
      success: true,
      message: `Password reset successfully. A temporary password has been sent to ${targetUser.email}.`,
      mailMode: mailResult.mode
    });

  } catch (error: any) {
    console.error('Administrative Password Reset Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
