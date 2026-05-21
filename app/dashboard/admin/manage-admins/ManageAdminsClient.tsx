'use client';

import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function ManageAdminsClient() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
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
      fetchAdmins(); // Refresh lists
    } catch (err: any) {
      setFormError(err.message || 'Failed to create admin');
    } finally {
      setFormSubmitting(false);
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
          Super Admin and Restricted Admin roles let you delegate day-to-day administrative workloads while keeping key core operational capabilities locked down securely:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-2 border-t border-blue-100">
          <div>
            <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
              Super Admin Access (Full)
            </span>
            <p className="text-[11px] text-slate-500">
              Unrestricted operations including Finance, Tuition billing, Fee management, global settings, system analytics, and admin user administration.
            </p>
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
              Restricted Admin Access (Staff)
            </span>
            <p className="text-[11px] text-slate-500">
              Day-to-day work: admissions CRM, student logs, course schedules, grades audits, transcripts generation, and general student records.
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

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800">Grant Super Admin access?</label>
                <span className="text-[10px] text-slate-500 leading-none">Unlocks financial ledger and global settings</span>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                checked={isSuperAdmin}
                onChange={(e) => setIsSuperAdmin(e.target.checked)}
              />
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
                        {admin.firstName} {admin.lastName}
                        {admin.id === currentUserId && (
                          <span className="ml-1.5 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">
                            Self
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs">{admin.email}</td>
                      <td className="py-3.5 px-6">
                        {admin.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Super Admin
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
                        <button
                          onClick={() => handleDelete(admin.id)}
                          disabled={admin.id === currentUserId}
                          className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-30 disabled:hover:text-red-600 transition"
                          title={admin.id === currentUserId ? "Cannot delete yourself" : "Delete administrator account"}
                        >
                          Delete Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
