import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { archiveYear } = await req.json();
    if (!archiveYear) {
      return NextResponse.json({ error: 'Archive year required' }, { status: 400 });
    }

    // Find all applications that don't start with the archive tag
    const activeApps = await prisma.admissionApplication.findMany({
      where: {
        NOT: {
          reviewNotes: {
            startsWith: '[ARCHIVED_'
          }
        }
      }
    });

    if (activeApps.length === 0) {
      return NextResponse.json({ error: 'No active applications to archive.' }, { status: 400 });
    }

    const archivePrefix = `[ARCHIVED_${archiveYear}] `;

    // Update each application
    await prisma.$transaction(
      activeApps.map(app => 
        prisma.admissionApplication.update({
          where: { id: app.id },
          data: { reviewNotes: archivePrefix + (app.reviewNotes || '') }
        })
      )
    );

    return NextResponse.json({ success: true, count: activeApps.length });
  } catch (error: any) {
    console.error("Archive Error:", error);
    return NextResponse.json({ error: 'Failed to archive admissions pipeline' }, { status: 500 });
  }
}
