// app/dashboard/admin/admissions/AdmissionsClient.tsx
'use client';

import { useState } from 'react';

interface Application {
  id: string;
  applicantName: string;
  email: string;
  targetTrack: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  phone: string | null;
  statement: string | null;
}

interface ClassOption {
  id: string;
  name: string;
  code: string;
}

interface Props {
  initialApplications: Application[];
  classes: ClassOption[];
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const TABS = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const;

export default function AdmissionsClient({ initialApplications, classes }: Props) {
  const [applications, setApplications] = useState(initialApplications);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [loading, setLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [reviewNotes, setReviewNotes] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Archiving States
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [isArchivingModalOpen, setIsArchivingModalOpen] = useState(false);
  const [archiveYearInput, setArchiveYearInput] = useState(new Date().getFullYear().toString());

  // Split applications into Active and Archived
  const activeApplications = applications.filter(a => !(a.reviewNotes && a.reviewNotes.startsWith('[ARCHIVED_')));
  const archivedApplications = applications.filter(a => a.reviewNotes && a.reviewNotes.startsWith('[ARCHIVED_'));

  const currentDisplayList = isArchiveMode ? archivedApplications : activeApplications;

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const decide = async (applicationId: string, decision: string) => {
    setLoading(applicationId + decision);
    try {
      const res = await fetch('/api/admin/admissions/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          decision,
          classId: decision === 'APPROVED' ? classId : undefined,
          reviewNotes: reviewNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Action failed', 'error'); return; }
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: decision } : a))
      );
      showToast(data.message, 'success');
      setSelected(null);
      setReviewNotes('');
    } catch {
      showToast('Network error. Please retry.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const filtered = activeTab === 'ALL' ? currentDisplayList : currentDisplayList.filter((a) => a.status === activeTab);

  const counts = TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab] = tab === 'ALL' ? currentDisplayList.length : currentDisplayList.filter((a) => a.status === tab).length;
    return acc;
  }, {});

  const handleArchivePipeline = async () => {
    if (!archiveYearInput) return;
    setLoading('ARCHIVING');
    try {
      const res = await fetch('/api/admin/admissions/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archiveYear: archiveYearInput }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to archive', 'error'); return; }
      
      // Manually prefix the state
      setApplications(prev => prev.map(a => {
        if (!(a.reviewNotes && a.reviewNotes.startsWith('[ARCHIVED_'))) {
          return { ...a, reviewNotes: `[ARCHIVED_${archiveYearInput}] ` + (a.reviewNotes || '') };
        }
        return a;
      }));
      
      showToast(`Successfully archived ${data.count} applications.`, 'success');
      setIsArchivingModalOpen(false);
      setIsArchiveMode(true); // Jump to archive view to see the result
    } catch (e) {
      showToast('Network error during archival.', 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsArchiveMode(false)}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${!isArchiveMode ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Active Pipeline
          </button>
          <button 
            onClick={() => setIsArchiveMode(true)}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${isArchiveMode ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Archived Audit
          </button>
        </div>
        
        {!isArchiveMode && (
          <button 
            onClick={() => setIsArchivingModalOpen(true)}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition shadow"
          >
            Archive & Close Admissions
          </button>
        )}
      </div>

      {isArchiveMode && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3">
          <span className="text-amber-500 text-xl">🗄️</span>
          <div>
            <h4 className="text-amber-800 font-bold text-sm">You are viewing Archived Applications.</h4>
            <p className="text-amber-700 text-xs">These applications have been securely stored from previous academic cycles and are read-only.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            id={`admissions-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeTab === tab
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All' : STATUS_LABELS[tab]}
            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Track</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Submitted</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">{app.applicantName}</p>
                  <p className="text-xs text-slate-400">{app.email}</p>
                  {isArchiveMode && app.reviewNotes && (
                    <span className="mt-1 inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">
                      {app.reviewNotes.match(/\[ARCHIVED_(.*?)\]/)?.[1] || 'Archived'} Cycle
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${app.targetTrack === 'THEOLOGY' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                    {app.targetTrack === 'THEOLOGY' ? 'Theology' : 'Geez Language'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[app.status]}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {new Date(app.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  {app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW' ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingApplication(app)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
                      >
                        View Details
                      </button>
                      {app.status === 'SUBMITTED' && (
                        <button
                          id={`review-${app.id}`}
                          disabled={!!loading}
                          onClick={() => decide(app.id, 'UNDER_REVIEW')}
                          className="px-3 py-1.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-200 transition disabled:opacity-50"
                        >
                          Review
                        </button>
                      )}
                      <button
                        id={`approve-${app.id}`}
                        disabled={!!loading}
                        onClick={() => { setSelected(app); setReviewNotes(''); }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        Approve & Enroll
                      </button>
                      <button
                        id={`reject-${app.id}`}
                        disabled={!!loading}
                        onClick={() => decide(app.id, 'REJECTED')}
                        className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingApplication(app)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
                      >
                        View Details
                      </button>
                      <span className="text-xs text-slate-400 italic mt-1.5">
                        {app.status === 'APPROVED' ? '✓ Enrolled' : '✕ Rejected'}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">
                  No applications in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Archiving Modal */}
      {isArchivingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🗄️</div>
              <h2 className="text-xl font-bold text-slate-900">Archive Admissions Pipeline</h2>
              <p className="text-sm text-slate-500 mt-2">
                This will move all current applications out of the active pipeline and securely store them in the Archive Audit view.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Identify Academic Cycle *</label>
              <input 
                type="text" 
                value={archiveYearInput}
                onChange={e => setArchiveYearInput(e.target.value)}
                placeholder="e.g. 2026-2027"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
              />
              <p className="text-xs text-slate-400 mt-2">All currently active applications will be permanently tagged with this cycle.</p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsArchivingModalOpen(false)}
                disabled={loading === 'ARCHIVING'}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleArchivePipeline}
                disabled={loading === 'ARCHIVING' || !archiveYearInput}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition text-sm disabled:opacity-50"
              >
                {loading === 'ARCHIVING' ? 'Processing...' : 'Confirm & Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Approve & Enroll</h2>
              <p className="text-sm text-slate-500 mt-1">Enrolling <strong>{selected.applicantName}</strong> into <strong>{selected.targetTrack === 'THEOLOGY' ? 'Theology' : 'Geez Language'}</strong> program.</p>
            </div>
            {selected.statement && (
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 italic border">
                "{selected.statement}"
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assign to Class *</label>
              <select
                id="approval-classId"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {classes.length === 0 && <option value="">— No classes available —</option>}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
              {classes.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Please create a Class in Academic Setup first.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Review Notes <span className="text-slate-400">(optional)</span></label>
              <textarea
                id="approval-notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes for this decision..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition text-sm">
                Cancel
              </button>
              <button
                id="confirm-approve"
                disabled={!!loading || !classId || classes.length === 0}
                onClick={() => decide(selected.id, 'APPROVED')}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : '✓ Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Viewing Modal */}
      {viewingApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Application Details</h2>
                <p className="text-sm text-slate-500 mt-1">Submitted on {new Date(viewingApplication.submittedAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[viewingApplication.status]}`}>
                {STATUS_LABELS[viewingApplication.status]}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase">Applicant Name</label>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{viewingApplication.applicantName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase">Track</label>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{viewingApplication.targetTrack === 'THEOLOGY' ? 'Theology' : 'Geez Language'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase">Email</label>
                  <p className="text-sm text-slate-900 mt-0.5">{viewingApplication.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase">Phone</label>
                  <p className="text-sm text-slate-900 mt-0.5">{viewingApplication.phone || 'N/A'}</p>
                </div>
                {viewingApplication.address && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 uppercase">Address</label>
                    <p className="text-sm text-slate-900 mt-0.5">{viewingApplication.address}</p>
                  </div>
                )}
              </div>
              
              {viewingApplication.statement && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Personal Statement</label>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200 max-h-48 overflow-y-auto">
                    {viewingApplication.statement}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setViewingApplication(null)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
