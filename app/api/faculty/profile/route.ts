import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as string;

    const faculty = await prisma.faculty.findUnique({
      where: { userId },
      include: {
        user: true,
        department: true,
        sections: {
          include: {
            enrollments: true
          }
        }
      }
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });
    }

    // Aggregate statistics
    const activeCourses = faculty.sections.length;
    const totalStudents = faculty.sections.reduce((acc, section) => acc + section.enrollments.length, 0);

    return NextResponse.json({
      success: true,
      data: {
        firstName: faculty.user.firstName,
        lastName: faculty.user.lastName,
        email: faculty.user.email,
        departmentName: faculty.department.name,
        departmentCode: faculty.department.code,
        activeCourses,
        totalStudents,
      }
    });

  } catch (error) {
    console.error('Error fetching faculty profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
