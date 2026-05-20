// app/api/faculty/portal/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request: Request) {
  try {
    // Get faculty ID from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    // Get faculty profile with assigned courses
    const faculty = await prisma.faculty.findFirst({
      where: { userId },
      include: {
        user: true,
        department: true,
        sections: {
          include: {
            course: true,
            enrollments: {
              where: { enrollmentStatus: 'APPROVED' },
              include: {
                student: {
                  include: {
                    user: true,
                    class: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'Dashboard';
    const sectionId = searchParams.get('sectionId');

    // If sectionId provided, return just that section's approved students for attendance
    if (sectionId) {
      const targetSection = faculty.sections.find(s => s.id === sectionId);
      if (!targetSection) {
        return NextResponse.json({ error: 'Section not found or not assigned to you' }, { status: 404 });
      }
      return NextResponse.json({
        students: targetSection.enrollments.map(e => ({
          studentId: e.student.id,
          studentName: `${e.student.user.firstName} ${e.student.user.lastName}`,
          email: e.student.user.email,
        })),
        total: targetSection.enrollments.length,
      });
    }

    // Extract basic data
    const courses = faculty.sections.map(s => ({
      id: s.course.id,
      title: s.course.title,
      code: s.course.code,
      track: s.course.track,
      credits: s.course.credits,
      sectionId: s.id,
      semester: s.semester,
      room: s.room,
      capacity: s.capacity,
      enrolledCount: s.enrollments.length,
      courseCode: s.course.code,
      courseTitle: s.course.title,
    }));

    const students = faculty.sections.flatMap(s =>
      s.enrollments.map(e => ({
        id: e.student.id,
        studentId: e.student.id,
        enrollmentId: e.id,
        name: `${e.student.user.firstName} ${e.student.user.lastName}`,
        studentName: `${e.student.user.firstName} ${e.student.user.lastName}`,
        email: e.student.user.email,
        track: e.student.track,
        grade: e.grade,
        status: e.student.status,
        courseCode: s.course.code,
        courseName: s.course.title
      }))
    );

    switch (section) {
      case 'Dashboard':
        return NextResponse.json({
          summary: {
            totalSections: faculty.sections.length,
            totalStudents: students.length,
            totalCourses: new Set(courses.map(c => c.id)).size,
            department: faculty.department.name
          },
          sections: courses,
          students: students.slice(0, 5) // Recent students
        });

      case 'My Courses':
        return NextResponse.json({
          courses,
          total: courses.length
        });

      case 'Students':
        return NextResponse.json({
          students,
          total: students.length,
          byCourse: Object.groupBy(students, s => s.courseCode)
        });

      case 'Attendance':
      case 'Gradebook':
        return NextResponse.json({
          students,
          courses,
          sections: faculty.sections
        });

      case 'Schedule':
        return NextResponse.json({
          schedule: faculty.sections.map(s => ({
            course: s.course.code,
            title: s.course.title,
            semester: s.semester,
            room: s.room || 'TBA',
            capacity: s.capacity,
            enrolled: s.enrollments.length
          }))
        });

      case 'Messages':
        return NextResponse.json({
          threads: [
            { id: '1', sender: 'Admin Terminal', snippet: 'Please submit final grades.', date: 'Today' },
            { id: '2', sender: 'Student Portal', snippet: 'Grade dispute notification.', date: 'Yesterday' }
          ]
        });

      case 'Reports':
        return NextResponse.json({
          metrics: {
            courseMetrics: courses.map(c => ({
              code: c.code,
              title: c.title,
              enrolled: c.enrolledCount,
              average: 85 + Math.random() * 10
            })),
            averageGrade: 85.5,
            totalEnrolled: students.length
          }
        });

      default:
        return NextResponse.json({
          courses,
          students,
          sections: faculty.sections
        });
    }
  } catch (error: any) {
    console.error("Faculty Portal API Error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch faculty data', details: error.message },
      { status: 500 }
    );
  }
}
