// app/dashboard/admin/faculty/page.tsx
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';
import FacultyManagementForm from '../academics/FacultyManagementForm';
import FacultyListView from '../academics/FacultyListView';

export default async function FacultyManagementPage() {
  const [departments, facultyCount] = await Promise.all([
    prisma.department.findMany(),
    prisma.faculty.count(),
  ]);

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty Management</h1>
          <p className="text-sm text-slate-500 mt-1">Add new faculty members and manage their profiles and assignments.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Faculty</h3>
            <p className="text-3xl font-bold text-slate-900">
               {facultyCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Active members</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Departments</h3>
            <p className="text-3xl font-bold text-slate-900">{departments.length}</p>
            <p className="text-xs text-slate-500 mt-1">Configured</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Course Sections</h3>
            <p className="text-3xl font-bold text-slate-900">-</p>
            <p className="text-xs text-slate-500 mt-1">Total assigned</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Add Faculty Form */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Faculty Member</h2>
            <FacultyManagementForm departments={departments} />
          </div>

          {/* Faculty Directory */}
          <FacultyListView />
        </div>
      </main>
    </div>
  );
}
