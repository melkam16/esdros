// app/api/student/attendance/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    const student = await prisma.student.findUnique({ where: { userId: payload.id as string } });
    if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: {
        courseSection: {
          include: { course: true, faculty: { include: { user: true } } },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Group by courseSection
    const grouped: Record<string, {
      sectionId: string;
      courseCode: string;
      courseTitle: string;
      faculty: string;
      semester: string;
      total: number;
      present: number;
      absent: number;
      excused: number;
      records: { date: string; status: string; notes: string | null }[];
    }> = {};

    for (const a of attendances) {
      const key = a.courseSectionId;
      if (!grouped[key]) {
        grouped[key] = {
          sectionId: a.courseSectionId,
          courseCode: a.courseSection.course.code,
          courseTitle: a.courseSection.course.title,
          faculty: a.courseSection.faculty ? `${a.courseSection.faculty.user.firstName} ${a.courseSection.faculty.user.lastName}` : 'TBD',
          semester: a.courseSection.semester,
          total: 0,
          present: 0,
          absent: 0,
          excused: 0,
          records: [],
        };
      }
      grouped[key].total++;
      if (a.status === 'PRESENT') grouped[key].present++;
      if (a.status === 'ABSENT') grouped[key].absent++;
      if (a.status === 'EXCUSED') grouped[key].excused++;
      grouped[key].records.push({
        date: a.date.toISOString(),
        status: a.status,
        notes: a.notes,
      });
    }

    const summary = Object.values(grouped).map((g) => ({
      ...g,
      attendanceRate: g.total > 0 ? Math.round(((g.present + g.excused) / g.total) * 100) : 100,
    }));

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
