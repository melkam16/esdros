import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    // 2. Fetch authenticated user details and verify admin credentials
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id as string }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Administrative access required' }, { status: 403 });
    }

    // 3. Parse and validate request parameters
    const { firstName, lastName, email, track, classId, password } = await req.json();

    if (!firstName || !lastName || !email || !track || !classId || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, track, classId, password' },
        { status: 400 }
      );
    }

    // 4. Verify target cohort class exists
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: { department: true }
    });

    if (!targetClass) {
      return NextResponse.json({ error: 'Selected academic cohort class not found.' }, { status: 404 });
    }

    // 5. Verify email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 400 });
    }

    // 6. Hash password using sha256 (standard in this repository)
    const passwordHash = hash('sha256', password);

    // 7. Resolve department code to build sequential student ID
    const deptCode = targetClass.department?.code || (track === 'THEOLOGY' ? 'THEO' : 'GEEZ');

    // 8. Run transaction to generate clean unique ID and save user and student profiles
    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.student.count({
        where: { id: { startsWith: `${deptCode}-` } }
      });
      
      let sequentialNumber = String(count + 1).padStart(4, '0');
      let studentId = `${deptCode}-${sequentialNumber}`;
      let isUnique = false;
      let attempt = 0;
      
      while (!isUnique) {
        const existing = await tx.student.findUnique({ where: { id: studentId } });
        if (!existing) {
          isUnique = true;
        } else {
          attempt++;
          const newNum = String(count + 1 + attempt).padStart(4, '0');
          studentId = `${deptCode}-${newNum}`;
        }
      }

      // Create main User record
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash,
          role: 'STUDENT',
          mustChangePassword: true,
        }
      });

      // Create Student profile linked to user and assigned to class cohort
      const student = await tx.student.create({
        data: {
          id: studentId,
          userId: user.id,
          status: 'ACTIVE',
          track: track,
          classId: classId,
        }
      });

      return { user, student };
    });

    // 9. Centrally log manual onboarding activity in system audit trail
    logActivity({
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      action: 'ONBOARD_STUDENT',
      details: `Manually onboarded new student candidate ${firstName} ${lastName} with Student ID: ${result.student.id} assigned to class cohort ${targetClass.name} (${targetClass.code}).`
    });

    // 10. Dispatch welcome invitation credentials email containing plaintext temporary credentials
    const origin = new URL(req.url).origin;
    const { sendEmail } = await import('@/lib/mail');
    await sendEmail({
      to: email,
      subject: 'Welcome to Esderos EOTC Theological Seminary - Student Credentials',
      text: `Hello ${firstName} ${lastName},\n\nYou have been onboarded as a Student at Esderos EOTC Theological Seminary inside the ${targetClass.name} cohort.\n\nYour account credentials are:\nPortal URL: ${origin}/login\nUsername/Email: ${email}\nTemporary Password: ${password}\n\nPlease reset your password inside the settings immediately after your first login.\n\nWelcome and we look forward to supporting your theological journey.\n\nBest regards,\nRegistrar's Office\nEsderos EOTC Theological Seminary`
    }).catch(err => console.error("Onboarding email error:", err));

    return NextResponse.json({
      success: true,
      message: 'Student onboarded successfully and credentials email sent.',
      data: {
        studentId: result.student.id,
        userId: result.user.id,
        email: result.user.email,
        name: `${result.user.firstName} ${result.user.lastName}`,
        classCohort: targetClass.name,
      }
    });

  } catch (error) {
    console.error('Error onboarding student:', error);
    return NextResponse.json({ error: 'Failed to onboard student.' }, { status: 500 });
  }
}
