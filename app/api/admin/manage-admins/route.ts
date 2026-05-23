import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Helper to verify caller is a Super Admin
async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;

  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'ADMIN' && payload.isSuperAdmin === true;
  } catch {
    return false;
  }
}

export async function GET() {
  const isSuper = await verifySuperAdmin();
  if (!isSuper) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isSuperAdmin: true,
        isStandardAdmin: true,
        createdAt: true,
        facultyProfile: {
          select: {
            id: true,
            department: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: admins }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isSuper = await verifySuperAdmin();
  if (!isSuper) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  try {
    const { firstName, lastName, email, password, isSuperAdmin, isStandardAdmin } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const passwordHash = hash('sha256', password);

    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        role: 'ADMIN',
        isSuperAdmin: !!isSuperAdmin,
        isStandardAdmin: !isSuperAdmin && !!isStandardAdmin
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isSuperAdmin: true,
        isStandardAdmin: true,
        createdAt: true
      }
    });

    const clearanceStr = isSuperAdmin 
      ? 'Full Super Admin' 
      : isStandardAdmin 
        ? 'Standard Admin' 
        : 'Restricted Admin';

    // Send email with credentials
    const { sendEmail } = await import('@/lib/mail');
    await sendEmail({
      to: email,
      subject: 'Welcome to Esdros Theological Seminary - Administrator Access Granted',
      text: `Hello ${firstName} ${lastName},\n\nYou have been added as an Administrator on the Esdros Theological Seminary platform with ${clearanceStr} clearance level.\n\nYour account credentials are:\nUsername/Email: ${email}\nTemporary Password: ${password}\n\nPlease login at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login\n\nFor security reasons, we strongly recommend resetting your password inside your settings immediately after first login.\n\nBest regards,\nEsdros Theological Seminary`
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user added successfully',
      data: newUser
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to add admin user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const isSuper = await verifySuperAdmin();
  if (!isSuper) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID parameter' }, { status: 400 });
    }

    // Prevent deleting self
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token!, JWT_SECRET);
    if (payload.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Failed to delete admin user' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const isSuper = await verifySuperAdmin();
  if (!isSuper) {
    return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  try {
    const { action, userId, departmentId, makeAdmin, isSuperAdmin, isStandardAdmin } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (action === 'toggleAdminRole') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { facultyProfile: true }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // If revoking admin, ensure they have a faculty profile so they aren't left without any profile or role
      if (!makeAdmin && !user.facultyProfile) {
        return NextResponse.json({ 
          error: 'Cannot revoke Admin access unless user has a Faculty profile connected first. Otherwise they will have no dashboard portal access.' 
        }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          role: makeAdmin ? 'ADMIN' : 'FACULTY',
          isSuperAdmin: makeAdmin ? !!isSuperAdmin : false,
          isStandardAdmin: makeAdmin ? (!isSuperAdmin && !!isStandardAdmin) : false
        }
      });

      return NextResponse.json({
        success: true,
        message: makeAdmin ? 'Admin clearance granted successfully' : 'Admin clearance revoked successfully',
        data: updated
      });
    }

    if (action === 'linkFacultyProfile') {
      if (!departmentId) {
        return NextResponse.json({ error: 'Missing departmentId' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const existingFaculty = await prisma.faculty.findUnique({ where: { userId } });
      if (existingFaculty) {
        return NextResponse.json({ error: 'Faculty profile already exists for this user' }, { status: 400 });
      }

      const faculty = await prisma.faculty.create({
        data: {
          userId,
          departmentId
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Faculty profile successfully linked to user',
        data: faculty
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error modifying user roles:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
