import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    if (payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden: Students only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    // Fetch the Student profile
    const student = await prisma.student.findUnique({
      where: { userId: payload.id as string }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    if (student.status === 'WITHDRAWN' || student.status === 'DISMISSED') {
      return NextResponse.json({ error: 'Your account is already deactivated.' }, { status: 400 });
    }

    // Set Student status to WITHDRAWN
    await prisma.student.update({
      where: { id: student.id },
      data: { status: 'WITHDRAWN' }
    });

    // Create a dynamic system log or note in the database if necessary, or just return success
    return NextResponse.json({
      success: true,
      message: 'Withdrawal processed successfully. Your session will terminate and your institutional account is now deactivated.'
    });

  } catch (error: any) {
    console.error('Error processing student withdrawal request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
