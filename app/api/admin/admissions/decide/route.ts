// app/api/admin/admissions/decide/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { applicationId, decision, classId, reviewNotes } = await req.json();

    if (!applicationId || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, decision' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision value' }, { status: 400 });
    }

    const application = await prisma.admissionApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status === 'APPROVED' || application.status === 'REJECTED') {
      return NextResponse.json(
        { error: `Application has already been ${application.status.toLowerCase()}` },
        { status: 409 }
      );
    }

    // APPROVAL PATH — requires classId, creates Student profile
    if (decision === 'APPROVED') {
      if (!classId) {
        // Auto-pick first class matching the track if no classId provided
        const autoClass = await prisma.class.findFirst({
          where: { department: { classes: { some: {} } } },
        });
        // If still none, require classId
        if (!autoClass) {
          return NextResponse.json(
            { error: 'classId is required for approval — no class found for this track' },
            { status: 400 }
          );
        }
      }

      const targetClassId = classId || (
        await prisma.class.findFirst()
      )?.id;

      if (!targetClassId) {
        return NextResponse.json(
          { error: 'No class available for assignment. Please create a class first.' },
          { status: 400 }
        );
      }

      // Check if student profile already exists (re-approval guard)
      const existingStudent = await prisma.student.findUnique({
        where: { userId: application.userId },
      });

      const result = await prisma.$transaction(async (tx) => {
        const updatedApp = await tx.admissionApplication.update({
          where: { id: applicationId },
          data: { status: 'APPROVED', reviewedAt: new Date(), reviewNotes: reviewNotes || null },
        });

        let student = existingStudent;
        if (!student) {
          student = await tx.student.create({
            data: {
              userId: application.userId,
              status: 'ACTIVE',
              track: application.targetTrack,
              classId: targetClassId,
            },
          });
        }

        return { application: updatedApp, student };
      });

      return NextResponse.json({
        success: true,
        message: 'Application approved. Student profile created.',
        data: {
          applicationId: result.application.id,
          studentId: result.student?.id,
          status: result.application.status,
        },
      });
    }

    // REJECTED or UNDER_REVIEW
    const updatedApp = await prisma.admissionApplication.update({
      where: { id: applicationId },
      data: {
        status: decision as 'REJECTED' | 'UNDER_REVIEW',
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Application ${decision === 'REJECTED' ? 'rejected' : 'marked as under review'}.`,
      data: { applicationId: updatedApp.id, status: updatedApp.status },
    });
  } catch (error) {
    console.error('Error processing admissions decision:', error);
    return NextResponse.json({ error: 'Failed to process decision' }, { status: 500 });
  }
}

// GET all applications with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where = status ? { status: status as 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' } : {};

    const applications = await prisma.admissionApplication.findMany({
      where,
      include: { user: true },
      orderBy: { submittedAt: 'desc' },
    });

    const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });

    return NextResponse.json({
      success: true,
      data: applications.map((app) => ({
        id: app.id,
        userId: app.userId,
        applicantName: `${app.user.firstName} ${app.user.lastName}`,
        email: app.user.email,
        targetTrack: app.targetTrack,
        status: app.status,
        submittedAt: app.submittedAt,
        reviewedAt: app.reviewedAt,
        reviewNotes: app.reviewNotes,
        phone: app.phone,
        statement: app.statement,
      })),
      classes: classes.map((c) => ({ id: c.id, name: c.name, code: c.code })),
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
