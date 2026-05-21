import SidebarNavigation from '../../../components/SidebarNavigation';

export default function NotificationsPage() {
  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-cyan-500/30 text-white flex-shrink-0">
            🔔
          </div>
          
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl">
              Stay up-to-date with institutional broadcasts, academic alerts, and administrative messages.
            </p>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/30 flex gap-6 hover:-translate-y-1 transition-transform relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
              📢
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-extrabold text-slate-900 text-lg">System Broadcast: Student Portal Live</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md">New</span>
              </div>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Your initialized test student credentials are now live. You can explore your academic metrics, financial ledgers, and institutional data using the navigation modules.
              </p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Today at 9:00 AM</p>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-3xl p-6 border border-slate-100 shadow-sm flex gap-6">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-300 rounded-l-3xl hidden"></div>
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
              ✅
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-extrabold text-slate-700 text-lg">Account Provisioned</h3>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Your institutional account and identity access management profile have been successfully provisioned. Welcome to the Seminary Platform!
              </p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">2 Days Ago</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}