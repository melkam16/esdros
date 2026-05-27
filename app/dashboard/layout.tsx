'use client';

import { useState, useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mustChange, setMustChange] = useState(false);
  const [loading, setLoading] = useState(true);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if password reset is forced
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (data.mustChangePassword) {
          setMustChange(true);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user metadata in layout:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleForceChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passRegex.test(newPassword)) {
      setError('Password combination rules: must be more than 7 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        // Clear screen block
        setTimeout(() => {
          setMustChange(false);
        }, 1500);
      } else {
        setError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setError('An unexpected network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Verifying Security Status...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {mustChange && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300 select-none">
          <div className="bg-white/95 border border-slate-200 rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl space-y-6 relative overflow-hidden text-center animate-in zoom-in-95 duration-200">
            {/* Absolute background graphics */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-amber-500/20 shadow-sm animate-bounce">
                🔐
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Change Password Required</h2>
                <p className="text-xs text-slate-400 font-medium">
                  For your safety, you must update your temporary credentials before you can access the Esdros Seminary portal.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl text-xs border bg-rose-50 border-rose-200 text-rose-800 font-medium leading-relaxed text-left">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl text-xs border bg-emerald-50 border-emerald-200 text-emerald-800 font-bold flex items-center justify-center gap-2">
                  🎉 Password Changed Successfully! Loading your portal...
                </div>
              )}

              {!success && (
                <form onSubmit={handleForceChange} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter temporary password"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full mt-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-slate-900/25 transition disabled:opacity-50"
                  >
                    {isSaving ? 'Securing Account...' : 'Set New Password & Login'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
