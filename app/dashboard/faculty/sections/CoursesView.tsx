'use client';
import { useState, useEffect } from 'react';

export default function CoursesView() {
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

  if (loading) return <div className="text-xs text-slate-400 animate-pulse">Loading courses...</div>;
  if (courses.length === 0) return <div className="text-sm text-slate-600 p-4">No courses assigned yet.</div>;

  return (
    <div className="bg-white border p-6 rounded-xl shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Curriculum Tracking Matrix</h3>
        <p className="text-xs text-slate-400">Active subjects assigned to your credentials.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((c: any) => (
          <div key={c.id} className="p-4 border rounded-xl bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 font-mono rounded uppercase font-bold">{c.track}</span>
              <h4 className="text-sm font-bold text-slate-800 mt-2">{c.title}</h4>
              {c.sectionId && <p className="text-xs text-slate-500 mt-1">Section: {c.sectionId}</p>}
            </div>
            <div className="mt-4">
              <p className="text-xs font-mono text-slate-400">Code: {c.code}</p>
              {c.semester && <p className="text-xs font-mono text-slate-400">{c.semester}</p>}
              {c.room && <p className="text-xs font-mono text-slate-400">Room: {c.room}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}