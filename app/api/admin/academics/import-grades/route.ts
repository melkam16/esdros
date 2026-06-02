// app/api/admin/academics/import-grades/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { sectionId, grades } = await req.json();
    if (!sectionId || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters or empty grades list' }, { status: 400 });
    }

    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: {
        course: true,
        faculty: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Course Section not found' }, { status: 404 });
    }

    // Helper to calculate grade letters
    const getLetter = (score: number) => {
      if (score >= 97) return 'A+';
      if (score >= 93) return 'A';
      if (score >= 90) return 'A-';
      if (score >= 87) return 'B+';
      if (score >= 83) return 'B';
      if (score >= 80) return 'B-';
      if (score >= 77) return 'C+';
      if (score >= 73) return 'C';
      if (score >= 70) return 'C-';
      if (score >= 60) return 'D';
      return 'F';
    };

    // DB Transaction for batch updating grades safely
    await prisma.$transaction(
      grades.map((item: { enrollmentId: string; mark: number }) => {
        const letter = getLetter(item.mark);
        return prisma.enrollment.update({
          where: { id: item.enrollmentId },
          data: {
            grade: item.mark,
            letterGrade: letter,
            gradedAt: new Date(),
          },
        });
      })
    );

    // Administrative audit logging
    await prisma.activityLog.create({
      data: {
        userId: payload.id as string,
        email: payload.email as string,
        role: 'ADMIN',
        action: 'IMPORT_GRADES',
        details: `Imported term grades for ${grades.length} students in course section ${section.course.code} (Taught by ${section.faculty.user.firstName} ${section.faculty.user.lastName})`,
      },
    });

    return NextResponse.json({ success: true, count: grades.length });
  } catch (error: any) {
    console.error('Import grades API error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred', details: error.message },
      { status: 500 }
    );
  }
}
