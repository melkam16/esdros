'use client';

import { useState, useEffect } from 'react';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    pictureUrl: '',
    password: '',
    confirmPassword: '',
    status: 'ACTIVE'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawalSubmitting, setWithdrawalSubmitting] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);

  const fetchWithdrawalRequests = async () => {
    try {
      const res = await fetch('/api/student/withdrawal');
      const result = await res.json();
      if (result.success) {
        setWithdrawalRequests(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawal requests', err);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/student/settings');
        const result = await res.json();
        if (result.success) {
          setFormData(prev => ({
            ...prev,
            firstName: result.data.firstName || '',
            lastName: result.data.lastName || '',
            email: result.data.email || '',
            phone: result.data.phone || '',
            bio: result.data.bio || '',
            pictureUrl: result.data.pictureUrl || '',
            status: result.data.status || 'ACTIVE'
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
    fetchWithdrawalRequests();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password) {
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passRegex.test(formData.password)) {
        setMessage({ 
          type: 'error', 
          text: 'Password combination rules: must be more than 7 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.' 
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/student/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          pictureUrl: formData.pictureUrl,
          password: formData.password || undefined
        })
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Settings and profile updated successfully!' });
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update settings.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error updating configurations.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalReason.trim()) {
      alert("Please provide a reason for withdrawal.");
      return;
    }

    setWithdrawalSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/student/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: withdrawalReason })
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setWithdrawalReason('');
        fetchWithdrawalRequests();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit withdrawal request.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error connecting to withdrawal services.' });
    } finally {
      setWithdrawalSubmitting(false);
    }
  };

  const isWithdrawn = formData.status === 'WITHDRAWN';

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {isWithdrawn && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm text-amber-900 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-350">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Account Status: WITHDRAWN</h3>
              <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                This student account is currently in <b>Read-Only Mode</b>. Your withdrawal request has been approved by the administrative registrar. Profile modifications, course registrations, and credential modifications are permanently locked.
              </p>
            </div>
          </div>
        )}

        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-indigo-900/30 text-white flex-shrink-0">
            ⚙️
          </div>
          
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl">
              Manage your institutional student profile, customized metadata, contact details, and secure login credentials.
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-350 ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span>{message.type === 'success' ? '✅' : '❌'}</span>
            <p>{message.text}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-12 text-center text-slate-500 font-medium">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading settings context...
          </div>
        ) : (
          <>
            <form onSubmit={handleSave} className="space-y-8">
            
            {/* Section 1: Profile Customization */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">👤</span>
                  Profile Customization
                </h2>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50" 
                    required
                    disabled={isWithdrawn}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50" 
                    required
                    disabled={isWithdrawn}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Institutional Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono font-medium focus:outline-none cursor-not-allowed" 
                  />
                  <p className="text-[10px] text-slate-400 font-medium">To modify your institutional email address, contact the IT Registrar.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251-XXX-XXXXXX"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50" 
                    disabled={isWithdrawn}
                  />
                </div>

                <div className="col-span-full space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Portrait URL</label>
                  <input 
                    type="url" 
                    value={formData.pictureUrl}
                    onChange={e => setFormData(prev => ({ ...prev, pictureUrl: e.target.value }))}
                    placeholder="https://example.com/my-photo.jpg"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50" 
                    disabled={isWithdrawn}
                  />
                </div>

                <div className="col-span-full space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">About Me / Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about your studies, theological interests, and spiritual growth goals..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50" 
                    disabled={isWithdrawn}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Security & Password Update */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">🔐</span>
                  Security & Authentication
                </h2>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">New Secure Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50" 
                      disabled={isWithdrawn}
                    />
                    <span className="absolute right-4 top-3 text-slate-400">🔑</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50" 
                      disabled={isWithdrawn}
                    />
                    <span className="absolute right-4 top-3 text-slate-400">🔑</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium col-span-full">Self-service password resets are now fully active. Enter a new password to modify your authentication credentials.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="submit"
                disabled={isSaving || isWithdrawn}
                className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {isSaving ? 'Saving Configurations...' : 'Save Settings'}
              </button>
            </div>

          </form>

          {/* Danger Zone: Withdrawal & Account Deactivation */}
          <div className="bg-white rounded-3xl border border-rose-100 shadow-lg shadow-rose-100/30 overflow-hidden">
            <div className="p-8 border-b border-rose-100 bg-rose-50/20">
              <h2 className="text-xl font-extrabold text-rose-800 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-sm">⚠️</span>
                Danger Zone: Account Withdrawal Request
              </h2>
            </div>
            
            <div className="p-8 space-y-6">
              {isWithdrawn ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                  ℹ️ You are already registered as formally withdrawn. No further withdrawal requests can be submitted.
                </div>
              ) : (
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Submit Student Withdrawal Request</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Please state the reason for your withdrawal request below. Upon administrative approval, your student status will change to <b>WITHDRAWN</b> and your portal will become permanently read-only.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Reason for Withdrawal</label>
                    <textarea
                      required
                      value={withdrawalReason}
                      onChange={(e) => setWithdrawalReason(e.target.value)}
                      placeholder="Please specify your reasons (e.g. personal, health, transferring, etc.) to help the registrar evaluate your request..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-sm"
                    />
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="submit"
                      disabled={withdrawalSubmitting || !withdrawalReason.trim()}
                      className="px-6 py-3.5 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 font-extrabold rounded-xl border border-rose-200 transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
                    >
                      🚫 {withdrawalSubmitting ? 'Submitting Request...' : 'Submit Withdrawal Request'}
                    </button>
                  </div>
                </form>
              )}

              {/* Request History */}
              {withdrawalRequests.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Withdrawal Requests History</h4>
                  <div className="overflow-hidden border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Date Submitted</th>
                          <th className="p-3">Reason</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {withdrawalRequests.map((req: any) => (
                          <tr key={req.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 font-medium whitespace-nowrap">
                              {new Date(req.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="p-3 max-w-xs truncate" title={req.reason}>
                              {req.reason}
                            </td>
                            <td className="p-3 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wider ${
                                req.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : req.status === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          </>
        )}

      </main>
    </div>
  );
}