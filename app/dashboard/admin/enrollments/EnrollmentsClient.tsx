// app/dashboard/admin/enrollments/EnrollmentsClient.tsx
'use client';

import { useState } from 'react';

interface EnrollmentRow {
  id: string;
  studentName: string;
  studentEmail: string;
  track: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  semester: string;
  faculty: string;
  room: string | null;
  capacity: number;
  enrolled: number;
  status: string;
  requestedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  DROPPED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DROPPED'] as const;

export default function EnrollmentsClient({ initialEnrollments }: { initialEnrollments: EnrollmentRow[] }) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');

  const uniqueSemesters = Array.from(new Set(initialEnrollments.map(e => e.semester))).filter(Boolean);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const decide = async (enrollmentId: string, decision: 'APPROVED' | 'REJECTED') => {
    setLoading(enrollmentId + decision);
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, decision }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Action failed', 'error'); return; }
      setEnrollments((prev) =>
        prev.map((e) => e.id === enrollmentId ? { ...e, status: decision } : e)
      );
      showToast(data.message, 'success');
    } catch {
      showToast('Network error. Please retry.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const counts = TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab] = tab === 'ALL' ? enrollments.length : enrollments.filter((e) => e.status === tab).length;
    return acc;
  }, {});

  const filtered = (activeTab === 'ALL' ? enrollments : enrollments.filter((e) => e.status === activeTab))
    .filter(e => selectedSemester === 'ALL' || e.semester === selectedSemester)
    .filter((e) =>
      !search ||
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      e.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`enroll-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span className={`ml-1.5 px-1 py-0.5 rounded text-xs ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Semesters</option>
            {uniqueSemesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
          <input
            id="enroll-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or course..."
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Section Details</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">{e.studentName}</p>
                  <p className="text-xs text-slate-400">{e.studentEmail}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${e.track === 'THEOLOGY' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {e.track === 'THEOLOGY' ? 'Theology' : 'Geez Language'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">{e.courseTitle}</p>
                  <p className="text-xs text-slate-400 font-mono">{e.courseCode} · {e.credits} cr</p>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  <p><span className="font-medium">Faculty:</span> {e.faculty}</p>
                  <p><span className="font-medium">Semester:</span> {e.semester}</p>
                  {e.room && <p><span className="font-medium">Room:</span> {e.room}</p>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min((e.enrolled / e.capacity) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{e.enrolled}/{e.capacity}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[e.status]}`}>
                    {e.status.charAt(0) + e.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {e.status === 'PENDING' ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        id={`enroll-approve-${e.id}`}
                        disabled={!!loading}
                        onClick={() => decide(e.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        {loading === e.id + 'APPROVED' ? '...' : 'Approve'}
                      </button>
                      <button
                        id={`enroll-reject-${e.id}`}
                        disabled={!!loading}
                        onClick={() => decide(e.id, 'REJECTED')}
                        className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                      >
                        {loading === e.id + 'REJECTED' ? '...' : 'Reject'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      {new Date(e.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 italic">
                  No enrollment requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
