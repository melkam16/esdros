'use client';

import { useState, useEffect } from 'react';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    SMTP_HOST: '',
    SMTP_PORT: '',
    SMTP_USER: '',
    SMTP_PASSWORD: '',
    SMTP_FROM: '',
    APLOS_API_KEY: '',
    APLOS_PARTNER_ID: '',
    CURRENT_SEMESTER: '',
    SEMESTER_START: '',
    SEMESTER_END: '',
    REGISTRATION_LOCKED: 'false',
    IS_SUPER_ADMIN: 'false'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const result = await res.json();
        if (result.success) {
          setFormData(result.data);
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to load system settings.' });
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Error connecting to the administrative api.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.IS_SUPER_ADMIN !== 'true') {
      setMessage({ type: 'error', text: 'Forbidden: Only Super Administrators can alter active configuration strings.' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'System settings updated successfully! All platform services are modified.' });
        // Clear SMTP password input after successful save to maintain security
        setFormData(prev => ({ ...prev, SMTP_PASSWORD: '' }));
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update configurations.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network exception occurred during settings update.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isSuperAdmin = formData.IS_SUPER_ADMIN === 'true';

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Dynamic Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-100/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-slate-950/20 text-white flex-shrink-0">
              ⚙️
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Configuration Settings</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Configure SMTP servers, accounting API gateways, and global academic semesters without code execution.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0">
            {isSuperAdmin ? (
              <span className="px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
                👑 Super Admin Mode Active
              </span>
            ) : (
              <span className="px-4 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2">
                🔒 Restricted Administrator Mode
              </span>
            )}
          </div>
        </div>

        {message && (
          <div className={`p-5 rounded-2xl border text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-350 ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span>{message.type === 'success' ? '✅' : '❌'}</span>
            <p>{message.text}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-500 font-medium">
            <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading global institutional settings...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Section 1: SMTP Settings */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">📬</span>
                      SMTP Mail Gateway Integration
                    </h2>
                  </div>
                  
                  <div className="p-8 space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">SMTP Outbound Host</label>
                        <input 
                          type="text" 
                          value={formData.SMTP_HOST}
                          onChange={e => setFormData(prev => ({ ...prev, SMTP_HOST: e.target.value }))}
                          placeholder="smtp.gmail.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                          disabled={!isSuperAdmin}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">SMTP Port</label>
                        <input 
                          type="text" 
                          value={formData.SMTP_PORT}
                          onChange={e => setFormData(prev => ({ ...prev, SMTP_PORT: e.target.value }))}
                          placeholder="587"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                          disabled={!isSuperAdmin}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">SMTP Username / Credential</label>
                      <input 
                        type="text" 
                        value={formData.SMTP_USER}
                        onChange={e => setFormData(prev => ({ ...prev, SMTP_USER: e.target.value }))}
                        placeholder="no-reply@esdros.org"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!isSuperAdmin}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">SMTP Secure Password</label>
                      <input 
                        type="password" 
                        value={formData.SMTP_PASSWORD}
                        onChange={e => setFormData(prev => ({ ...prev, SMTP_PASSWORD: e.target.value }))}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!isSuperAdmin}
                      />
                      <p className="text-[10px] text-slate-400 font-medium">Leave password empty to retain the currently configured secure SMTP gateway password.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Sender Address & Name ("From")</label>
                      <input 
                        type="text" 
                        value={formData.SMTP_FROM}
                        onChange={e => setFormData(prev => ({ ...prev, SMTP_FROM: e.target.value }))}
                        placeholder="Esdros Seminary <no-reply@esdros.org>"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!isSuperAdmin}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: API Keys & Gateways */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">🔑</span>
                      Accounting APIs & External Integration
                    </h2>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Aplos Financial API Key</label>
                      <input 
                        type="text" 
                        value={formData.APLOS_API_KEY}
                        onChange={e => setFormData(prev => ({ ...prev, APLOS_API_KEY: e.target.value }))}
                        placeholder="aplos_pk_live_..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!isSuperAdmin}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Aplos Gateway Partner / Org ID</label>
                      <input 
                        type="text" 
                        value={formData.APLOS_PARTNER_ID}
                        onChange={e => setFormData(prev => ({ ...prev, APLOS_PARTNER_ID: e.target.value }))}
                        placeholder="aplos_org_38402..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!isSuperAdmin}
                      />
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">🔒 Dynamic Security Policy</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        To guarantee structural compliance and complete institutional security, all external API strings are encrypted and committed securely to the Neon database under strict transaction protections.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Global Semester Dates */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">📅</span>
                    Academic Calendar & Semester Scheduling
                  </h2>
                </div>
                
                <div className="p-8 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Current Semester Term Identifier</label>
                    <input 
                      type="text" 
                      value={formData.CURRENT_SEMESTER}
                      onChange={e => setFormData(prev => ({ ...prev, CURRENT_SEMESTER: e.target.value }))}
                      placeholder="Fall 2026"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                      disabled={!isSuperAdmin}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Term Commencement Date</label>
                      <input 
                        type="date" 
                        value={formData.SEMESTER_START}
                        onChange={e => setFormData(prev => ({ ...prev, SEMESTER_START: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!isSuperAdmin}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Term Conclusion Date</label>
                      <input 
                        type="date" 
                        value={formData.SEMESTER_END}
                        onChange={e => setFormData(prev => ({ ...prev, SEMESTER_END: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!isSuperAdmin}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: System Safeguards & Lock */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-sm">🔒</span>
                      Global Administrative Controls
                    </h2>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Online Course Registration Lock</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                          If locked, students are prohibited from dynamically adding, dropping, or requesting course registrations.
                        </p>
                      </div>
                      <div>
                        <select 
                          value={formData.REGISTRATION_LOCKED}
                          onChange={e => setFormData(prev => ({ ...prev, REGISTRATION_LOCKED: e.target.value }))}
                          className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!isSuperAdmin}
                        >
                          <option value="false">🔓 OPEN / Active</option>
                          <option value="true">🔒 LOCKED / Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      {isSuperAdmin ? (
                        <button 
                          type="submit"
                          disabled={isSaving}
                          className="w-full lg:w-auto px-8 py-3.5 bg-slate-900 text-white font-extrabold rounded-xl shadow-lg shadow-slate-950/20 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        >
                          {isSaving ? 'Updating Global Configurations...' : 'Save Global Parameters'}
                        </button>
                      ) : (
                        <button 
                          type="button"
                          className="w-full lg:w-auto px-8 py-3.5 bg-slate-200 text-slate-400 font-extrabold rounded-xl cursor-not-allowed"
                          disabled
                        >
                          Read-only Credentials Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </form>
        )}

      </main>
    </div>
  );
}
