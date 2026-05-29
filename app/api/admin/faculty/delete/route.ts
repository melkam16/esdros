// app/api/admin/faculty/delete/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get('facultyId');

    if (!facultyId) {
      return NextResponse.json(
        { error: 'Missing facultyId parameter' },
        { status: 400 }
      );
    }

    // 1. Authenticate user session
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    // 2. Fetch authenticated user details and verify Super Admin clearance
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id as string }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Administrative access required' }, { status: 403 });
    }

    if (!dbUser.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: Super Admin privilege required' }, { status: 403 });
    }

    // 3. Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        user: true,
        sections: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 });
    }

    // 4. Verify that the faculty member is archived (offboarded)
    // Archived faculty have '(Offboarded)' in their lastName
    const isOffboarded = faculty.user.lastName.includes('(Offboarded)');
    if (!isOffboarded) {
      return NextResponse.json(
        { error: 'Forbidden: Only offboarded and archived faculty members can be permanently deleted.' },
        { status: 400 }
      );
    }

    // 5. Delete the faculty, attendances, course sections, and associated user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete all attendances marked by this faculty member (markedById points to Faculty)
      // to avoid breaking the foreign key constraint on Attendance -> Faculty (no cascade)
      await tx.attendance.deleteMany({
        where: { markedById: facultyId },
      });

      // Delete all course sections taught by this faculty member
      // Note: CourseSection cascades delete to Enrollment and Attendance in that section
      await tx.courseSection.deleteMany({
        where: { facultyId },
      });

      // Delete faculty profile
      const deletedFaculty = await tx.faculty.delete({
        where: { id: facultyId },
      });

      // Delete user account
      await tx.user.delete({
        where: { id: faculty.userId },
      });

      return deletedFaculty;
    });

    // Invalidate the faculty management page cache in Next.js App Router
    revalidatePath('/dashboard/admin/faculty');

    return NextResponse.json(
      {
        success: true,
        message: 'Faculty member and all associated records have been permanently deleted from the system.',
        data: {
          deletedFacultyId: result.id,
          deletedName: `${faculty.user.firstName} ${faculty.user.lastName.replace('(Offboarded) ', '')}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return NextResponse.json(
      { error: 'Failed to delete faculty member' },
      { status: 500 }
    );
  }
}
