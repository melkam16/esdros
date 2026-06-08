import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';
import StudentDirectoryClient from './StudentDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminStudentDirectoryPage() {
  // Fetch structural framework data concurrently
  const [students, departments, classes] = await Promise.all([
    prisma.student.findMany({
      include: {
        user: true,
        class: {
          include: { department: true }
        },
        enrollments: true
      },
      orderBy: {
        enrollDate: 'desc'
      }
    }),
    prisma.department.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.class.findMany({
      include: { department: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      {/* Shared Sidebar Navigation */}
      <SidebarNavigation role="ADMIN" />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
        {/* Header Band */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Directory & Registrar Console</h1>
            <p className="text-sm text-slate-500 mt-1">
              Onboard new candidates manually, manage student class years, track assignments, and oversee statuses.
            </p>
          </div>
          <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 font-medium whitespace-nowrap self-start md:self-center">
            🔒 Administrative Clearance Verified
          </div>
        </div>

        {/* Dynamic Client UI */}
        <StudentDirectoryClient 
          initialStudents={students} 
          departments={departments} 
          classes={classes} 
        />
      </main>
    </div>
  );
}
