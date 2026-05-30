// app/dashboard/admin/courses/page.tsx
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';
import CourseAssignmentForm from '../academics/CourseAssignmentForm';
import CourseListView from './CourseListView';

export const dynamic = 'force-dynamic';

export default async function CourseManagementPage() {
  // Fetch all courses
  const courses = await prisma.course.findMany({
    include: {
      class: {
        include: {
          department: true,
        },
      },
      sections: {
        where: {
          faculty: {
            user: {
              NOT: {
                lastName: {
                  contains: '(Offboarded)'
                }
              }
            }
          }
        },
        include: {
          faculty: {
            include: {
              user: true,
            },
          },
          enrollments: true,
        },
      },
    },
  });

  const totalSections = courses.reduce((acc, c) => acc + c.sections.length, 0);
  const totalEnrollments = courses.reduce(
    (acc, c) => acc + c.sections.reduce((sec_acc, s) => sec_acc + s.enrollments.length, 0),
    0
  );

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Course Management</h1>
          <p className="text-sm text-slate-500 mt-1">Assign courses to faculty members and manage course sections.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Courses</h3>
            <p className="text-3xl font-bold text-slate-900">{courses.length}</p>
            <p className="text-xs text-slate-500 mt-1">Configured</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Course Sections</h3>
            <p className="text-3xl font-bold text-slate-900">{totalSections}</p>
            <p className="text-xs text-slate-500 mt-1">Active assignments</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Enrollments</h3>
            <p className="text-3xl font-bold text-slate-900">{totalEnrollments}</p>
            <p className="text-xs text-slate-500 mt-1">Students enrolled</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Avg Class Size</h3>
            <p className="text-3xl font-bold text-slate-900">
              {totalSections > 0 ? Math.round(totalEnrollments / totalSections) : '-'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Students per section</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Assign Course Form */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Assign Course to Faculty</h2>
            <CourseAssignmentForm courses={courses} />
          </div>

          {/* Course List View */}
          <CourseListView courses={courses} />
        </div>
      </main>
    </div>
  );
}
