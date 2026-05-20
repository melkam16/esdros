// app/api/faculty/attendance/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function getFacultyFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    return await prisma.faculty.findUnique({ where: { userId: payload.id as string } });
  } catch {
    return null;
  }
}

// POST — submit attendance records for a section on a given date
export async function POST(req: Request) {
  try {
    const faculty = await getFacultyFromCookie();
    if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseSectionId, date, records } = await req.json();
    // records: Array<{ studentId: string; status: 'PRESENT'|'ABSENT'|'EXCUSED'; notes?: string }>

    if (!courseSectionId || !date || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'courseSectionId, date, and records[] are required' },
        { status: 400 }
      );
    }

    const section = await prisma.courseSection.findUnique({ where: { id: courseSectionId } });
    if (!section) {
      return NextResponse.json({ error: 'Course section not found' }, { status: 404 });
    }
    if (section.facultyId !== faculty.id) {
      return NextResponse.json({ error: 'Forbidden — this section is not assigned to you' }, { status: 403 });
    }

    const attendanceDate = new Date(date);

    // Upsert each attendance record
    const results = await Promise.all(
      records.map(async (r: { studentId: string; status: string; notes?: string }) => {
        return prisma.attendance.upsert({
          where: {
            studentId_courseSectionId_date: {
              studentId: r.studentId,
              courseSectionId,
              date: attendanceDate,
            },
          },
          update: {
            status: r.status as 'PRESENT' | 'ABSENT' | 'EXCUSED',
            notes: r.notes || null,
            markedById: faculty.id,
          },
          create: {
            studentId: r.studentId,
            courseSectionId,
            date: attendanceDate,
            status: r.status as 'PRESENT' | 'ABSENT' | 'EXCUSED',
            notes: r.notes || null,
            markedById: faculty.id,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `Attendance recorded for ${results.length} student(s).`,
      data: { date: attendanceDate, count: results.length },
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}

// GET — fetch attendance for a section, optionally filtered by date
export async function GET(req: Request) {
  try {
    const faculty = await getFacultyFromCookie();
    if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseSectionId = searchParams.get('courseSectionId');
    const date = searchParams.get('date');

    if (!courseSectionId) {
      return NextResponse.json({ error: 'courseSectionId is required' }, { status: 400 });
    }

    const where: { courseSectionId: string; date?: Date } = { courseSectionId };
    if (date) where.date = new Date(date);

    const records = await prisma.attendance.findMany({
      where,
      include: { student: { include: { user: true } } },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: records.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        studentName: `${r.student.user.firstName} ${r.student.user.lastName}`,
        date: r.date,
        status: r.status,
        notes: r.notes,
      })),
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
