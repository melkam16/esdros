import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email, action } = await req.json();

    if (!email || !action) {
      return NextResponse.json({ error: 'Missing required fields: email, action' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to prevent email enumeration, but add details
      return NextResponse.json({ success: true, message: 'If the email exists in our records, instructions have been sent.' });
    }

    if (action === 'password') {
      // Generate a temporary 8-character password
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@';
      let tempPassword = '';
      for (let i = 0; i < 8; i++) {
        tempPassword += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const passwordHash = hash('sha256', tempPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });

      // Send password reset email
      await sendEmail({
        to: user.email,
        subject: 'Institutional Account Password Reset',
        text: `Hello ${user.firstName} ${user.lastName},\n\nYou requested a password reset for your institutional account on Esdros Theological Seminary.\n\nYour temporary password has been successfully generated:\nTemporary Password: ${tempPassword}\n\nPlease login using this temporary password at:\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login\n\nFor security reasons, you must update your password inside your Profile/Settings page immediately after logging in.\n\nBest regards,\nIT Support Desk\nEsdros Theological Seminary`
      });

      return NextResponse.json({
        success: true,
        message: 'A temporary password has been sent to your email.'
      });
    }

    if (action === 'mfa') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: false,
          mfaSecret: null
        }
      });

      // Send MFA reset notification
      await sendEmail({
        to: user.email,
        subject: 'Institutional Account MFA Status Reset',
        text: `Hello ${user.firstName} ${user.lastName},\n\nYou requested an MFA reset for your account on Esdros Theological Seminary.\n\nYour Multi-Factor Authentication (MFA) has been successfully deactivated. You can now login using just your password.\n\nLogin URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login\n\nTo keep your account secure, please re-enable MFA from your Student/Faculty profile settings at your earliest convenience.\n\nIf you did not request this change, please contact the IT Helpdesk immediately.\n\nBest regards,\nIT Support Desk\nEsdros Theological Seminary`
      });

      return NextResponse.json({
        success: true,
        message: 'Your Multi-Factor Authentication has been reset. A confirmation email has been sent.'
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error) {
    console.error('Password/MFA Reset Request Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
