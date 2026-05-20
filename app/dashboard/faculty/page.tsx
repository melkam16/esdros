'use client';
import { useState, useEffect } from 'react';
import SidebarNavigation from '../../components/SidebarNavigation';

export default function FacultyDashboardHome() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=Dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pl-64 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200">
      <SidebarNavigation role="FACULTY" />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-2xl shadow-indigo-900/20 border border-indigo-700/50">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
          
          <div className="relative z-10 p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold tracking-wider text-indigo-100 uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Faculty Status
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Faculty Core Dashboard
              </h1>
              <p className="text-lg text-indigo-100/90 font-medium max-w-xl">
                Access your assigned curriculum, monitor student metrics, and manage your academic responsibilities.
              </p>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-center w-32 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-inner">
              <span className="text-5xl">👨‍🏫</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : !data ? (
          <div className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500 font-medium">Failed to load data.</div>
        ) : (
          <>
            {/* Dynamic Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-transform overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-inner">📚</div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Sections</h3>
                  <p className="text-4xl font-extrabold text-slate-900 tracking-tight mt-2">{data.summary?.totalSections || 0}</p>
                </div>
              </div>

              <div className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-transform overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-inner">👥</div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enrolled Students</h3>
                  <p className="text-4xl font-extrabold text-slate-900 tracking-tight mt-2">{data.summary?.totalStudents || 0}</p>
                </div>
              </div>

              <div className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-transform overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-inner">🎓</div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Assigned Courses</h3>
                  <p className="text-4xl font-extrabold text-slate-900 tracking-tight mt-2">{data.summary?.totalCourses || 0}</p>
                </div>
              </div>
            </div>

            {/* Courses Overview */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/80 border-b border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Assigned Course Sections</h2>
              </div>
              
              <div className="divide-y divide-slate-50">
                {data.sections && data.sections.length > 0 ? (
                  data.sections.map((c: any) => (
                    <div key={c.sectionId} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-500 shadow-sm group-hover:scale-110 transition-transform">
                          {c.code?.substring(0, 2) || 'CR'}
                        </div>
                        <div>
                          <p className="text-base font-extrabold text-slate-900">{c.title}</p>
                          <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                            <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{c.code}</span>
                            {c.semester || 'Current Term'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">Enrolled</p>
                        <span className="text-lg font-black text-indigo-600">{c.enrolledCount} Students</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center text-slate-400 font-medium">No courses assigned yet. Contact administration.</div>
                )}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}