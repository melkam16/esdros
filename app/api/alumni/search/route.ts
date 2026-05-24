import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const firstName = searchParams.get('firstName') || '';
    const lastName = searchParams.get('lastName') || '';

    if (!firstName.trim() && !lastName.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Query graduated students matching first and/or last name
    const graduates = await prisma.student.findMany({
      where: {
        status: 'GRADUATED',
        user: {
          AND: [
            firstName.trim() ? { firstName: { contains: firstName.trim(), mode: 'insensitive' } } : {},
            lastName.trim() ? { lastName: { contains: lastName.trim(), mode: 'insensitive' } } : {}
          ]
        }
      },
      include: {
        user: true,
        enrollments: {
          where: { enrollmentStatus: 'APPROVED' },
          include: {
            courseSection: true
          }
        }
      }
    });

    const results = graduates.map(g => {
      // Extract graduation year from enrollment semester (e.g., "Legacy 2025" or parse from email / enrollDate)
      let year = '2025'; // Fallback default
      let foundYear = false;
      for (const e of g.enrollments) {
        if (e.courseSection.semester && e.courseSection.semester.includes('Legacy')) {
          const numMatch = e.courseSection.semester.match(/\d{4}/);
          if (numMatch) {
            year = numMatch[0];
            foundYear = true;
            break;
          }
        }
      }
      if (!foundYear) {
        // Fallback: parse from email if email format is "first.last.year@domain.com"
        const match = g.user.email.match(/\.(\d{4})@/);
        if (match) {
          year = match[1];
        } else {
          // Fallback to enrollment date year
          year = new Date(g.enrollDate).getFullYear().toString();
        }
      }

      return {
        id: g.id,
        firstName: g.user.firstName,
        lastName: g.user.lastName,
        yearOfGraduation: year,
        program: g.track === 'THEOLOGY' ? 'Theology' : 'Geez Language'
      };
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Alumni Search Error:', error);
    return NextResponse.json({ error: 'Failed to search graduated students' }, { status: 500 });
  }
}
