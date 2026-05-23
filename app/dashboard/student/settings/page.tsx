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
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
            pictureUrl: result.data.pictureUrl || ''
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password) {
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
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

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                    required
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                  />
                </div>

                <div className="col-span-full space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Portrait URL</label>
                  <input 
                    type="url" 
                    value={formData.pictureUrl}
                    onChange={e => setFormData(prev => ({ ...prev, pictureUrl: e.target.value }))}
                    placeholder="https://example.com/my-photo.jpg"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                  />
                </div>

                <div className="col-span-full space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">About Me / Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about your studies, theological interests, and spiritual growth goals..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
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
                disabled={isSaving}
                className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {isSaving ? 'Saving Configurations...' : 'Save Settings'}
              </button>
            </div>

          </form>
        )}

      </main>
    </div>
  );
}