import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { requestId, action } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing requestId or action' }, { status: 400 });
    }

    const request = await prisma.withdrawalRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return NextResponse.json({ error: 'Withdrawal request not found.' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: 'This withdrawal request has already been processed.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      // Begin transaction to update request and student status
      await prisma.$transaction([
        prisma.withdrawalRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' }
        }),
        prisma.student.update({
          where: { id: request.studentId },
          data: { status: 'WITHDRAWN' }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: 'Withdrawal request approved successfully. Student is now set to WITHDRAWN status in read-only mode.'
      });
    } else if (action === 'REJECT') {
      await prisma.withdrawalRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
      });

      return NextResponse.json({
        success: true,
        message: 'Withdrawal request rejected successfully.'
      });
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error processing student withdrawal request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
