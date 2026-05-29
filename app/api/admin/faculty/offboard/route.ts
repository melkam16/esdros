import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logActivity } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const { facultyId } = await req.json();

    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID required' }, { status: 400 });
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: { user: true }
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 });
    }

    if (faculty.user.lastName.includes('(Offboarded)')) {
      return NextResponse.json({ error: 'Already offboarded' }, { status: 400 });
    }

    // Authenticate user session to identify who is performing the offboarding
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let actorId = undefined;
    let actorEmail = 'admin@esderos.org';
    let actorRole = 'ADMIN';

    if (token) {
      try {
        const SECRET = new TextEncoder().encode(
          process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
        );
        const { payload } = await jwtVerify(token, SECRET);
        actorId = payload.id as string;
        actorEmail = payload.email as string;
        actorRole = payload.role as string;
      } catch (authErr) {
        console.warn('Silent auth warning inside offboard endpoint:', authErr);
      }
    }

    // Prefix last name to signify archival and free up the email address
    const originalName = `${faculty.user.firstName} ${faculty.user.lastName}`;
    const newLastName = `(Offboarded) ${faculty.user.lastName}`;
    const newEmail = `archived_${Date.now()}_${faculty.user.email}`;
    // Scramble password hash to immediately revoke login access
    const newHash = hash('sha256', Math.random().toString(36).substring(2, 15));

    await prisma.user.update({
      where: { id: faculty.user.id },
      data: {
        lastName: newLastName,
        email: newEmail,
        passwordHash: newHash
      }
    });

    // Log the offboarding action to system audit logs
    logActivity({
      userId: actorId,
      email: actorEmail,
      role: actorRole,
      action: 'OFFBOARD_FACULTY',
      details: `Successfully offboarded and archived faculty member ${originalName} (ID: ${faculty.id}).`
    });

    return NextResponse.json({ success: true, message: 'Faculty successfully offboarded and archived.' });
  } catch (error: any) {
    console.error('Error offboarding faculty:', error);
    return NextResponse.json({ error: 'Failed to offboard faculty' }, { status: 500 });
  }
}
