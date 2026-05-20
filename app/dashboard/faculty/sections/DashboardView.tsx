'use client';
import { useState, useEffect } from 'react';

export default function DashboardView() {
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

  if (loading) return <div className="text-xs font-mono text-slate-400 animate-pulse">Loading overview telemetry matrix...</div>;
  if (!data) return <div className="text-xs font-mono text-slate-400">No data available</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Sections</span>
          <span className="text-2xl font-black block mt-1">{data.summary?.totalSections || 0}</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Enrolled Students</span>
          <span className="text-2xl font-black text-indigo-600 block mt-1">{data.summary?.totalStudents || 0}</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Courses</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">{data.summary?.totalCourses || 0}</span>
        </div>
      </div>
      
      {data.sections && data.sections.length > 0 ? (
        <div className="bg-white border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Assigned Course Sections</h3>
          <div className="divide-y border rounded-lg">
            {data.sections.map((c: any) => (
              <div key={c.sectionId} className="p-3 flex justify-between items-center text-xs font-medium hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-800 block">{c.title}</span>
                  <span className="text-slate-400">{c.semester || 'TBA'}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-slate-400">({c.code})</span>
                  <span className="block text-[10px] text-indigo-600">Enrolled: {c.enrolledCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border p-6 rounded-xl shadow-sm text-center">
          <p className="text-slate-500 text-sm">No courses assigned yet. Contact administration.</p>
        </div>
      )}
    </div>
  );
}