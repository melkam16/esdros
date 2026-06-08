// app/dashboard/admin/enrollments/page.tsx
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';
import EnrollmentsClient from './EnrollmentsClient';

export const dynamic = 'force-dynamic';

export default async function EnrollmentRequestsPage() {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      student: {
        status: {
          notIn: ['GRADUATED', 'DISMISSED', 'WITHDRAWN']
        }
      }
    },
    include: {
      student: { include: { user: true } },
      courseSection: {
        include: {
          course: true,
          faculty: { include: { user: true } },
          _count: { select: { enrollments: { where: { enrollmentStatus: 'APPROVED' } } } },
        },
      },
    },
    orderBy: { requestedAt: 'desc' },
  });

  const pending = enrollments.filter((e) => e.enrollmentStatus === 'PENDING').length;

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-start bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Enrollment Request Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Approve or reject student enrollment requests for course sections.
            </p>
          </div>
          {pending > 0 && (
            <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {pending} Pending
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', count: pending, color: 'bg-amber-500' },
            { label: 'Approved', count: enrollments.filter(e => e.enrollmentStatus === 'APPROVED').length, color: 'bg-emerald-600' },
            { label: 'Rejected', count: enrollments.filter(e => e.enrollmentStatus === 'REJECTED').length, color: 'bg-red-500' },
            { label: 'Dropped', count: enrollments.filter(e => e.enrollmentStatus === 'DROPPED').length, color: 'bg-slate-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                {stat.count}
              </div>
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <EnrollmentsClient
          initialEnrollments={enrollments.map((e) => ({
            id: e.id,
            studentName: `${e.student.user.firstName} ${e.student.user.lastName}`,
            studentEmail: e.student.user.email,
            track: e.student.track,
            courseCode: e.courseSection.course.code,
            courseTitle: e.courseSection.course.title,
            credits: e.courseSection.course.credits,
            semester: e.courseSection.semester,
            faculty: e.courseSection.faculty ? `${e.courseSection.faculty.user.firstName} ${e.courseSection.faculty.user.lastName}` : 'TBD',
            room: e.courseSection.room,
            capacity: e.courseSection.capacity,
            enrolled: e.courseSection._count.enrollments,
            status: e.enrollmentStatus,
            requestedAt: e.requestedAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
