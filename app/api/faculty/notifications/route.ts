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

    if (payload.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const faculty = await prisma.faculty.findUnique({
      where: { userId: payload.id as string },
      include: { user: true }
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty record not found.' }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { targetType: 'ALL_FACULTY' },
          { 
            targetType: 'DEPARTMENT', 
            targetValue: faculty.departmentId 
          },
          { 
            targetType: 'INDIVIDUAL', 
            targetValue: faculty.user.email 
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
    console.error('Error fetching faculty notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
