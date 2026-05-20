// app/api/admin/admissions/review/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // If a student submits an application, allow creating the AdmissionApplication
    if (action === 'SUBMIT') {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userId = payload.id as string;

      const app = await prisma.admissionApplication.create({
        data: {
          userId,
          targetTrack: body.targetTrack || 'THEOLOGY',
          status: 'SUBMITTED'
        }
      });

      return NextResponse.json({ success: true, application: app });
    }

    // Admin processing (approve/reject)
    const { applicationId, track, classId } = body; // classId optional for assignment

    const updatedApp = await prisma.admissionApplication.update({
      where: { id: applicationId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
      },
    });

    if (action === 'APPROVE') {
      // Create Student profile, assign class if provided
      const student = await prisma.student.create({
        data: {
          userId: updatedApp.userId,
          status: 'ACTIVE',
          track: track || updatedApp.targetTrack || 'THEOLOGY',
          classId: classId || undefined
        },
      });

      // Auto-enroll student into available course sections for the assigned class (if classId provided)
      if (classId) {
        const courseSections = await prisma.courseSection.findMany({
          where: { course: { classId } },
        });

        for (const sec of courseSections) {
          try {
            await prisma.enrollment.create({ data: { studentId: student.id, courseSectionId: sec.id } });
          } catch (e) {
            // ignore duplicates or capacity errors here
            console.warn('Enrollment skipped or failed:', e);
          }
        }
      }
    }

    return NextResponse.json({ message: 'Application processing completed successfully.' });
  } catch (error: any) {
    console.error('Admissions review error:', error);
    return NextResponse.json({ error: 'Failed to process admission record', details: error.message }, { status: 500 });
  }
}