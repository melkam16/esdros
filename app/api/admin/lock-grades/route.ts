import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { sectionId } = await req.json();

    const updated = await prisma.enrollment.updateMany({
      where: {
        courseSectionId: sectionId,
        grade: { not: null },
        isLocked: false,
      },
      data: {
        isLocked: true,
        lockedAt: new Date(),
      },
    });

    return NextResponse.json({ message: `Successfully locked ${updated.count} student records.` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to lock records' }, { status: 500 });
  }
}