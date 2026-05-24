import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Helper to calculate grades letters
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

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: 'Missing required field: studentId' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
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
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const gpa = getGPA(student.enrollments);

    // Build email text content
    let courseTableText = '';
    let courseTableHtml = '';

    student.enrollments.forEach(e => {
      const credits = e.courseSection.course.credits || 3;
      const gradeLetter = e.letterGrade || getLetter(e.grade);
      const points = e.grade !== null ? e.grade.toFixed(1) : '-';

      courseTableText += `Code: ${e.courseSection.course.code} | Title: ${e.courseSection.course.title} | Credits: ${credits} | Grade: ${gradeLetter} | Score: ${points}\n`;
      
      courseTableHtml += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace;"><b>${e.courseSection.course.code}</b></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${e.courseSection.course.title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${credits}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;"><b>${gradeLetter}</b></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${points}</td>
        </tr>
      `;
    });

    if (student.enrollments.length === 0) {
      courseTableText = 'No academic records found.\n';
      courseTableHtml = '<tr><td colspan="5" style="padding: 12px; text-align: center; color: #777; font-style: italic;">No academic records found.</td></tr>';
    }

    const textContent = `
Hello ${student.user.firstName} ${student.user.lastName},

Here is your Official Academic Transcript from Esderos EOTC Theological Seminary.

ACADEMIC DOSSIER SUMMARY:
----------------------------------------
Student Candidate: ${student.user.firstName} ${student.user.lastName}
Student ID: ${student.id.substring(0, 8).toUpperCase()}
Program Track: ${student.track}
Cumulative GPA: ${gpa}
----------------------------------------

ACADEMIC RECORD DETAILS:
${courseTableText}
----------------------------------------

This document is a certified copy of the records maintained by the Registrar Office at Esderos EOTC Theological Seminary.

Best regards,
Office of the Registrar
Esderos EOTC Theological Seminary
`;

    const htmlContent = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <div style="text-align: center; border-bottom: 4px solid #009fe5; padding-bottom: 15px; margin-bottom: 20px;">
    <img src="https://esderos.eotcmk.org/seminary/pluginfile.php/1/theme_klass/logo/1651894977/logo.png" alt="Esderos EOTC Theological Seminary Logo" style="height: 70px; width: 70px; object-fit: contain; margin-bottom: 10px;" />
    <h1 style="color: #0e2a47; margin: 0; text-transform: uppercase; letter-spacing: 2px; font-size: 24px;">Esderos EOTC Theological Seminary</h1>
    <h2 style="color: #666; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Official Academic Transcript</h2>
  </div>

  <p>Hello <b>${student.user.firstName} ${student.user.lastName}</b>,</p>
  <p>Here is your official digital academic transcript issued by the registrar's office.</p>

  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Student Dossier Summary</h3>
    <table style="width: 100%; font-size: 13px;">
      <tr>
        <td style="color: #64748b; padding: 3px 0;">Student ID:</td>
        <td style="font-weight: bold; color: #0f172a; font-family: monospace;">${student.id.substring(0, 8).toUpperCase()}</td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 3px 0;">Program Track:</td>
        <td style="font-weight: bold; color: #009fe5; text-transform: uppercase;">${student.track}</td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 3px 0;">Cumulative GPA:</td>
        <td style="font-weight: bold; font-size: 16px; color: #10b981;">${gpa}</td>
      </tr>
    </table>
  </div>

  <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 5px;">Academic Record</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
    <thead>
      <tr style="background-color: #f1f5f9; color: #475569; font-weight: bold;">
        <th style="padding: 8px; text-align: left;">Code</th>
        <th style="padding: 8px; text-align: left;">Course Title</th>
        <th style="padding: 8px; text-align: center;">Credits</th>
        <th style="padding: 8px; text-align: center;">Grade</th>
        <th style="padding: 8px; text-align: right;">Score</th>
      </tr>
    </thead>
    <tbody>
      ${courseTableHtml}
    </tbody>
  </table>

  <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
    <p>This document is a certified copy of the records maintained by the Registrar Office at Esderos EOTC Theological Seminary.</p>
    <p>© ${new Date().getFullYear()} Esderos EOTC Theological Seminary. All rights reserved.</p>
  </div>
</div>
`;

    await sendEmail({
      to: student.user.email,
      subject: `Official Academic Transcript - ${student.user.firstName} ${student.user.lastName}`,
      text: textContent,
      html: htmlContent
    });

    return NextResponse.json({ success: true, message: 'Transcript emailed successfully.' });
  } catch (error) {
    console.error('Error sending transcript email:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
