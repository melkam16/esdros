import SidebarNavigation from '../../../components/SidebarNavigation';

export default function SettingsPage() {
  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure global platform parameters and integration endpoints.</p>
        </div>
        
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-slate-800">Configuration Module Offline</h2>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            The global settings panel is currently restricted. Please contact the lead platform architect to modify SMTP email gateways, API keys, and global semester dates.
          </p>
        </div>
      </main>
    </div>
  );
}
