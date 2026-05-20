'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default function FacultyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetch('/api/faculty/profile')
      .then(res => res.json())
      .then(d => {
        if (d.success) setProfile(d.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch profile', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="pl-64 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200">
      <SidebarNavigation role="FACULTY" />
      
      <main className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header Container */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-5xl shadow-lg shadow-indigo-500/30 text-white flex-shrink-0 border-4 border-white">
            👨‍🏫
          </div>
          
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active Faculty Profile
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? 'Loading Profile...' : profile ? `${profile.firstName} ${profile.lastName}` : 'Faculty Member'}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {profile?.departmentName || 'Department of Instruction'}
            </p>
          </div>
          
          <div className="relative z-10">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isLoggingOut ? 'Logging out...' : 'Secure Exit Sign Out'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : !profile ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="text-5xl mb-4 opacity-50">❌</div>
            <h3 className="text-xl font-bold text-slate-700">Profile Not Found</h3>
            <p className="text-slate-500 mt-2">Could not retrieve your faculty identity data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-xl">📧</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Institutional Email</p>
              <p className="text-lg font-extrabold text-slate-800 font-mono">{profile.email}</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 text-xl">🏛️</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Department Affiliation</p>
              <p className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                {profile.departmentName}
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-mono border border-slate-200">
                  {profile.departmentCode}
                </span>
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 md:col-span-2 hover:-translate-y-1 transition-transform">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 text-xl">📊</div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Teaching Load</p>
                  <p className="text-lg font-extrabold text-slate-800 flex gap-2 items-center">
                    <span className="text-emerald-600">{profile.activeCourses}</span> Active Course Sections
                  </p>
                </div>
                <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Total Students Managed</p>
                  <p className="text-2xl font-black text-slate-700 text-center">{profile.totalStudents}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
