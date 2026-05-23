// app/api/admin/enrollments/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all enrollment requests (optionally filtered by status)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where = status
      ? { enrollmentStatus: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'DROPPED' }
      : {};

    const enrollments = await prisma.enrollment.findMany({
      where: {
        ...where,
        student: {
          status: {
            notIn: ['GRADUATED', 'DISMISSED', 'WITHDRAWN']
          }
        }
      },
      include: {
        student: { include: { user: true } },
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
        studentId: e.studentId,
        studentName: `${e.student.user.firstName} ${e.student.user.lastName}`,
        studentEmail: e.student.user.email,
        track: e.student.track,
        courseCode: e.courseSection.course.code,
        courseTitle: e.courseSection.course.title,
        credits: e.courseSection.course.credits,
        semester: e.courseSection.semester,
        faculty: `${e.courseSection.faculty.user.firstName} ${e.courseSection.faculty.user.lastName}`,
        room: e.courseSection.room,
        status: e.enrollmentStatus,
        requestedAt: e.requestedAt,
        decidedAt: e.decidedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching enrollment requests:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollment requests' }, { status: 500 });
  }
}

// PATCH — approve or reject an enrollment request
export async function PATCH(req: Request) {
  try {
    const { enrollmentId, decision } = await req.json();

    if (!enrollmentId || !decision) {
      return NextResponse.json(
        { error: 'enrollmentId and decision are required' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json({ error: 'decision must be APPROVED or REJECTED' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        courseSection: { include: { _count: { select: { enrollments: { where: { enrollmentStatus: 'APPROVED' } } } } } },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    if (enrollment.enrollmentStatus !== 'PENDING') {
      return NextResponse.json(
        { error: `Enrollment is already ${enrollment.enrollmentStatus.toLowerCase()}` },
        { status: 409 }
      );
    }

    // Capacity check on approval
    if (decision === 'APPROVED') {
      if (enrollment.courseSection._count.enrollments >= enrollment.courseSection.capacity) {
        return NextResponse.json({ error: 'Section is at full capacity' }, { status: 409 });
      }
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        enrollmentStatus: decision,
        decidedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Enrollment ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully.`,
      data: { enrollmentId: updated.id, status: updated.enrollmentStatus },
    });
  } catch (error) {
    console.error('Error processing enrollment decision:', error);
    return NextResponse.json({ error: 'Failed to process decision' }, { status: 500 });
  }
}
