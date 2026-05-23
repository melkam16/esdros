'use client';

import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  isStandardAdmin: boolean;
  createdAt: string;
  facultyProfile?: {
    id: string;
    department: {
      name: string;
    };
  } | null;
}

interface ManageAdminsProps {
  departments: Array<{ id: string; name: string }>;
}

export default function ManageAdminsClient({ departments }: ManageAdminsProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Link Faculty States
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [linkingUserId, setLinkingUserId] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isStandardAdmin, setIsStandardAdmin] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/manage-admins');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch admins');
      setAdmins(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // Get currently logged-in user id to prevent self-deletion
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.id) setCurrentUserId(data.id);
      })
      .catch(err => console.error('Failed to get current user details', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormSuccess(null);
    setFormError(null);

    try {
      const res = await fetch('/api/admin/manage-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          isSuperAdmin
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');

      setFormSuccess('Admin user added successfully!');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setIsSuperAdmin(false);
      setIsStandardAdmin(false);
      fetchAdmins(); // Refresh lists
    } catch (err: any) {
      setFormError(err.message || 'Failed to create admin');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleLinkFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingUserId || !selectedDeptId) return;
    setIsLinking(true);
    try {
      const res = await fetch('/api/admin/manage-admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'linkFacultyProfile',
          userId: linkingUserId,
          departmentId: selectedDeptId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to link profile');
      alert('Faculty profile successfully linked to this administrator!');
      setLinkingUserId(null);
      setSelectedDeptId('');
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Error linking profile');
    } finally {
      setIsLinking(false);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (!confirm(`Are you sure you want to ${makeAdmin ? 'grant' : 'revoke'} Admin clearance for this user?`)) {
      return;
    }
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
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Error updating clearance');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
      alert('You cannot delete your own logged-in admin account.');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this admin user? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/manage-admins?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete admin');

      alert('Admin user deleted successfully.');
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to delete admin');
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
    const emailLow = admin.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || emailLow.includes(query);
  });

  return (
    <div className="space-y-8">
      {/* Visual Role Explainer Box */}
      <div className="bg-blue-50 border-l-4 border-[#009fe5] p-5 rounded-r-xl shadow-sm space-y-2">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          🛡️ Role & Access Matrix Information
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          System authorization tiers let you delegate administrative duties precisely, matching exact user responsibilities while guarding secure outbound endpoints and payment APIs:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 pt-2 border-t border-blue-100">
          <div>
            <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
              Super Admin Access
            </span>
            <p className="text-[11px] text-slate-500">
              Unrestricted access to absolute systems operations. Configures SMTP, Aplos keys, manages administrators, and runs system ledgers.
            </p>
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
              Standard Admin Access
            </span>
            <p className="text-[11px] text-slate-500">
              Operations access including Finance and general settings (academic calendar, enrollment locks) but barred from modifying SMTP or Aplos configurations.
            </p>
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
              Restricted Admin Access
            </span>
            <p className="text-[11px] text-slate-500">
              Day-to-day operations: admissions CRM, transcripts generation, course section enrollments. Shielded from settings and finance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* CREATE ADMIN FORM */}
        <div className="xl:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Admin User</h2>
            <p className="text-xs text-slate-500 mt-1">Provide credentials and grant required clearance level.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">First Name</label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g. John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Last Name</label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g. Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g. email@esdros.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Clearance Access Tier</label>
              <select
                value={isSuperAdmin ? 'SUPER' : isStandardAdmin ? 'STANDARD' : 'RESTRICTED'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'SUPER') {
                    setIsSuperAdmin(true);
                    setIsStandardAdmin(false);
                  } else if (val === 'STANDARD') {
                    setIsSuperAdmin(false);
                    setIsStandardAdmin(true);
                  } else {
                    setIsSuperAdmin(false);
                    setIsStandardAdmin(false);
                  }
                }}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="RESTRICTED">🔒 Restricted Admin (Staff Operations)</option>
                <option value="STANDARD">🛡️ Standard Admin (Finance & Settings)</option>
                <option value="SUPER">👑 Super Admin (Full Global Unrestricted)</option>
              </select>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg">
                ✅ {formSuccess}
              </div>
            )}

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-medium rounded-lg">
                ⚠️ {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full py-2.5 bg-[#009fe5] text-white text-sm font-semibold rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition duration-300 disabled:opacity-50"
            >
              {formSubmitting ? 'Creating account...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        {/* ADMINS LIST / DIRECTORY */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Admin Directory</h2>
              <p className="text-xs text-slate-500 mt-1">Review active system users, clearance ratings, and creation dates.</p>
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full sm:w-60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse text-sm">
                Fetching admin roster, please wait...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-500 text-sm">
                Error loading users: {error}
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm italic">
                No administrators found matching your query criteria.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Email Address</th>
                    <th className="py-3 px-6">Clearance Level</th>
                    <th className="py-3 px-6">Date Added</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-950">
                        <div>
                          {admin.firstName} {admin.lastName}
                          {admin.id === currentUserId && (
                            <span className="ml-1.5 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">
                              Self
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] mt-1.5">
                          {admin.facultyProfile ? (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">
                              👨‍🏫 Faculty Linked: {admin.facultyProfile.department.name}
                            </span>
                          ) : (
                            <button
                              onClick={() => setLinkingUserId(admin.id)}
                              className="text-[#009fe5] hover:text-blue-700 hover:underline font-bold text-[10px]"
                            >
                              + Connect Faculty Profile
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs">{admin.email}</td>
                      <td className="py-3.5 px-6">
                        {admin.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Super Admin
                          </span>
                        ) : admin.isStandardAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Standard Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Restricted Admin
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">
                        {new Date(admin.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex justify-end items-center gap-3 whitespace-nowrap">
                          {admin.facultyProfile && (
                            <button
                              onClick={() => handleToggleAdmin(admin.id, false)}
                              className="text-xs font-bold text-amber-600 hover:text-amber-800 transition whitespace-nowrap"
                              title="Demote user to faculty-only access level"
                            >
                              Revoke Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(admin.id)}
                            disabled={admin.id === currentUserId}
                            className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-30 disabled:hover:text-red-600 transition whitespace-nowrap"
                            title={admin.id === currentUserId ? "Cannot delete yourself" : "Delete administrator account"}
                          >
                            Delete Account
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* LINK FACULTY PROFILE MODAL */}
      {linkingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">Connect Faculty Profile</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Select the Department this administrator is associated with. Creating a Faculty profile enables them to teach courses, mark attendance, and submit grades.
            </p>

            <form onSubmit={handleLinkFaculty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Select Department
                </label>
                <select
                  required
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">-- Choose a Department --</option>
                  {departments && departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLinkingUserId(null);
                    setSelectedDeptId('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLinking || !selectedDeptId}
                  className="px-4 py-2 bg-[#009fe5] text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {isLinking ? 'Connecting...' : 'Connect Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
