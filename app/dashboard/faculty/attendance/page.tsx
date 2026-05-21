'use client';
import { useState, useEffect } from 'react';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=Attendance')
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
        console.error('Failed to load attendance:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200">
      <SidebarNavigation role="FACULTY" />
      
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-rose-500 to-red-500 rounded-3xl flex items-center justify-center text-5xl shadow-lg shadow-rose-500/30 text-white flex-shrink-0">
            📅
          </div>
          
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Tracking module</h1>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
              Rapidly record daily classroom presence and mark excused absences for active sections.
            </p>
          </div>
          
          <div className="relative z-10 hidden md:block">
            <button className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
              Submit Session Record
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        ) : (!students || students.length === 0) ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="text-5xl mb-4 opacity-50">📋</div>
            <h3 className="text-xl font-bold text-slate-700">No Students Found</h3>
            <p className="text-slate-500 mt-2">There are currently no students enrolled in your assigned sections.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="px-8 py-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Today's Class Roster</h2>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              
              <div className="flex gap-2">
                <select 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                >
                  {courses.length === 0 && <option value="">No Courses Assigned</option>}
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="p-6">Student Roster Identity</th>
                    <th className="p-6 text-center">Status Toggle Check</th>
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
                          <div>
                            <p className="font-extrabold text-slate-900">{s.name || 'Unknown Student'}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {s.id.substring(0, 8)} | {s.courseCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer group/label">
                            <input type="radio" name={`att-${s.id}`} defaultChecked className="hidden peer" />
                            <div className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-500 peer-checked:bg-emerald-50 peer-checked:border-emerald-200 peer-checked:text-emerald-600 transition-colors">
                              Present
                            </div>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group/label">
                            <input type="radio" name={`att-${s.id}`} className="hidden peer" />
                            <div className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-500 peer-checked:bg-rose-50 peer-checked:border-rose-200 peer-checked:text-rose-600 transition-colors">
                              Absent
                            </div>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group/label">
                            <input type="radio" name={`att-${s.id}`} className="hidden peer" />
                            <div className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-500 peer-checked:bg-amber-50 peer-checked:border-amber-200 peer-checked:text-amber-600 transition-colors">
                              Excused
                            </div>
                          </label>
                        </div>
                      </td>
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
