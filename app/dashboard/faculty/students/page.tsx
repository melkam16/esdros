'use client';
import { useState, useEffect } from 'react';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=Students')
      .then(res => res.json())
      .then(d => {
        const studentList = d.students || [];
        setStudents(studentList);
        const uniqueCourses = Array.from(new Set(studentList.map((s: any) => s.courseName))).filter(Boolean) as string[];
        setCourses(uniqueCourses);
        if (uniqueCourses.length > 0) {
          setSelectedCourse(uniqueCourses[0]);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load students:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200">
      <SidebarNavigation role="FACULTY" />
      
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center text-5xl shadow-lg shadow-emerald-500/30 text-white flex-shrink-0">
            👥
          </div>
          
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Roster Records</h1>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
              Access master rosters for all active course sections and view individual student academic profiles.
            </p>
          </div>
          
          <div className="relative z-10 hidden md:flex items-center gap-4">
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {courses.length === 0 && <option value="">No Courses Assigned</option>}
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 text-center">
              <p className="text-xs text-emerald-600 uppercase font-bold tracking-widest mb-1">Total Students</p>
              <p className="text-3xl font-black text-emerald-600 tracking-tight">
                {selectedCourse ? students.filter(s => s.courseName === selectedCourse).length : 0}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : (!students || students.length === 0) ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="text-5xl mb-4 opacity-50">👩‍🎓</div>
            <h3 className="text-xl font-bold text-slate-700">No Students Found</h3>
            <p className="text-slate-500 mt-2">There are currently no students enrolled in your assigned sections.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="p-6">Student Roster Identity</th>
                    <th className="p-6">Student ID</th>
                    <th className="p-6">Program Track</th>
                    <th className="p-6">Course Section</th>
                    <th className="p-6">Contact Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(selectedCourse ? students.filter(s => s.courseName === selectedCourse) : []).map((s: any) => (
                    <tr key={s.id + s.courseCode} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500">
                            {s.name ? s.name.charAt(0) : 'S'}
                          </div>
                          <p className="font-extrabold text-slate-900">{s.name || 'Unknown Student'}</p>
                        </div>
                      </td>
                      <td className="p-6 font-mono font-medium text-slate-500">{s.id.includes('-') || s.id.length < 15 ? s.id.toUpperCase() : s.id.substring(0, 8).toUpperCase()}</td>
                      <td className="p-6 font-bold text-slate-700">
                        <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{s.track || 'GENERAL'}</span>
                      </td>
                      <td className="p-6 font-bold text-slate-700">{s.courseName || 'Standard Cohort'}</td>
                      <td className="p-6 font-medium text-blue-600">{s.email || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
