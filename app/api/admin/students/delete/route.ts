import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/audit';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId parameter' }, { status: 400 });
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

    // 3. Find the student record to get the associated userId
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // 4. Perform deletion in a safe Prisma transaction
    await prisma.$transaction(async (tx) => {
      // Delete any AdmissionApplication records associated with this student's userId
      // to avoid breaking the foreign key constraint on User -> AdmissionApplication (no cascade)
      await tx.admissionApplication.deleteMany({
        where: { userId: student.userId }
      });

      // Delete the User record
      // The Student profile has onDelete: Cascade, which cascades to:
      // Enrollment, Invoice, Attendance, Grade, and WithdrawalRequest
      await tx.user.delete({
        where: { id: student.userId }
      });
    });

    // Invalidate the transcripts dashboard page cache in Next.js App Router
    revalidatePath('/dashboard/admin/transcripts');

    // Log deletion event to system audit logs
    logActivity({
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      action: 'DELETE_STUDENT',
      details: `Permanently deleted student record for ${student.user.firstName} ${student.user.lastName} (ID: ${student.id}) and all associated academic data.`
    });

    return NextResponse.json({
      success: true,
      message: 'Student record and all associated academic data have been permanently deleted from the system.',
      data: {
        deletedStudentId: student.id,
        deletedName: `${student.user.firstName} ${student.user.lastName}`
      }
    });

  } catch (error: any) {
    console.error('Error deleting student record:', error);
    return NextResponse.json({ error: 'Failed to delete student record' }, { status: 500 });
  }
}
