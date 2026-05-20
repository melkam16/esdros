'use client';
import { useState, useEffect } from 'react';

export default function StudentsView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=Students')
      .then(res => res.json())
      .then(d => {
        setStudents(d.students || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch students:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-xs text-slate-400 animate-pulse">Loading students...</div>;
  if (students.length === 0) return <div className="text-sm text-slate-600 p-4">No enrolled students.</div>;

  return (
    <div className="bg-white border p-6 rounded-xl shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Enrolled Student Profiles</h3>
      <div className="space-y-2">
        {students.map((s: any) => (
          <div key={s.id} className="p-3 border rounded-lg flex justify-between text-xs items-center bg-slate-50/30 hover:bg-slate-50">
            <div>
              <p className="font-bold text-slate-800">{s.name}</p>
              <p className="text-slate-400 font-mono mt-0.5">{s.email}</p>
              <p className="text-[10px] text-slate-500 mt-1">{s.courseName} ({s.courseCode})</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 border text-slate-600 rounded block mb-1">
                {s.status || 'Active'}
              </span>
              {s.grade && <span className="text-xs font-bold text-indigo-600">{s.grade.toFixed(1)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}