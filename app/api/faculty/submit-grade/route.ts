// app/api/faculty/submit-grade/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { enrollmentId, mark } = await req.json();

    if (!enrollmentId || mark === undefined) {
      return NextResponse.json({ error: 'Missing evaluation arguments' }, { status: 400 });
    }

    // Convert string inputs parsing from form submissions cleanly to dynamic floats
    const numericGrade = parseFloat(mark);

    // Update the targeted grading enrollment row directly
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        grade: numericGrade,
        gradedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updatedEnrollment });
  } catch (error: any) {
    console.error("Grade submit processing error:", error);
    return NextResponse.json(
      { error: 'Failed to write record to ledger.', details: error.message }, 
      { status: 500 }
    );
  }
}