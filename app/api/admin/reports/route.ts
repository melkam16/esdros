// app/api/admin/reports/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Enrolled students by department
    const departmentsWithStudents = await prisma.department.findMany({
      include: {
        classes: {
          include: {
            students: true
          }
        },
        faculty: true,
        _count: {
          select: { 
            classes: true,
            faculty: true
          }
        }
      }
    });

    // 2. Faculty count by department
    const facultyByDept = await prisma.faculty.groupBy({
      by: ['departmentId'],
      _count: {
        id: true
      }
    });

    // 3. Collect financial data
    const allInvoices = await prisma.invoice.findMany({
      include: {
        payments: true
      }
    });

    const collectedFees = allInvoices.reduce((sum, inv) => {
      const payments = inv.payments.reduce((pSum, p) => pSum + p.amount, 0);
      return sum + payments;
    }, 0);

    const pendingFees = allInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
    const totalFees = allInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // 4. Applied students (SUBMITTED applications)
    const appliedStudents = await prisma.admissionApplication.count({
      where: {
        status: 'SUBMITTED'
      }
    });

    // 5. Student track data
    const studentTrackData = await prisma.course.groupBy({
      by: ['track'],
      _count: {
        id: true,
      },
    });

    // 6. Total counts
    const totalStudents = await prisma.student.count();
    const totalFaculty = await prisma.faculty.count();

    // Formulate structured data payload
    const reportsPayload = {
      summaryCards: {
        totalStudents,
        totalFaculty,
        appliedStudents,
        totalRevenue: totalFees,
        collectedFees,
        pendingFees,
        activeClasses: await prisma.class.count(),
      },
      charts: {
        studentDistribution: studentTrackData.map(item => ({
          name: item.track === 'GEEZ_LANGUAGE' ? 'Geez Language Track' : 'Theology Track',
          count: item._count.id,
        })),
        enrolledByDepartment: departmentsWithStudents.map(dept => {
          const studentCount = dept.classes.reduce((sum, cls) => sum + cls.students.length, 0);
          return {
            name: dept.name,
            code: dept.code,
            studentCount,
            facultyCount: dept.faculty.length,
            classCount: dept._count.classes
          };
        }),
        financials: [
          { 
            label: 'Total Invoiced', 
            amount: totalFees, 
            color: 'from-blue-600 to-blue-700' 
          },
          { 
            label: 'Collected Fees', 
            amount: collectedFees, 
            color: 'from-green-600 to-green-700' 
          },
          { 
            label: 'Pending Fees', 
            amount: pendingFees, 
            color: 'from-amber-600 to-amber-700' 
          }
        ]
      }
    };

    return NextResponse.json({ success: true, data: reportsPayload });
  } catch (error: any) {
    console.error("Reports aggregation failure:", error);
    return NextResponse.json({ error: 'Failed to build analytics layout telemetry.', details: error.message }, { status: 500 });
  }
}