'use client';

import { useState, useEffect } from 'react';
import SidebarNavigation from '../../../components/SidebarNavigation';

interface AlumniRequest {
  id: string;
  type: 'TRANSCRIPT' | 'CONTINUOUS_EDUCATION';
  name: string;
  email: string;
  phone: string | null;
  details: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AlumniRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TRANSCRIPT' | 'CONTINUOUS_EDUCATION'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED'>('ALL');

  // Action status message
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/alumni/request');
      const result = await res.json();
      if (res.ok && result.success) {
        setRequests(result.data || []);
      } else {
        setError(result.error || 'Failed to query alumni request logs.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to academic request services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setActionMessage(null);
    try {
      const res = await fetch('/api/alumni/request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setActionMessage({ type: 'success', text: `Success: Request marked as ${newStatus}!` });
        // Update local state
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
      } else {
        setActionMessage({ type: 'error', text: result.error || 'Failed to update request clearance.' });
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ type: 'error', text: 'Error connecting to database updates.' });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.details && req.details.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = activeTab === 'ALL' || req.type === activeTab;
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate counts for statistics cards
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    transcripts: requests.filter(r => r.type === 'TRANSCRIPT').length,
    education: requests.filter(r => r.type === 'CONTINUOUS_EDUCATION').length,
  };

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-100/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-800 to-indigo-950 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-950/20 text-white flex-shrink-0">
              📥
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Alumni Academic Requests</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Evaluate official digital transcript requests and Continuous Theological Education course audits.
              </p>
            </div>
          </div>
          <span className="relative z-10 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-extrabold uppercase rounded-full border border-blue-200 tracking-wider">
            Clearance Records Active
          </span>
        </div>

        {/* STATS METRIC GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Inbound Logs', value: stats.total, color: 'from-blue-600 to-blue-800', icon: '📁' },
            { label: 'Pending Processing', value: stats.pending, color: 'from-amber-500 to-amber-600', icon: '⏳' },
            { label: 'Transcript Audits', value: stats.transcripts, color: 'from-indigo-600 to-indigo-800', icon: '📜' },
            { label: 'Continuing Ed Rosters', value: stats.education, color: 'from-emerald-600 to-emerald-800', icon: '📚' }
          ].map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex items-center justify-between overflow-hidden relative">
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{card.label}</span>
                <span className="block text-2xl font-black text-slate-900 tracking-tight">{card.value}</span>
              </div>
              <span className="text-3xl opacity-20">{card.icon}</span>
            </div>
          ))}
        </div>

        {actionMessage && (
          <div className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span>{actionMessage.type === 'success' ? '✅' : '❌'}</span>
            <p>{actionMessage.text}</p>
          </div>
        )}

        {/* MAIN CONSOLE CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* TAB HEADERS */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
              {[
                { id: 'ALL', name: 'All Requests' },
                { id: 'TRANSCRIPT', name: 'Transcripts Only' },
                { id: 'CONTINUOUS_EDUCATION', name: 'Continuing Education' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Quick Status Filter dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-bold text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 md:w-64 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-medium"
              />
            </div>

          </div>

          {/* TABLE LOGS */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading request archives...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-500 font-bold text-sm">
              ❌ {error}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium text-xs">
              📂 No matching request records found in the database directory.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Date Filed</th>
                    <th className="p-4">Applicant / Graduate</th>
                    <th className="p-4">Contact Metadata</th>
                    <th className="p-4">Request Type</th>
                    <th className="p-4">Submission Details</th>
                    <th className="p-4">Status State</th>
                    <th className="p-4 text-center">Registrar Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredRequests.map(req => {
                    const isUpdating = updatingId === req.id;
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 whitespace-nowrap text-slate-400 font-mono">
                          {new Date(req.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <p className="font-extrabold text-slate-900 leading-none">{req.name}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-slate-500">{req.email}</p>
                          {req.phone && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{req.phone}</p>}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider ${
                            req.type === 'TRANSCRIPT'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                          }`}>
                            {req.type === 'TRANSCRIPT' ? '📜 Transcript' : '📚 Roster Audit'}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs truncate" title={req.details || ''}>
                          {req.details || <span className="text-slate-300 italic">No notes provided</span>}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded font-extrabold uppercase text-[9px] tracking-wider ${
                            req.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : req.status === 'APPROVED'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : req.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {req.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                  disabled={isUpdating}
                                  className="px-2 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded transition text-[10px] font-extrabold uppercase"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                  disabled={isUpdating}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded transition text-[10px] font-extrabold uppercase"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {req.status === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                                disabled={isUpdating}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded transition text-[10px] font-extrabold uppercase"
                              >
                                Mark Complete
                              </button>
                            )}

                            {(req.status === 'COMPLETED' || req.status === 'REJECTED') && (
                              <span className="text-[10px] text-slate-400 italic">No actions needed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
