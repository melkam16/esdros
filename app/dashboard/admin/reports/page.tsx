// app/dashboard/admin/reports/page.tsx
import SidebarNavigation from "@/app/components/SidebarNavigation";
import ReportsDashboard from "../../../components/ReportsDashboard";

export default function AdminReportsPage() {
  return (
    <div className="pl-64 min-h-screen bg-slate-50">
          <SidebarNavigation role="ADMIN" />
          <main className="p-8 max-w-7xl mx-auto space-y-8">
    <div className="max-w-7xl mx-auto p-6 sm:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <ReportsDashboard />
    </div>
    </main>
    </div>
  );
}