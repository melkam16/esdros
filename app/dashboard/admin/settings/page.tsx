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
    PUBLIC_REGISTRATION_LOCKED: 'false',
    ENFORCE_MFA: 'false',
    IS_SUPER_ADMIN: 'false',
    IS_STANDARD_ADMIN: 'false'
  });

  // Notifications context
  const [classes, setClasses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  
  // Notification Form states
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTargetType, setNotifTargetType] = useState('ALL_STUDENTS');
  const [notifTargetValue, setNotifTargetValue] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Security / Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassFeedback(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassFeedback({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passRegex.test(newPassword)) {
      setPassFeedback({
        type: 'error',
        text: 'Password combination rules: must be more than 7 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPassFeedback({ type: 'success', text: data.message || 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassFeedback({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch (err) {
      setPassFeedback({ type: 'error', text: 'An unexpected network error occurred.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const fetchSettingsAndContext = async () => {
    try {
      // 1. Fetch settings
      const settingsRes = await fetch('/api/admin/settings');
      const settingsResult = await settingsRes.json();
      if (settingsResult.success) {
        setFormData(settingsResult.data);
      }

      // 2. Fetch notifications lists, classes, and departments
      const notifRes = await fetch('/api/admin/notifications');
      const notifResult = await notifRes.json();
      if (notifResult.success) {
        setClasses(notifResult.data.classes);
        setDepartments(notifResult.data.departments);
        setRecentNotifications(notifResult.data.notifications);
        // Default target value if BATCH or DEPARTMENT is selected
        if (notifResult.data.classes.length > 0) {
          setNotifTargetValue(notifResult.data.classes[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error connecting to administrative services APIs.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndContext();
  }, []);

  const handleSaveCard = async (keys: string[], cardName: string) => {
    setMessage(null);
    if (formData.IS_SUPER_ADMIN !== 'true' && formData.IS_STANDARD_ADMIN !== 'true') {
      setMessage({ type: 'error', text: 'Forbidden: Only Super Administrators or Standard Administrators can alter institutional settings.' });
      return;
    }

    if (formData.IS_STANDARD_ADMIN === 'true' && formData.IS_SUPER_ADMIN !== 'true') {
      const restrictedKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', 'APLOS_API_KEY', 'APLOS_PARTNER_ID'];
      const hasRestricted = keys.some(k => restrictedKeys.includes(k));
      if (hasRestricted) {
        setMessage({ type: 'error', text: 'Forbidden: Standard Admins are not permitted to configure SMTP Mail Gateway Integration or Aplos Financial Gateways.' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: any = {};
      keys.forEach(k => {
        payload[k] = formData[k as keyof typeof formData];
      });

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: `Success: ${cardName} configurations updated successfully!` });
        // Clear SMTP password input fields
        if (keys.includes('SMTP_PASSWORD')) {
          setFormData(prev => ({ ...prev, SMTP_PASSWORD: '' }));
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update configuration card.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network exception updating configuration card.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!notifTitle.trim() || !notifMessage.trim()) {
      setMessage({ type: 'error', text: 'Please fill in announcement title and body message.' });
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notifTitle,
          message: notifMessage,
          targetType: notifTargetType,
          targetValue: notifTargetValue
        })
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Notification broadcast completed successfully!' });
        // Clear fields
        setNotifTitle('');
        setNotifMessage('');
        // Refresh recent announcements feed
        fetchSettingsAndContext();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to transmit broadcast alert.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error broadcasting announcement.' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const isSuperAdmin = formData.IS_SUPER_ADMIN === 'true';

  // Align default selection targetValue when targetType changes
  const handleTargetTypeChange = (val: string) => {
    setNotifTargetType(val);
    if (val === 'BATCH' && classes.length > 0) {
      setNotifTargetValue(classes[0].id);
    } else if (val === 'DEPARTMENT' && departments.length > 0) {
      setNotifTargetValue(departments[0].id);
    } else {
      setNotifTargetValue('');
    }
  };

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-100/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-slate-950/20 text-white flex-shrink-0">
              ⚙️
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Configuration Settings</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Configure SMTP, Aplos accounting gateways, registration locks, and publish portal announcements.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0 flex gap-2">
            {isSuperAdmin && (
              <span className="px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
                👑 Super Admin Mode Active
              </span>
            )}
            {formData.IS_STANDARD_ADMIN === 'true' && !isSuperAdmin && (
              <span className="px-4 py-2 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
                🛡️ Standard Admin Active
              </span>
            )}
            {!isSuperAdmin && formData.IS_STANDARD_ADMIN !== 'true' && (
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
            Loading platform system parameters...
          </div>
        ) : (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card 1: SMTP Outbound Gateway Settings */}
              {isSuperAdmin && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
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
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                            disabled={!isSuperAdmin}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">SMTP Port</label>
                          <input 
                            type="text" 
                            value={formData.SMTP_PORT}
                            onChange={e => setFormData(prev => ({ ...prev, SMTP_PORT: e.target.value }))}
                            placeholder="587"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                            disabled={!isSuperAdmin}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">SMTP Username</label>
                        <input 
                          type="text" 
                          value={formData.SMTP_USER}
                          onChange={e => setFormData(prev => ({ ...prev, SMTP_USER: e.target.value }))}
                          placeholder="no-reply@esderos.org"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                          disabled={!isSuperAdmin}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">SMTP Secure Password</label>
                        <input 
                          type="password" 
                          value={formData.SMTP_PASSWORD}
                          onChange={e => setFormData(prev => ({ ...prev, SMTP_PASSWORD: e.target.value }))}
                          placeholder="••••••••••••"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                          disabled={!isSuperAdmin}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Sender Address & Name ("From")</label>
                        <input 
                          type="text" 
                          value={formData.SMTP_FROM}
                          onChange={e => setFormData(prev => ({ ...prev, SMTP_FROM: e.target.value }))}
                          placeholder="Esderos Seminary <no-reply@esderos.org>"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                          disabled={!isSuperAdmin}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleSaveCard(['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'], 'SMTP Gateway')}
                      disabled={isSaving || !isSuperAdmin}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all disabled:bg-slate-350 text-xs uppercase tracking-wider"
                    >
                      {isSaving ? 'Saving...' : 'Update SMTP Outbound'}
                    </button>
                  </div>
                </div>
              )}

              {/* Card 2: Aplos Accounting Integrations */}
              {isSuperAdmin && (
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
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                          disabled={!isSuperAdmin}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Aplos Organisation / Org ID</label>
                        <input 
                          type="text" 
                          value={formData.APLOS_PARTNER_ID}
                          onChange={e => setFormData(prev => ({ ...prev, APLOS_PARTNER_ID: e.target.value }))}
                          placeholder="aplos_org_38402..."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                          disabled={!isSuperAdmin}
                        />
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">🔒 Direct Aplos Sync</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Database integrations sync invoices, tuition receipts, and scholarship records immediately to the secure ledger without manual accounting updates.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleSaveCard(['APLOS_API_KEY', 'APLOS_PARTNER_ID'], 'Aplos Financials')}
                      disabled={isSaving || !isSuperAdmin}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all disabled:bg-slate-350 text-xs uppercase tracking-wider"
                    >
                      {isSaving ? 'Saving...' : 'Update Aplos Credentials'}
                    </button>
                  </div>
                </div>
              )}

              {/* Card 3: Semester Calendar & Date Ranges */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">📅</span>
                      Academic Calendar & Semesters
                    </h2>
                  </div>
                  
                  <div className="p-8 space-y-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Current Active Term Identifier</label>
                      <input 
                        type="text" 
                        value={formData.CURRENT_SEMESTER}
                        onChange={e => setFormData(prev => ({ ...prev, CURRENT_SEMESTER: e.target.value }))}
                        placeholder="Fall 2026"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                        disabled={!isSuperAdmin && formData.IS_STANDARD_ADMIN !== 'true'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Semester Start Date</label>
                        <input 
                          type="date" 
                          value={formData.SEMESTER_START}
                          onChange={e => setFormData(prev => ({ ...prev, SEMESTER_START: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                          disabled={!isSuperAdmin && formData.IS_STANDARD_ADMIN !== 'true'}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Semester End Date</label>
                        <input 
                          type="date" 
                          value={formData.SEMESTER_END}
                          onChange={e => setFormData(prev => ({ ...prev, SEMESTER_END: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all disabled:opacity-50" 
                          disabled={!isSuperAdmin && formData.IS_STANDARD_ADMIN !== 'true'}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleSaveCard(['CURRENT_SEMESTER', 'SEMESTER_START', 'SEMESTER_END'], 'Academic Semester')}
                    disabled={isSaving || (!isSuperAdmin && formData.IS_STANDARD_ADMIN !== 'true')}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-md transition-all disabled:bg-slate-350 text-xs uppercase tracking-wider"
                  >
                    {isSaving ? 'Saving...' : 'Update Term Schedule'}
                  </button>
                </div>
              </div>

              {/* Card 4: Global Administrative Safeguards (Locks) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-sm">🔒</span>
                      Global Administrative Controls
                    </h2>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    {/* Course Registration Lock */}
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-850 text-sm">Student Course Registration Lock</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                          If locked, active students cannot add, drop, or register for courses internally in their portal.
                        </p>
                      </div>
                      <div>
                        <select 
                          value={formData.REGISTRATION_LOCKED}
                          onChange={e => setFormData(prev => ({ ...prev, REGISTRATION_LOCKED: e.target.value }))}
                          className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all disabled:opacity-50"
                          disabled={!isSuperAdmin && formData.IS_STANDARD_ADMIN !== 'true'}
                        >
                          <option value="false">🔓 OPEN / Active</option>
                          <option value="true">🔒 LOCKED / Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Public Student Admissions Lock */}
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-850 text-sm">Public Website Registration Lock</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                          If locked, the public admissions form blocks prospective students from submitting new applications.
                        </p>
                      </div>
                      <div>
                        <select 
                          value={formData.PUBLIC_REGISTRATION_LOCKED}
                          onChange={e => setFormData(prev => ({ ...prev, PUBLIC_REGISTRATION_LOCKED: e.target.value }))}
                          className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all disabled:opacity-50"
                          disabled={!isSuperAdmin && formData.IS_STANDARD_ADMIN !== 'true'}
                        >
                          <option value="false">🔓 OPEN / Active</option>
                          <option value="true">🔒 LOCKED / Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Enforce Two-Factor Auth (MFA) by Email */}
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-850 text-sm">Enforce Two-Factor Auth (MFA) by Email</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                          If enabled, all users must verify a secure 6-digit one-time passcode (MFA OTP) sent to their email during login.
                        </p>
                      </div>
                      <div>
                        <select 
                          value={formData.ENFORCE_MFA}
                          onChange={e => setFormData(prev => ({ ...prev, ENFORCE_MFA: e.target.value }))}
                          className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all disabled:opacity-50"
                          disabled={!isSuperAdmin && formData.IS_STANDARD_ADMIN !== 'true'}
                        >
                          <option value="false">🔓 OPTIONAL / Off</option>
                          <option value="true">🔒 ENFORCED / On</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleSaveCard(['REGISTRATION_LOCKED', 'PUBLIC_REGISTRATION_LOCKED', 'ENFORCE_MFA'], 'Safeguard Access')}
                    disabled={isSaving || (!isSuperAdmin && formData.IS_STANDARD_ADMIN !== 'true')}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition-all disabled:bg-slate-350 text-xs uppercase tracking-wider"
                  >
                    {isSaving ? 'Saving...' : 'Update Global Safeguards'}
                  </button>
                </div>
              </div>

            </div>

            {/* Notification Manager Panel */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-sm">📢</span>
                  Institutional Notifications Publisher & Email Broadcaster
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Draft announcements and immediately dispatch push notifications inside portals, paired with dynamic SMTP email delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                {/* Form column */}
                <form onSubmit={handleSendBroadcast} className="p-8 lg:col-span-1 space-y-5">
                  <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-50 pb-2">Create Announcement</h3>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Target Scope</label>
                    <select
                      value={notifTargetType}
                      onChange={(e) => handleTargetTypeChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    >
                      <option value="ALL_STUDENTS">👨‍🎓 All Registered Students</option>
                      <option value="ALL_FACULTY">👨‍🏫 All Seminary Staff & Faculty</option>
                      <option value="BATCH">🎓 Custom Batch / Class Cohort</option>
                      <option value="DEPARTMENT">🏛️ Specific Department</option>
                      <option value="INDIVIDUAL">✉️ Individual Roster Email</option>
                    </select>
                  </div>

                  {/* Class Cohort Dropdown */}
                  {notifTargetType === 'BATCH' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Select Target Cohort / Class</label>
                      <select
                        value={notifTargetValue}
                        onChange={(e) => setNotifTargetValue(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.department.code})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Department Dropdown */}
                  {notifTargetType === 'DEPARTMENT' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Select Target Department</label>
                      <select
                        value={notifTargetValue}
                        onChange={(e) => setNotifTargetValue(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Individual Email */}
                  {notifTargetType === 'INDIVIDUAL' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient's Registered Email</label>
                      <input
                        type="email"
                        value={notifTargetValue}
                        onChange={(e) => setNotifTargetValue(e.target.value)}
                        placeholder="student@esderos.org"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Announcement Title</label>
                    <input
                      type="text"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="e.g. Midterm Examination Broadcast Schedule"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Message Body</label>
                    <textarea
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      placeholder="Type details of your announcement..."
                      rows={5}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 leading-relaxed"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:bg-slate-300"
                  >
                    {isBroadcasting ? 'Broadcasting...' : '📢 Send Broadcast Alert'}
                  </button>
                </form>

                {/* Sent List column */}
                <div className="p-8 lg:col-span-2 space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-50 pb-2">Recent Announcements History</h3>
                  
                  {recentNotifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      📭 No previously transmitted announcements found.
                    </div>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 select-none">
                      {recentNotifications.map(n => (
                        <div key={n.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] font-extrabold uppercase tracking-widest rounded-md border border-cyan-100">
                              {n.targetType}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-850 text-sm">{n.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line truncate-3-lines">
                            {n.message}
                          </p>
                          {n.targetValue && (
                            <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1.5 flex items-center gap-1.5 bg-slate-100/50 px-2 py-1 rounded-lg w-max">
                              🎯 Value: {n.targetValue}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card: Security & Password Reset */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">🔐</span>
                  Personal Account Security & Password
                </h2>
                <p className="text-xs text-slate-400 mt-1">Manage your administrative credentials and security options.</p>
              </div>

              <div className="p-8 space-y-6">
                {passFeedback && (
                  <div
                    className={`p-4 rounded-xl text-sm border font-medium ${
                      passFeedback.type === 'success'
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {passFeedback.text}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-medium italic">
                    To comply with seminary portal administrative credentials, your new password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-slate-900/25 transition disabled:opacity-50"
                    >
                      {isChangingPass ? 'Updating Credentials...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
