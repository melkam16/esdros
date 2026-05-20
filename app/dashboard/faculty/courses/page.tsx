'use client';
import { useState, useEffect } from 'react';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=My Courses')
      .then(res => res.json())
      .then(d => {
        setCourses(d.courses || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch courses:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pl-64 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200">
      <SidebarNavigation role="FACULTY" />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 to-white text-slate-900 shadow-xl shadow-slate-200/40 border border-slate-100">
          <div className="relative z-10 p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center text-5xl shadow-lg shadow-indigo-500/30 text-white">
                🏫
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                  Curriculum Tracking Matrix
                </h1>
                <p className="text-slate-500 font-medium mt-2 max-w-xl">
                  Overview of all active subjects assigned to your teaching credentials.
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
              <p className="text-xs text-indigo-600 uppercase font-bold tracking-widest mb-1">Total Courses</p>
              <p className="text-4xl font-black text-indigo-600">{courses.length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="text-5xl mb-4 opacity-50">📭</div>
            <h3 className="text-xl font-bold text-slate-700">No Courses Assigned</h3>
            <p className="text-slate-500 mt-2">There are currently no active course sections assigned to your faculty profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((c: any) => (
              <div key={c.id} className="group bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 overflow-hidden hover:-translate-y-1 transition-transform flex flex-col justify-between relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                
                <div className="p-8 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 font-mono rounded-full uppercase font-bold tracking-wider">
                      {c.track || 'GENERAL'}
                    </span>
                    <span className="text-2xl opacity-50">📚</span>
                  </div>
                  
                  <h4 className="text-2xl font-extrabold text-slate-900 leading-tight">{c.title}</h4>
                  
                  <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
                    <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">Section ID</p>
                      <p className="text-slate-800">{c.sectionId || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">Course Code</p>
                      <p className="text-slate-800 font-mono">{c.code}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex justify-between items-center relative z-10 text-sm">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    📅 {c.semester || 'Current Semester'}
                  </span>
                  <span className="text-slate-600 font-bold flex items-center gap-2">
                    📍 {c.room || 'TBA'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
