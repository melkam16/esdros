// app/api/admin/faculty/add/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, departmentId, password } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !departmentId || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, departmentId, password' },
        { status: 400 }
      );
    }

    // Check if department exists
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Hash password using crypto
    const passwordHash = hash('sha256', password);

    // Create User and Faculty in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash,
          role: 'FACULTY',
        },
      });

      const faculty = await tx.faculty.create({
        data: {
          userId: user.id,
          departmentId,
        },
      });

      return { user, faculty };
    });

    // Send email with credentials
    const { sendEmail } = await import('@/lib/mail');
    await sendEmail({
      to: email,
      subject: 'Welcome to Esdros Seminary - Faculty Credentials',
      text: `Hello ${firstName} ${lastName},\n\nYou have been added as a Faculty Member on the Esdros Seminary platform inside ${department.name}.\n\nYour account credentials are:\nUsername/Email: ${email}\nTemporary Password: ${password}\n\nPlease login at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login\n\nFor security reasons, we strongly recommend resetting your password inside your settings immediately after first login.\n\nBest regards,\nEsdros Theological Seminary`
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Faculty member added successfully',
        data: {
          facultyId: result.faculty.id,
          userId: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName} ${result.user.lastName}`,
          department: department.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding faculty:', error);
    return NextResponse.json(
      { error: 'Failed to add faculty member' },
      { status: 500 }
    );
  }
}

// Get all faculty members
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

    return NextResponse.json(
      {
        success: true,
        data: faculty.map((f) => ({
          id: f.id,
          userId: f.user.id,
          name: `${f.user.firstName} ${f.user.lastName}`,
          email: f.user.email,
          department: f.department.name,
          departmentId: f.department.id,
          courseSections: f.sections.length,
          courses: f.sections.map((s) => s.course.title),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faculty members' },
      { status: 500 }
    );
  }
}
