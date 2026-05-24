import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
// @ts-ignore
import PDFDocument from 'pdfkit';

// Helper to calculate grade letters
const getLetter = (score: number | null) => {
  if (score === null || isNaN(score)) return 'N/A';
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
};

// Helper to calculate GPA
const getGPA = (enrollments: any[]) => {
  let totalPoints = 0;
  let totalCredits = 0;
  enrollments.forEach(e => {
    if (!e.courseSection || !e.courseSection.course) return;
    const credits = e.courseSection.course.credits || 3;
    const score = e.grade;
    if (score !== null) {
      let gp = 0.0;
      if (score >= 93) gp = 4.0;
      else if (score >= 90) gp = 3.7;
      else if (score >= 87) gp = 3.3;
      else if (score >= 83) gp = 3.0;
      else if (score >= 80) gp = 2.7;
      else if (score >= 77) gp = 2.3;
      else if (score >= 73) gp = 2.0;
      else if (score >= 70) gp = 1.7;
      else if (score >= 60) gp = 1.0;
      
      totalPoints += (gp * credits);
      totalCredits += credits;
    }
  });
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return new Response('Unauthorized: Missing Session Token', { status: 401 });
    }

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
        enrollments: {
          include: {
            courseSection: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return new Response('Student profile not found', { status: 404 });
    }

    const gpa = getGPA(student.enrollments);
    const creditsEarned = student.enrollments.reduce((acc, e) => {
      if (!e.courseSection || !e.courseSection.course) return acc;
      const credits = e.courseSection.course.credits || 3;
      return acc + (e.grade !== null && e.grade >= 60 ? credits : 0);
    }, 0);

    // Create a new PDF document in memory
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const chunks: any[] = [];
    
    doc.on('data', (chunk: any) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // --- PDF DRAWING ---

    // 1. Semi-transparent rotated red background watermark
    doc.save()
       .opacity(0.12)
       .fontSize(48)
       .fillColor('#EF4444')
       .rotate(-30, { origin: [300, 380] })
       .text('UNOFFICIAL COPY', 100, 360, { align: 'center', width: 400 })
       .text('UNOFFICIAL COPY', 100, 430, { align: 'center', width: 400 })
       .restore();

    // 2. Decorative Top Blue Banner
    doc.rect(0, 0, 612, 15).fill('#009FE5');

    // 3. Institution Header Details
    doc.fillColor('#0E2A47')
       .fontSize(18)
       .text('ESDEROS EOTC THEOLOGICAL SEMINARY', 50, 40, { align: 'center', bold: true })
       .moveDown(0.2);

    doc.fillColor('#475569')
       .fontSize(10)
       .text('OFFICE OF THE REGISTRAR', { align: 'center' })
       .moveDown(0.3);

    doc.fillColor('#EF4444')
       .fontSize(11)
       .text('UNOFFICIAL ACADEMIC AUDIT & TRANSCRIPT', { align: 'center', bold: true, letterSpacing: 0.5 })
       .moveDown(1.5);

    // 4. Student Metadata Card
    doc.save()
       .rect(50, 115, 512, 90)
       .fillColor('#F8FAFC')
       .fill()
       .strokeColor('#CBD5E1')
       .lineWidth(1)
       .stroke()
       .restore();

    doc.fillColor('#0F172A')
       .fontSize(10)
       .text(`Student Candidate: ${student.user.firstName} ${student.user.lastName}`, 70, 130, { bold: true })
       .text(`Student ID: ${student.id.substring(0, 8).toUpperCase()}`, 70, 150)
       .text(`Program Track: ${student.track || 'Theological Studies'}`, 70, 170);

    doc.text(`Cumulative GPA: ${gpa}`, 350, 130)
       .text(`Credits Earned: ${creditsEarned} Credits`, 350, 150)
       .text(`Issued Date: ${new Date().toLocaleDateString()}`, 350, 170);

    // 5. Grid Table Headers
    doc.fillColor('#0F172A')
       .fontSize(10)
       .text('Course Code', 70, 235, { bold: true })
       .text('Course Title', 180, 235, { bold: true })
       .text('Credits', 380, 235, { width: 50, align: 'center', bold: true })
       .text('Grade', 440, 235, { width: 50, align: 'center', bold: true })
       .text('Score', 500, 235, { width: 50, align: 'right', bold: true });

    // Table Divider Line
    doc.strokeColor('#94A3B8')
       .lineWidth(1.5)
       .moveTo(50, 250)
       .lineTo(562, 250)
       .stroke();

    let y = 265;
    
    if (student.enrollments.length === 0) {
      doc.fillColor('#64748B')
         .text('No academic enrollment history or transcripts logged for this account.', 70, y, { italic: true });
    } else {
      student.enrollments.forEach(e => {
        // Simple page breaking safeguard if too many courses are present
        if (y > 670) {
          doc.addPage();
          
          // Re-draw watermark on next page
          doc.save()
             .opacity(0.12)
             .fontSize(48)
             .fillColor('#EF4444')
             .rotate(-30, { origin: [300, 380] })
             .text('UNOFFICIAL COPY', 100, 360, { align: 'center', width: 400 })
             .restore();
             
          y = 50;
        }

        const credits = e.courseSection.course.credits || 3;
        const gradeLetter = e.letterGrade || getLetter(e.grade);
        const points = e.grade !== null ? `${e.grade.toFixed(1)}%` : 'In Progress';

        doc.fillColor('#334155')
           .text(e.courseSection.course.code, 70, y)
           .text(e.courseSection.course.title, 180, y, { width: 190, ellipsis: true })
           .text(String(credits), 380, y, { width: 50, align: 'center' })
           .text(gradeLetter, 440, y, { width: 50, align: 'center' })
           .text(points, 500, y, { width: 50, align: 'right' });

        y += 22;
      });
    }

    // 6. Explicit Unofficial Copy Footer Landmark
    doc.strokeColor('#EF4444')
       .lineWidth(1)
       .moveTo(50, 715)
       .lineTo(562, 715)
       .stroke();

    doc.fillColor('#EF4444')
       .fontSize(10)
       .text('★ LANDMARK: UNOFFICIAL COPY — FOR INTERNAL ACADEMIC AUDIT ONLY ★', 50, 725, { align: 'center', bold: true });

    doc.end();

    const pdfBuffer = await pdfPromise;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Unofficial_Transcript_${student.user.firstName}_${student.user.lastName}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating unofficial transcript:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
