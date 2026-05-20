// app/api/admissions/apply/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, targetTrack, phone, address, statement } =
      await req.json();

    if (!firstName || !lastName || !email || !password || !targetTrack) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, password, targetTrack' },
        { status: 400 }
      );
    }

    if (!['THEOLOGY', 'GEEZ_LANGUAGE'].includes(targetTrack)) {
      return NextResponse.json({ error: 'Invalid targetTrack value' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = hash('sha256', password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, firstName, lastName, passwordHash, role: 'STUDENT' },
      });

      const application = await tx.admissionApplication.create({
        data: {
          userId: user.id,
          targetTrack,
          status: 'SUBMITTED',
          phone: phone || null,
          address: address || null,
          statement: statement || null,
        },
      });

      return { user, application };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully. You will be contacted once reviewed.',
        data: {
          applicationId: result.application.id,
          email: result.user.email,
          name: `${result.user.firstName} ${result.user.lastName}`,
          status: result.application.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
