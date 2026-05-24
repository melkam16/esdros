import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

// Helper to verify caller is an authorized Admin
async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role === 'ADMIN') {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

// 1. Submit Request (Publically accessible from Alumni Portal)
export async function POST(req: Request) {
  try {
    const { type, name, email, phone, details } = await req.json();

    if (!type || !name || !email) {
      return NextResponse.json({ error: 'Missing required parameters (type, name, email)' }, { status: 400 });
    }

    if (type !== 'TRANSCRIPT' && type !== 'CONTINUOUS_EDUCATION') {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    const newRequest = await prisma.alumniRequest.create({
      data: {
        type,
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        details: details ? details.trim() : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Request logged successfully inside academic records console.',
      data: newRequest
    });

  } catch (error: any) {
    console.error('Alumni Request Submission Error:', error);
    return NextResponse.json({ error: 'Failed to record request' }, { status: 500 });
  }
}

// 2. Fetch Requests (Admin Only)
export async function GET() {
  const adminCaller = await verifyAdmin();
  if (!adminCaller) {
    return NextResponse.json({ error: 'Forbidden: Admin clearance required' }, { status: 403 });
  }

  try {
    const requests = await prisma.alumniRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching alumni requests:', error);
    return NextResponse.json({ error: 'Failed to query database records' }, { status: 500 });
  }
}

// 3. Update Request Status (Admin Only)
export async function PATCH(req: Request) {
  const adminCaller = await verifyAdmin();
  if (!adminCaller) {
    return NextResponse.json({ error: 'Forbidden: Admin clearance required' }, { status: 403 });
  }

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status state' }, { status: 400 });
    }

    const updatedRequest = await prisma.alumniRequest.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: `Request status successfully updated to ${status}.`,
      data: updatedRequest
    });
  } catch (error: any) {
    console.error('Error updating request status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update request state' }, { status: 500 });
  }
}
