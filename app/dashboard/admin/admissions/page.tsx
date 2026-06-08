// app/dashboard/admin/admissions/page.tsx
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';
import AdmissionsClient from './AdmissionsClient';

export const dynamic = 'force-dynamic';

export default async function AdmissionsCRM() {
  const [applications, classes] = await Promise.all([
    prisma.admissionApplication.findMany({
      include: { user: true },
      orderBy: { submittedAt: 'desc' },
    }),
    prisma.class.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const submitted = applications.filter((a) => a.status === 'SUBMITTED').length;
  const underReview = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
  const pending = submitted + underReview;

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admissions Pipeline CRM</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review, approve, and enroll incoming applicants for theological tracks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {pending > 0 && (
              <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                {pending} Pending Action{pending !== 1 ? 's' : ''}
              </span>
            )}
            <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-semibold">
              {applications.length} Total Applications
            </span>
          </div>
        </div>

        {/* Pipeline Telemetry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Submitted', count: submitted, color: 'bg-blue-600' },
            { label: 'Under Review', count: underReview, color: 'bg-amber-500' },
            { label: 'Approved', count: applications.filter(a => a.status === 'APPROVED').length, color: 'bg-emerald-600' },
            { label: 'Rejected', count: applications.filter(a => a.status === 'REJECTED').length, color: 'bg-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                {stat.count}
              </div>
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Interactive Client Component */}
        <AdmissionsClient
          initialApplications={applications.map((app) => ({
            id: app.id,
            applicantName: `${app.user.firstName} ${app.user.lastName}`,
            email: app.user.email,
            targetTrack: app.targetTrack,
            status: app.status,
            submittedAt: app.submittedAt.toISOString(),
            reviewedAt: app.reviewedAt?.toISOString() ?? null,
            reviewNotes: app.reviewNotes,
            phone: app.phone,
            address: app.address,
            statement: app.statement,
          }))}
          classes={classes.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
        />
      </main>
    </div>
  );
}