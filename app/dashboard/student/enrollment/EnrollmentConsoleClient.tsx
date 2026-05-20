// app/dashboard/student/enrollment/EnrollmentConsoleClient.tsx
'use client';

import { useState } from 'react';

interface SectionRow {
  id: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  faculty: string;
  semester: string;
  room: string | null;
  capacity: number;
  enrolled: number;
  alreadyEnrolled: boolean;
  enrollmentStatus: string | null;
}

export default function EnrollmentConsoleClient({ sections }: { sections: SectionRow[] }) {
  const [sectionStates, setSectionStates] = useState<Record<string, { loading: boolean; status: string | null }>>(
    Object.fromEntries(sections.map((s) => [s.id, { loading: false, status: s.enrollmentStatus }]))
  );
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const requestEnrollment = async (sectionId: string) => {
    setSectionStates((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], loading: true } }));
    try {
      const res = await fetch('/api/student/enrollment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSectionId: sectionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Request failed', 'error');
        return;
      }
      setSectionStates((prev) => ({ ...prev, [sectionId]: { loading: false, status: 'PENDING' } }));
      showToast('Enrollment request submitted! Awaiting admin approval.', 'success');
    } catch {
      showToast('Network error. Please retry.', 'error');
    } finally {
      setSectionStates((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], loading: false } }));
    }
  };

  const dropEnrollment = async (sectionId: string, enrollmentId: string) => {
    setSectionStates((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], loading: true } }));
    try {
      const res = await fetch(`/api/student/enrollment/drop?enrollmentId=${enrollmentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Drop failed', 'error'); return; }
      setSectionStates((prev) => ({ ...prev, [sectionId]: { loading: false, status: 'DROPPED' } }));
      showToast('Enrollment dropped.', 'success');
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setSectionStates((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], loading: false } }));
    }
  };

  const filtered = sections.filter(
    (s) =>
      !search ||
      s.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      s.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      s.faculty.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, SectionRow[]>>((acc, s) => {
    if (!acc[s.semester]) acc[s.semester] = [];
    acc[s.semester].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Available Course Sections</h2>
        <input
          id="section-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses, faculty..."
          className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-56"
        />
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-slate-400 italic text-sm">
          No course sections available for your track yet. Check back later.
        </div>
      )}

      {Object.entries(grouped).map(([semester, rows]) => (
        <div key={semester} className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{semester}</h3>
          <div className="grid grid-cols-1 gap-3">
            {rows.map((s) => {
              const state = sectionStates[s.id] || { loading: false, status: s.enrollmentStatus };
              const isFull = s.enrolled >= s.capacity;
              const pct = Math.min(Math.round((s.enrolled / s.capacity) * 100), 100);

              return (
                <div key={s.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${state.status === 'APPROVED' ? 'border-emerald-200' : state.status === 'PENDING' ? 'border-amber-200' : 'border-slate-200'}`}>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900">{s.courseTitle}</h4>
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{s.courseCode}</span>
                      <span className="text-xs text-slate-400">{s.credits} credits</span>
                    </div>
                    <p className="text-xs text-slate-500">Instructor: {s.faculty}{s.room ? ` · Room ${s.room}` : ''}</p>
                    {/* Capacity bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 max-w-32 bg-slate-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-medium ${isFull ? 'text-red-600' : 'text-slate-500'}`}>
                        {isFull ? 'FULL' : `${s.enrolled}/${s.capacity} seats`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {state.status === 'APPROVED' && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">✓ Enrolled</span>
                    )}
                    {state.status === 'PENDING' && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">⏳ Pending Approval</span>
                    )}
                    {state.status === 'REJECTED' && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">✕ Rejected</span>
                    )}
                    {(state.status === null || state.status === 'DROPPED') && !isFull && (
                      <button
                        id={`enroll-${s.id}`}
                        disabled={state.loading}
                        onClick={() => requestEnrollment(s.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {state.loading ? '...' : 'Request Enrollment'}
                      </button>
                    )}
                    {(state.status === null || state.status === 'DROPPED') && isFull && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">Section Full</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
