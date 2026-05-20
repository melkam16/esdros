// app/api/student/enrollment/request/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');

async function getStudentFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return await prisma.student.findUnique({ where: { userId: payload.id as string } });
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const student = await getStudentFromCookie();
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized or student profile not found' }, { status: 401 });
    }

    const { courseSectionId } = await req.json();
    if (!courseSectionId) {
      return NextResponse.json({ error: 'courseSectionId is required' }, { status: 400 });
    }

    const section = await prisma.courseSection.findUnique({
      where: { id: courseSectionId },
      include: { _count: { select: { enrollments: { where: { enrollmentStatus: 'APPROVED' } } } } },
    });

    if (!section) {
      return NextResponse.json({ error: 'Course section not found' }, { status: 404 });
    }

    if (section._count.enrollments >= section.capacity) {
      return NextResponse.json({ error: 'Section is at full capacity' }, { status: 409 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseSectionId: { studentId: student.id, courseSectionId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Already ${existing.enrollmentStatus.toLowerCase()} for this section` },
        { status: 409 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId: student.id, courseSectionId, enrollmentStatus: 'PENDING' },
      include: { courseSection: { include: { course: true } } },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Enrollment request submitted. Awaiting admin approval.',
        data: {
          enrollmentId: enrollment.id,
          course: enrollment.courseSection.course.title,
          status: enrollment.enrollmentStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error requesting enrollment:', error);
    return NextResponse.json({ error: 'Failed to submit enrollment request' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const student = await getStudentFromCookie();
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        courseSection: {
          include: {
            course: true,
            faculty: { include: { user: true } },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: enrollments.map((e) => ({
        id: e.id,
        courseSectionId: e.courseSectionId,
        courseCode: e.courseSection.course.code,
        courseTitle: e.courseSection.course.title,
        credits: e.courseSection.course.credits,
        faculty: `${e.courseSection.faculty.user.firstName} ${e.courseSection.faculty.user.lastName}`,
        semester: e.courseSection.semester,
        room: e.courseSection.room,
        status: e.enrollmentStatus,
        requestedAt: e.requestedAt,
        grade: e.grade,
        isLocked: e.isLocked,
      })),
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}
