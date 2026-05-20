import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
