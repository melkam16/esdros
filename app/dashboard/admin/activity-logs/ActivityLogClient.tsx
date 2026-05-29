// app/dashboard/admin/activity-logs/ActivityLogClient.tsx
'use client';
import { useState, useMemo } from 'react';

interface ActivityLog {
  id: string;
  userId: string | null;
  email: string;
  role: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface ClientProps {
  initialLogs: ActivityLog[];
}

export default function ActivityLogClient({ initialLogs }: ClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Helper: Get user-friendly date description
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Helper: Shorten user-agent for display
  const parseUserAgent = (ua: string | null) => {
    if (!ua) return 'System / Script';
    if (ua.includes('Chrome') && ua.includes('Windows')) return 'Chrome (Windows)';
    if (ua.includes('Chrome') && ua.includes('Macintosh')) return 'Chrome (macOS)';
    if (ua.includes('Chrome') && ua.includes('Android')) return 'Chrome (Android)';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari (macOS)';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Postman')) return 'Postman API Client';
    if (ua.includes('System Script')) return 'System Script';
    return ua.split(' ')[0] || 'Unknown Browser';
  };

  // 1. Calculate high-fidelity telemetry metrics from ALL logs
  const metrics = useMemo(() => {
    const total = initialLogs.length;
    
    // Unique active users
    const uniqueUsers = new Set(initialLogs.map(log => log.email)).size;
    
    // Sign-in frequency
    const signIns = initialLogs.filter(log => log.action === 'SIGN_IN').length;
    
    // Security & Deletions (DELETE_STUDENT + DELETE_FACULTY + OFFBOARD_FACULTY)
    const securityEvents = initialLogs.filter(log => 
      ['DELETE_STUDENT', 'DELETE_FACULTY', 'OFFBOARD_FACULTY'].includes(log.action)
    ).length;

    return { total, uniqueUsers, signIns, securityEvents };
  }, [initialLogs]);

  // 2. Perform fuzzy search and structured filters in real-time
  const filteredLogs = useMemo(() => {
    return initialLogs.filter(log => {
      // Fuzzy Search
      const searchTarget = `${log.email} ${log.action} ${log.details || ''} ${log.ipAddress || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());

      // Action Category Filter
      let matchesAction = true;
      if (selectedActionFilter === 'SIGN_OPS') {
        matchesAction = ['SIGN_IN', 'SIGN_OUT'].includes(log.action);
      } else if (selectedActionFilter === 'DELETIONS') {
        matchesAction = ['DELETE_STUDENT', 'DELETE_FACULTY'].includes(log.action);
      } else if (selectedActionFilter === 'UPDATES') {
        matchesAction = ['UPDATE_STATUS', 'OFFBOARD_FACULTY'].includes(log.action);
      }

      // Role Filter
      const matchesRole = selectedRoleFilter === 'ALL' || log.role === selectedRoleFilter;

      return matchesSearch && matchesAction && matchesRole;
    });
  }, [initialLogs, searchTerm, selectedActionFilter, selectedRoleFilter]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-300">
      
      {/* Telemetry Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Telemetry Footprint</p>
            <p className="text-3xl font-extrabold text-slate-900">{metrics.total}</p>
            <p className="text-[11px] text-slate-500 font-medium">Logged actions (last 90 days)</p>
          </div>
          <span className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl font-bold border border-blue-100">📋</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Operators</p>
            <p className="text-3xl font-extrabold text-slate-900">{metrics.uniqueUsers}</p>
            <p className="text-[11px] text-slate-500 font-medium">Unique accounts captured</p>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl font-bold border border-emerald-100">👥</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sign-In Count</p>
            <p className="text-3xl font-extrabold text-slate-900">{metrics.signIns}</p>
            <p className="text-[11px] text-slate-500 font-medium">Successful authenticated sessions</p>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl text-xl font-bold border border-indigo-100">🔐</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security Events</p>
            <p className="text-3xl font-extrabold text-slate-900">{metrics.securityEvents}</p>
            <p className="text-[11px] text-slate-500 font-medium">Platform record modifications</p>
          </div>
          <span className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xl font-bold border border-rose-100">⚠️</span>
        </div>

      </div>

      {/* Control panel and filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Search & Simple Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          
          {/* Live Search Bar */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by email, action, details, IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Preset Chips count summary */}
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredLogs.length} of {initialLogs.length} logs
          </span>

        </div>

        {/* Advanced Filters Grid */}
        <div className="flex flex-wrap gap-6 items-center border-t border-slate-100 pt-4">
          
          {/* Action Chips */}
          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Action Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'All Actions', value: 'ALL' },
                { name: 'Sign Ins & Out', value: 'SIGN_OPS' },
                { name: 'Deletions', value: 'DELETIONS' },
                { name: 'System Revisions', value: 'UPDATES' }
              ].map(chip => (
                <button
                  key={chip.value}
                  onClick={() => setSelectedActionFilter(chip.value)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                    selectedActionFilter === chip.value
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {chip.name}
                </button>
              ))}
            </div>
          </div>

          {/* Role filter */}
          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Actor Clearance
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'All Roles', value: 'ALL' },
                { name: 'Administrator', value: 'ADMIN' },
                { name: 'Faculty Staff', value: 'FACULTY' },
                { name: 'Student Profile', value: 'STUDENT' }
              ].map(chip => (
                <button
                  key={chip.value}
                  onClick={() => setSelectedRoleFilter(chip.value)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                    selectedRoleFilter === chip.value
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {chip.name}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Main Glassmorphic Table/Timeline Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">User/Actor</th>
                <th className="py-4 px-6">Action</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">IP / Client Environment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => {
                  
                  // Color configuration for Action badging
                  let actionBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (log.action === 'SIGN_IN') {
                    actionBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
                  } else if (log.action === 'SIGN_OUT') {
                    actionBadgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
                  } else if (['DELETE_STUDENT', 'DELETE_FACULTY'].includes(log.action)) {
                    actionBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                  } else if (['UPDATE_STATUS', 'OFFBOARD_FACULTY'].includes(log.action)) {
                    actionBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
                  }

                  // Color configuration for Role badging
                  let roleBadgeClass = 'bg-slate-100 text-slate-600';
                  if (log.role === 'ADMIN') {
                    roleBadgeClass = 'bg-blue-50 text-blue-700 border border-blue-100';
                  } else if (log.role === 'FACULTY') {
                    roleBadgeClass = 'bg-violet-50 text-violet-700 border border-violet-100';
                  } else if (log.role === 'STUDENT') {
                    roleBadgeClass = 'bg-teal-50 text-teal-700 border border-teal-100';
                  }

                  return (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="py-4 px-6 whitespace-nowrap font-mono text-xs text-slate-500">
                        {formatDateTime(log.createdAt)}
                      </td>

                      {/* User Identity */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {log.email}
                          </p>
                          <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded ${roleBadgeClass}`}>
                            {log.role || 'GUEST'}
                          </span>
                        </div>
                      </td>

                      {/* Action Code */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs rounded-full border ${actionBadgeClass}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Details Description */}
                      <td className="py-4 px-6 font-medium text-slate-800 max-w-sm">
                        {log.details || 'No action summary recorded.'}
                      </td>

                      {/* IP & Browser Metadata */}
                      <td className="py-4 px-6 whitespace-nowrap text-xs space-y-1">
                        <div className="font-mono text-slate-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          IP: {log.ipAddress || '127.0.0.1'}
                        </div>
                        <div className="text-slate-400 truncate max-w-[160px] font-medium" title={log.userAgent || 'Unknown'}>
                          {parseUserAgent(log.userAgent)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    <span className="block text-3xl mb-2">🔍</span>
                    No activity logs match your current search queries or filter presets.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
