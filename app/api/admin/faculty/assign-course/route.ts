// app/api/admin/faculty/assign-course/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { facultyId, courseId, semester, room, capacity } = await req.json();

    // Validate required fields
    if (!facultyId || !courseId || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields: facultyId, courseId, semester' },
        { status: 400 }
      );
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: { user: true, department: true },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { class: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if assignment already exists for this faculty, course, and semester
    const existingSection = await prisma.courseSection.findFirst({
      where: {
        facultyId,
        courseId,
        semester,
      },
    });

    if (existingSection) {
      return NextResponse.json(
        { error: 'This faculty member is already assigned to this course for this semester' },
        { status: 400 }
      );
    }

    // Create course section (assignment)
    const section = await prisma.courseSection.create({
      data: {
        courseId,
        facultyId,
        semester,
        room: room || null,
        capacity: capacity || 40,
      },
      include: {
        course: true,
        faculty: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    // Send email to assigned faculty
    const origin = new URL(req.url).origin;
    const { sendEmail } = await import('@/lib/mail');
    await sendEmail({
      to: section.faculty.user.email,
      subject: `Academic Notice: Course Assigned - ${section.course.title}`,
      text: `Hello Professor ${section.faculty.user.firstName} ${section.faculty.user.lastName},\n\nYou have been assigned to instruct a course section at Esderos EOTC Theological Seminary.\n\nCOURSE DETAILS:\n----------------------------------------\nCourse Name: ${section.course.title}\nCourse Code: ${section.course.code}\nSemester: ${section.semester}\nClassroom/Room: ${section.room || 'TBD'}\nCapacity: ${section.capacity}\nCredits: ${section.course.credits}\n----------------------------------------\n\nYou can access your class roster, marked attendance, and grading dashboard inside the Faculty Portal:\nPortal URL: ${origin}/login\n\nIf you have any questions or require administrative support, please contact the Academic Dean office.\n\nBest regards,\nOffice of Academic Affairs\nEsderos EOTC Theological Seminary`
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Course assigned to faculty successfully',
        data: {
          sectionId: section.id,
          courseTitle: section.course.title,
          courseCode: section.course.code,
          facultyName: `${section.faculty.user.firstName} ${section.faculty.user.lastName}`,
          department: section.faculty.department.name,
          semester: section.semester,
          room: section.room,
          capacity: section.capacity,
          enrollments: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error assigning course:', error);
    return NextResponse.json(
      { error: 'Failed to assign course to faculty' },
      { status: 500 }
    );
  }
}

// Get all course assignments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get('facultyId');

    let query: any = {};
    if (facultyId) {
      query.where = { facultyId };
    }

    const sections = await prisma.courseSection.findMany({
      where: {
        facultyId: facultyId ? facultyId : undefined,
        NOT: {
          semester: {
            contains: 'Legacy',
            mode: 'insensitive'
          }
        }
      },
      include: {
        course: {
          include: {
            class: true,
          },
        },
        faculty: {
          include: {
            user: true,
            department: true,
          },
        },
        enrollments: true,
      },
      orderBy: [{ semester: 'desc' }, { course: { title: 'asc' } }],
    });

    const formatted = sections.map((section) => ({
      id: section.id,
      courseId: section.courseId,
      courseTitle: section.course.title,
      courseCode: section.course.code,
      credits: section.course.credits,
      track: section.course.track,
      facultyId: section.facultyId,
      facultyName: `${section.faculty.user.firstName} ${section.faculty.user.lastName}`,
      facultyEmail: section.faculty.user.email,
      department: section.faculty.department.name,
      semester: section.semester,
      room: section.room,
      capacity: section.capacity,
      currentEnrollment: section.enrollments.length,
      enrollmentPercentage: Math.round((section.enrollments.length / section.capacity) * 100),
    }));

    return NextResponse.json({ success: true, data: formatted }, { status: 200 });
  } catch (error) {
    console.error('Error fetching course assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course assignments' },
      { status: 500 }
    );
  }
}

// DELETE - Remove course assignment
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');

    if (!sectionId) {
      return NextResponse.json(
        { error: 'Missing sectionId parameter' },
        { status: 400 }
      );
    }

    // Check if section exists
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: {
        enrollments: true,
        course: true,
        faculty: {
          include: { user: true },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Course section not found' }, { status: 404 });
    }

    // Prevent deletion if there are active enrollments
    if (section.enrollments.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete course assignment with active enrollments',
          enrollmentCount: section.enrollments.length,
        },
        { status: 409 }
      );
    }

    // Delete the section
    await prisma.courseSection.delete({ where: { id: sectionId } });

    return NextResponse.json(
      {
        success: true,
        message: 'Course assignment removed successfully',
        data: {
          removedCourse: section.course.title,
          removedFrom: `${section.faculty.user.firstName} ${section.faculty.user.lastName}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting course assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove course assignment' },
      { status: 500 }
    );
  }
}
