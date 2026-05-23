import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { studentId, status } = await req.json();

    if (!studentId || !status) {
      return NextResponse.json({ error: 'Missing studentId or status' }, { status: 400 });
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // Update status
    await prisma.student.update({
      where: { id: studentId },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: `Student status successfully updated to ${status}.`
    });

  } catch (error: any) {
    console.error('Error updating student status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
