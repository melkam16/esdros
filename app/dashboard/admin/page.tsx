// app/dashboard/admin/page.tsx
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../components/SidebarNavigation';
import AdminDashboardActions from './AdminDashboardActions';

// FORCE NEXT.JS TO EVALUATE THIS ROUTE DYNAMICALLY AT RUNTIME
// This guarantees that proxy.ts intercepts the request on every navigation click
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Safe default fallback metric parsing using database Try/Catch blocks
  let totalStudents = 0;
  let theologyTracks = 0;
  let geezTracks = 0;
  let pendingAdmissions = 0;
  let totalDepartments = 0;
  let totalClasses = 0;

  try {
    // Run counting aggregation tasks concurrently to minimize data load times
    const [
      studentCount,
      theoCount,
      geezCount,
      admissionsCount,
      deptCount,
      classCount
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { track: 'THEOLOGY' } }),
      prisma.student.count({ where: { track: 'GEEZ_LANGUAGE' } }),
      prisma.admissionApplication.count({ where: { status: 'SUBMITTED' } }),
      prisma.department.count(),
      prisma.class.count(),
    ]);

    totalStudents = studentCount;
    theologyTracks = theoCount;
    geezTracks = geezCount;
    pendingAdmissions = admissionsCount;
    totalDepartments = deptCount;
    totalClasses = classCount;
  } catch (dbError) {
    console.warn("Notice: Database tables might be unseeded or empty. Rendering default counts.");
  }

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      {/* Classe365 Integrated Shared Sidebar Navigation */}
      <SidebarNavigation role="ADMIN" />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Ribbon Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Esdros Theological Seminary Admin Control Panel</h1>
            <p className="text-sm text-slate-500 mt-1">Institutional management overview and core telemetry.</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
            System Live
          </span>
        </div>

        {/* Primary Metric Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-600 text-white rounded-xl shadow-sm space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-75">Total Enrolled Footprint</h3>
            <p className="text-3xl font-bold">{totalStudents}</p>
            <p className="text-xs opacity-90">Active Profiles in Database</p>
          </div>
          <div className="p-6 bg-emerald-600 text-white rounded-xl shadow-sm space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-75">Theology Cohort</h3>
            <p className="text-3xl font-bold">{theologyTracks}</p>
            <p className="text-xs opacity-90">Students Matriculated</p>
          </div>
          <div className="p-6 bg-amber-600 text-white rounded-xl shadow-sm space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-75">Geez Language Cohort</h3>
            <p className="text-3xl font-bold">{geezTracks}</p>
            <p className="text-xs opacity-90">Students Matriculated</p>
          </div>
        </div>

        {/* Secondary Structural System Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Departments</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalDepartments}</p>
            </div>
            <span className="p-2.5 bg-slate-100 rounded-lg text-slate-700 text-xs font-mono font-bold border border-slate-200">DEPT</span>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Configured Program Classes</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalClasses}</p>
            </div>
            <span className="p-2.5 bg-slate-100 rounded-lg text-slate-700 text-xs font-mono font-bold border border-slate-200">CLSS</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Admission Pipeline</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{pendingAdmissions}</p>
            </div>
            <span className={`p-2.5 rounded-lg text-xs font-mono font-bold border ${
              pendingAdmissions > 0 
                ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold animate-pulse' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              CRM
            </span>
          </div>
        </div>

        {/* Action Interface Area */}
        <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-slate-800">Academic Registrar Actions</h2>
          <p className="text-sm text-slate-600 mb-6">
            Manage system-wide student records, configure multi-tenant track variations, review incoming CRM admissions applications, and evaluate invoice parameters.
          </p>
          <AdminDashboardActions />
        </div>
      </main>
    </div>
  );
}