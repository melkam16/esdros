'use client';

import { useState, useEffect } from 'react';

interface Faculty {
  id: string;
  userId: string;
  title?: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  department: string;
  courseSections: number;
  courses: string[];
}

export default function FacultyListView() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'OFFBOARDED'>('ACTIVE');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/faculty/add');
      const data = await response.json();
      if (data.success) {
        setFaculty(data.data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFaculty = faculty.filter(f => !f.name.includes('(Offboarded)'));
  const offboardedFaculty = faculty.filter(f => f.name.includes('(Offboarded)'));

  const currentList = activeTab === 'ACTIVE' ? activeFaculty : offboardedFaculty;

  const filteredFaculty = currentList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (!window.confirm(`Are you sure you want to ${makeAdmin ? 'grant' : 'revoke'} Admin access for this faculty member?`)) return;
    try {
      const res = await fetch('/api/admin/manage-admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleAdminRole',
          userId,
          makeAdmin
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update clearance');
      alert(data.message || 'Updated clearance successfully!');
      fetchFaculty();
    } catch (err: any) {
      alert(err.message || 'Error updating clearance');
    }
  };

  const handleOffboard = async (facultyId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to offboard ${name}? This will revoke their system access instantly.`)) return;
    
    setIsProcessing(facultyId);
    try {
      const res = await fetch('/api/admin/faculty/offboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId })
      });
      if (res.ok) {
        await fetchFaculty(); // refresh the list
      } else {
        alert('Failed to offboard faculty');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {/* Header Tabs */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${activeTab === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Active Faculty ({activeFaculty.length})
          </button>
          <button 
            onClick={() => setActiveTab('OFFBOARDED')}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${activeTab === 'OFFBOARDED' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Archived Records ({offboardedFaculty.length})
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 text-sm"
          />
        </div>
        <div className="hidden sm:block">
          <span className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl border border-blue-100">
            {faculty.length} Faculty Members
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">
          <p>Loading faculty members...</p>
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <p>
            {searchTerm
              ? 'No faculty members match your search'
              : 'No faculty members found. Start by adding new faculty members.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Assigned Courses</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFaculty.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{f.name}</p>
                    {f.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                        🛡️ Admin Clearance
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{f.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {f.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {f.courseSections === 0 ? (
                        <p className="text-sm text-slate-500 italic">No courses assigned</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-900">{f.courseSections} course section(s)</p>
                          {f.courses.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {f.courses.slice(0, 2).map((course, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                                >
                                  {course}
                                </span>
                              ))}
                              {f.courses.length > 2 && (
                                <span className="text-xs text-slate-500">+{f.courses.length - 2} more</span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {activeTab === 'ACTIVE' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        Offboarded
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {activeTab === 'ACTIVE' ? (
                      <div className="flex justify-end items-center gap-2 whitespace-nowrap">
                        {f.role === 'ADMIN' ? (
                          <button
                            onClick={() => handleToggleAdmin(f.userId, false)}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg hover:bg-amber-100 transition whitespace-nowrap"
                          >
                            Revoke Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleAdmin(f.userId, true)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg hover:bg-indigo-100 transition whitespace-nowrap"
                          >
                            Grant Admin
                          </button>
                        )}
                        <button 
                          onClick={() => handleOffboard(f.id, f.name)}
                          disabled={isProcessing === f.id}
                          className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition disabled:opacity-50 whitespace-nowrap"
                        >
                          {isProcessing === f.id ? 'Processing...' : 'Offboard'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Archived Record</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
