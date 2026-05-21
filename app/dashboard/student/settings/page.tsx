import SidebarNavigation from '../../../components/SidebarNavigation';

export default function SettingsPage() {
  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-slate-900/30 text-white flex-shrink-0">
            ⚙️
          </div>
          
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl">
              Manage your institutional authentication credentials and secure portal access configurations.
            </p>
          </div>
        </div>

        {/* Settings Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">🔐</span>
              Security & Authentication
            </h2>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-3 max-w-md">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Update Secure Password String</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all opacity-70 cursor-not-allowed" 
                  disabled 
                />
                <span className="absolute right-4 top-3 text-slate-400">🔒</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Self-service password resets are currently disabled in this demo environment.</p>
            </div>
            
            <div className="pt-4 flex gap-4">
              <button className="px-6 py-3 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed transition-all">
                Save Configurations
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}