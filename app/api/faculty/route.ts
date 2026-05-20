// app/api/faculty/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        department: true,
        sections: {
          include: {
            course: true,
          },
        },
      },
    });

    // Transform and filter only active (non-offboarded) faculty members
    const activeFaculty = faculty
      .map((f) => ({
        id: f.id,
        name: `${f.user.firstName} ${f.user.lastName}`,
        email: f.user.email,
        department: f.department.name,
        departmentId: f.department.id,
        courses: Array.from(new Set(f.sections.map((s) => s.course.title))),
      }))
      .filter((f) => !f.name.toLowerCase().includes('(offboarded)'));

    return NextResponse.json(
      {
        success: true,
        data: activeFaculty,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching public faculty directory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faculty members for directory.' },
      { status: 500 }
    );
  }
}
