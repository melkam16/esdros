import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { hash } from 'crypto';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      phone: student.phone || '',
      bio: student.bio || '',
      pictureUrl: student.pictureUrl || '',
      status: student.status
    });

  } catch (error: any) {
    console.error('Error fetching student settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as string;

    const { firstName, lastName, phone, bio, pictureUrl, password } = await req.json();

    const student = await prisma.student.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    if (student.status === 'WITHDRAWN') {
      return NextResponse.json({ error: 'Read-Only Mode: Withdrawn student profiles cannot be edited.' }, { status: 403 });
    }

    // Prepare User updates
    const userUpdateData: any = {};
    if (firstName) userUpdateData.firstName = firstName.trim();
    if (lastName) userUpdateData.lastName = lastName.trim();
    if (password) {
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passRegex.test(password)) {
        return NextResponse.json({ 
          error: 'Password combination rules: must be more than 7 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.' 
        }, { status: 400 });
      }
      userUpdateData.passwordHash = hash('sha256', password.trim());
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData
      });
    }

    // Update Student details
    await prisma.student.update({
      where: { userId },
      data: {
        phone: phone !== undefined ? phone.trim() : null,
        bio: bio !== undefined ? bio.trim() : null,
        pictureUrl: pictureUrl !== undefined ? pictureUrl.trim() : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error: any) {
    console.error('Error saving student settings:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
