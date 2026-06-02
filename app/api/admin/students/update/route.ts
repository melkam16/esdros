import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/audit';

export async function PATCH(req: Request) {
  try {
    // 1. Authenticate administrative session
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Administrative clearance required.' }, { status: 403 });
    }

    // 2. Parse request payload
    const body = await req.json();
    const { studentId, firstName, lastName, email, phone, bio, status, track, classId } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Missing required parameter: studentId' }, { status: 400 });
    }

    // 3. Find target student and associated user
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, class: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // 4. Validate email uniqueness if email is modified
    if (email && email.toLowerCase() !== student.user.email.toLowerCase()) {
      const emailDup = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (emailDup) {
        return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 400 });
      }
    }

    // 5. Validate class assignment if cohort is updated
    let targetClass = null;
    if (classId && classId.trim() !== '' && classId !== student.classId) {
      targetClass = await prisma.class.findUnique({
        where: { id: classId }
      });
      if (!targetClass) {
        return NextResponse.json({ error: 'Selected academic cohort class not found.' }, { status: 404 });
      }
    }

    // 6. Execute synchronization via database transactions
    const updated = await prisma.$transaction(async (tx) => {
      // Build user updates
      const userUpdates: any = {};
      if (firstName !== undefined) userUpdates.firstName = firstName.trim();
      if (lastName !== undefined) userUpdates.lastName = lastName.trim();
      if (email !== undefined) userUpdates.email = email.toLowerCase().trim();

      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id: student.userId },
          data: userUpdates
        });
      }

      // Build student updates
      const studentUpdates: any = {};
      if (phone !== undefined) studentUpdates.phone = phone.trim();
      if (bio !== undefined) studentUpdates.bio = bio.trim();
      if (status !== undefined) studentUpdates.status = status;
      if (track !== undefined) studentUpdates.track = track;
      if (classId !== undefined) {
        studentUpdates.classId = (classId && classId.trim() !== '') ? classId : null;
      }

      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: studentUpdates,
        include: {
          user: true,
          class: { include: { department: true } }
        }
      });

      return updatedStudent;
    });

    // 7. Log modification details inside the system activity audit log
    const changedFields: string[] = [];
    if (firstName && firstName !== student.user.firstName) changedFields.push(`First Name (${student.user.firstName} -> ${firstName})`);
    if (lastName && lastName !== student.user.lastName) changedFields.push(`Last Name (${student.user.lastName} -> ${lastName})`);
    if (email && email !== student.user.email) changedFields.push(`Email (${student.user.email} -> ${email})`);
    if (phone && phone !== student.phone) changedFields.push(`Phone (${student.phone || 'none'} -> ${phone})`);
    if (status && status !== student.status) changedFields.push(`Status (${student.status} -> ${status})`);
    if (track && track !== student.track) changedFields.push(`Track (${student.track} -> ${track})`);
    if (classId !== undefined && classId !== student.classId) {
      const oldName = student.class?.name || 'Unassigned';
      const newName = updated.class?.name || 'Unassigned';
      changedFields.push(`Cohort Class (${oldName} -> ${newName})`);
    }

    logActivity({
      userId: payload.id as string,
      email: payload.email as string,
      role: payload.role as string,
      action: 'UPDATE_STUDENT',
      details: `Manually modified student record for ${updated.user.firstName} ${updated.user.lastName} (ID: ${studentId}). Modifications: ${changedFields.join(', ') || 'No fields changed'}`
    });

    return NextResponse.json({
      success: true,
      message: 'Student record successfully updated.',
      data: updated
    });

  } catch (error: any) {
    console.error('Error updating student manual override:', error);
    return NextResponse.json({ error: 'Failed to process student updates', details: error.message }, { status: 500 });
  }
}
