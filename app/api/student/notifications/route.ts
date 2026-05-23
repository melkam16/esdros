import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    if (payload.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Load student profile details
    const student = await prisma.student.findUnique({
      where: { userId: payload.id as string },
      include: {
        user: true,
        class: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // Query notifications directed to this student specifically or their cohorts/groups
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { targetType: 'ALL_STUDENTS' },
          { 
            targetType: 'BATCH', 
            targetValue: student.classId 
          },
          { 
            targetType: 'DEPARTMENT', 
            targetValue: student.class.departmentId 
          },
          { 
            targetType: 'INDIVIDUAL', 
            targetValue: student.user.email 
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: notifications
    });

  } catch (error: any) {
    console.error('Error fetching student notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
