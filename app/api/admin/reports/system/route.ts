import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
// @ts-ignore
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return new Response('Unauthorized: Missing Session Token', { status: 401 });
    }

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    const userRole = payload.role as string;

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return new Response('Forbidden: Admin access only', { status: 403 });
    }

    // 1. Gather all system statistics
    const [
      activeStudents,
      graduatedStudents,
      totalStudents,
      totalFaculty,
      theologyStudents,
      geezStudents,
      totalCourses,
      invoices,
      totalApplications
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.student.count({ where: { status: 'GRADUATED' } }),
      prisma.student.count(),
      prisma.faculty.count(),
      prisma.student.count({ where: { track: 'THEOLOGY' } }),
      prisma.student.count({ where: { track: 'GEEZ_LANGUAGE' } }),
      prisma.course.count(),
      prisma.invoice.findMany(),
      prisma.admissionApplication.count()
    ]);

    const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalPaid = invoices.reduce((acc, inv) => acc + (inv.status === 'PAID' ? inv.amount : 0), 0);
    const outstandingBalance = totalInvoiced - totalPaid;

    // Fetch premium fonts dynamically from Cloudflare CDN
    const [regRes, boldRes] = await Promise.all([
      fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf'),
      fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf')
    ]);

    if (!regRes.ok || !boldRes.ok) {
      throw new Error(`Failed to load pdf fonts: reg=${regRes.status}, bold=${boldRes.status}`);
    }

    const regBuffer = Buffer.from(await regRes.arrayBuffer());
    const boldBuffer = Buffer.from(await boldRes.arrayBuffer());

    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const chunks: any[] = [];
    
    doc.on('data', (chunk: any) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    doc.registerFont('Roboto-Regular', regBuffer);
    doc.registerFont('Roboto-Bold', boldBuffer);
    doc.font('Roboto-Regular');

    // --- PDF DRAWING ---
    
    // Top border accent
    doc.rect(0, 0, 612, 15).fill('#0E2A47');

    // Header
    doc.fillColor('#0E2A47')
       .fontSize(20)
       .font('Roboto-Bold')
       .text('ESDEROS EOTC THEOLOGICAL SEMINARY', 50, 40, { align: 'center' })
       .moveDown(0.2);

    doc.fillColor('#009FE5')
       .fontSize(11)
       .font('Roboto-Bold')
       .text('SYSTEM ADMINISTRATION EXECUTIVE OVERVIEW REPORT', { align: 'center' })
       .moveDown(0.5);

    doc.fillColor('#64748B')
       .fontSize(8)
       .font('Roboto-Regular')
       .text(`Generated: ${new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })} | Authorized Admin Session`, { align: 'center' })
       .moveDown(1.5);

    // Decorative Horizontal Rule
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, 95).lineTo(562, 95).stroke();

    // 1. EXECUTIVE METRICS GRID
    doc.fillColor('#0E2A47')
       .fontSize(12)
       .font('Roboto-Bold')
       .text('I. Institutional Core Metrics Summary', 50, 115)
       .moveDown(0.6);

    // Draw grid cards
    const startY = 135;
    const colWidth = 120;
    const cardHeight = 55;

    // Student Card
    doc.rect(50, startY, colWidth, cardHeight).fill('#F8FAFC');
    doc.rect(50, startY, 4, cardHeight).fill('#0E2A47');
    doc.fillColor('#475569').fontSize(7).font('Roboto-Bold').text('ACTIVE STUDENTS', 62, startY + 10);
    doc.fillColor('#0E2A47').fontSize(16).font('Roboto-Bold').text(String(activeStudents), 62, startY + 22);

    // Faculty Card
    doc.rect(180, startY, colWidth, cardHeight).fill('#F8FAFC');
    doc.rect(180, startY, 4, cardHeight).fill('#009FE5');
    doc.fillColor('#475569').fontSize(7).font('Roboto-Bold').text('ACTIVE INSTRUCTORS', 192, startY + 10);
    doc.fillColor('#0E2A47').fontSize(16).font('Roboto-Bold').text(String(totalFaculty), 192, startY + 22);

    // Courses Card
    doc.rect(310, startY, colWidth, cardHeight).fill('#F8FAFC');
    doc.rect(310, startY, 4, cardHeight).fill('#10B981');
    doc.fillColor('#475569').fontSize(7).font('Roboto-Bold').text('COURSE OFFERINGS', 322, startY + 10);
    doc.fillColor('#0E2A47').fontSize(16).font('Roboto-Bold').text(String(totalCourses), 322, startY + 22);

    // Admissions Card
    doc.rect(440, startY, colWidth, cardHeight).fill('#F8FAFC');
    doc.rect(440, startY, 4, cardHeight).fill('#F59E0B');
    doc.fillColor('#475569').fontSize(7).font('Roboto-Bold').text('ADMISSIONS INTAKE', 452, startY + 10);
    doc.fillColor('#0E2A47').fontSize(16).font('Roboto-Bold').text(String(totalApplications), 452, startY + 22);

    doc.moveDown(4.5);

    // 2. PROGRAM TRACK DISTRIBUTION
    const trackY = 215;
    doc.fillColor('#0E2A47')
       .fontSize(12)
       .font('Roboto-Bold')
       .text('II. Program Academic Tracks Enrollment', 50, trackY)
       .moveDown(0.6);

    // Bar chart simulation
    const totalTrack = theologyStudents + geezStudents || 1;
    const theoPct = (theologyStudents / totalTrack) * 100;
    const geezPct = (geezStudents / totalTrack) * 100;

    const barY = trackY + 25;
    doc.fillColor('#334155').fontSize(9).font('Roboto-Bold').text(`Theology Program Track: ${theologyStudents} students (${theoPct.toFixed(1)}%)`, 50, barY);
    doc.rect(50, barY + 12, 512, 10).fill('#E2E8F0');
    doc.rect(50, barY + 12, 512 * (theoPct / 100), 10).fill('#0E2A47');

    doc.fillColor('#334155').fontSize(9).font('Roboto-Bold').text(`Geez Language Track: ${geezStudents} students (${geezPct.toFixed(1)}%)`, 50, barY + 32);
    doc.rect(50, barY + 44, 512, 10).fill('#E2E8F0');
    doc.rect(50, barY + 44, 512 * (geezPct / 100), 10).fill('#009FE5');

    doc.moveDown(6.0);

    // 3. FINANCIAL AND TUITION REVENUE MATRIX
    const finY = 325;
    doc.fillColor('#0E2A47')
       .fontSize(12)
       .font('Roboto-Bold')
       .text('III. Financial Ledger & Tuition Summary', 50, finY)
       .moveDown(0.6);

    // Draw clean table structure
    const tableTop = finY + 25;
    const cellPad = 8;
    const rowHeight = 22;

    doc.rect(50, tableTop, 512, rowHeight).fill('#0E2A47');
    doc.fillColor('#FFFFFF').fontSize(8).font('Roboto-Bold').text('Ledger Category Classification', 60, tableTop + cellPad);
    doc.text('Calculated Value', 420, tableTop + cellPad, { align: 'right', width: 130 });

    // Table Rows
    const rows = [
      { label: 'Total Invoiced Student Accounts', val: `$${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
      { label: 'Total Collected Payments Received', val: `$${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
      { label: 'Outstanding Balance Receivables', val: `$${outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
    ];

    rows.forEach((r, i) => {
      const rowY = tableTop + rowHeight + (i * rowHeight);
      doc.rect(50, rowY, 512, rowHeight).fill(i % 2 === 0 ? '#F8FAFC' : '#FFFFFF');
      doc.fillColor('#334155').fontSize(8).font('Roboto-Regular').text(r.label, 60, rowY + cellPad);
      doc.fillColor(i === 2 ? '#EF4444' : '#0E2A47').font('Roboto-Bold').text(r.val, 420, rowY + cellPad, { align: 'right', width: 130 });
    });

    doc.moveDown(5.5);

    // 4. REGISTRATION AND MIGRATION LIFECYCLE
    const lifeY = tableTop + rowHeight + (rows.length * rowHeight) + 30;
    doc.fillColor('#0E2A47')
       .fontSize(12)
       .font('Roboto-Bold')
       .text('IV. Student Registration & Lifecycle Overview', 50, lifeY)
       .moveDown(0.6);

    const lifeRows = [
      { category: 'Total Registered Students (Historical Database)', count: totalStudents },
      { category: 'Alumni Registry (Graduated Status)', count: graduatedStudents },
      { category: 'Active Roster Students in Current Cohort', count: activeStudents },
    ];

    doc.rect(50, lifeY + 25, 512, rowHeight).fill('#475569');
    doc.fillColor('#FFFFFF').fontSize(8).font('Roboto-Bold').text('Lifecycle Category', 60, lifeY + 25 + cellPad);
    doc.text('Registered Candidates', 420, lifeY + 25 + cellPad, { align: 'right', width: 130 });

    lifeRows.forEach((r, i) => {
      const rowY = lifeY + 25 + rowHeight + (i * rowHeight);
      doc.rect(50, rowY, 512, rowHeight).fill(i % 2 === 0 ? '#F8FAFC' : '#FFFFFF');
      doc.fillColor('#334155').fontSize(8).font('Roboto-Regular').text(r.category, 60, rowY + cellPad);
      doc.fillColor('#0E2A47').font('Roboto-Bold').text(String(r.count), 420, rowY + cellPad, { align: 'right', width: 130 });
    });

    // FOOTER
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, 710).lineTo(562, 710).stroke();
    doc.fillColor('#64748B').fontSize(7).font('Roboto-Regular').text('Esderos EOTC Theological Seminary Administration Portal System — CONFIDENTIAL INFORMATION FOR INTERNAL USE ONLY', 50, 722, { align: 'center', width: 512 });

    doc.end();

    const pdfBuffer = await pdfPromise;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Esderos_Seminary_Administration_System_Report.pdf"',
        'Content-Length': String(pdfBuffer.length),
      },
    });

  } catch (error: any) {
    console.error('Error generating executive system report:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
