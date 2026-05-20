import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';

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

    // Prefix last name to signify archival and free up the email address
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

    return NextResponse.json({ success: true, message: 'Faculty successfully offboarded and archived.' });
  } catch (error: any) {
    console.error('Error offboarding faculty:', error);
    return NextResponse.json({ error: 'Failed to offboard faculty' }, { status: 500 });
  }
}
