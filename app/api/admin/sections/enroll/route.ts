import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { studentId, courseSectionId } = body;

    // If studentId not provided, derive from JWT token (self-service enrollment)
    if (!studentId) {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userId = payload.id as string;
      const student = await prisma.student.findUnique({ where: { userId } });
      if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      studentId = student.id;
    }

    // Ensure section has remaining capacity before processing enrollment allocation
    const section = await prisma.courseSection.findUnique({
      where: { id: courseSectionId },
      include: { _count: { select: { enrollments: true } } }
    });

    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    if (section._count.enrollments >= section.capacity) {
      return NextResponse.json({ error: 'Section limit reached. Allocation denied.' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseSectionId }
    });

    return NextResponse.json({ success: true, data: enrollment });
  } catch (error: any) {
    return NextResponse.json({ error: 'Student is already mapped to this section context.' }, { status: 500 });
  }
}