import SidebarNavigation from '@/app/components/SidebarNavigation';
import ManageAdminsClient from './ManageAdminsClient';

export const dynamic = 'force-dynamic';

export default function ManageAdminsPage() {
  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Page Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Identity & Access Control</h1>
            <p className="text-sm text-slate-500 mt-1">Admin User Management, clearances, and module restrictions.</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-[#009fe5] text-xs font-semibold rounded-full border border-blue-200">
            System Security Enabled
          </span>
        </div>

        {/* Client Side Console Component */}
        <ManageAdminsClient />
      </main>
    </div>
  );
}
