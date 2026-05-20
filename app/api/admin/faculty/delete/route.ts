// app/api/admin/faculty/delete/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Check if faculty exists
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

    // Check if faculty has active course sections with enrollments
    const activeSections = faculty.sections.filter((s) => s.enrollments.length > 0);
    if (activeSections.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete faculty member with active course enrollments',
          activeCourses: activeSections.length,
        },
        { status: 409 }
      );
    }

    // Delete the faculty and associated user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete all course sections first
      await tx.courseSection.deleteMany({
        where: { facultyId },
      });

      // Delete faculty
      const deletedFaculty = await tx.faculty.delete({
        where: { id: facultyId },
      });

      // Delete user
      await tx.user.delete({
        where: { id: faculty.userId },
      });

      return deletedFaculty;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Faculty member deleted successfully',
        data: {
          deletedFacultyId: result.id,
          deletedName: `${faculty.user.firstName} ${faculty.user.lastName}`,
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
