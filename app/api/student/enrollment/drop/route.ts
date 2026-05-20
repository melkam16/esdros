// app/api/student/enrollment/drop/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const student = await prisma.student.findUnique({ where: { userId: payload.id as string } });
    if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const enrollmentId = searchParams.get('enrollmentId');
    if (!enrollmentId) {
      return NextResponse.json({ error: 'enrollmentId is required' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }
    if (enrollment.studentId !== student.id) {
      return NextResponse.json({ error: 'Forbidden — this is not your enrollment' }, { status: 403 });
    }
    if (enrollment.isLocked) {
      return NextResponse.json({ error: 'Cannot drop — grades are locked for this enrollment' }, { status: 409 });
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { enrollmentStatus: 'DROPPED' },
    });

    return NextResponse.json({ success: true, message: 'Enrollment dropped successfully.' });
  } catch (error) {
    console.error('Error dropping enrollment:', error);
    return NextResponse.json({ error: 'Failed to drop enrollment' }, { status: 500 });
  }
}
