import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { hash } from 'crypto';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Session has expired.' }, { status: 401 });
    }

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as string;

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both current password and new password are required.' }, { status: 400 });
    }

    // Retrieve user credentials
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Account credentials not found.' }, { status: 404 });
    }

    // Validate current password
    const currentHash = hash('sha256', currentPassword.trim());
    if (currentHash !== user.passwordHash) {
      return NextResponse.json({ error: 'The current password you provided is incorrect.' }, { status: 400 });
    }

    // Validate new password security strength rules
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passRegex.test(newPassword)) {
      return NextResponse.json({ 
        error: 'Password combination rules: must be more than 7 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      }, { status: 400 });
    }

    // Hash and update password
    const newHash = hash('sha256', newPassword.trim());
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash }
    });

    return NextResponse.json({
      success: true,
      message: 'Your account password has been updated successfully!'
    });

  } catch (error: any) {
    console.error('Password Change Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred while processing password change.' }, { status: 500 });
  }
}
