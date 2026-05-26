'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default function FacultyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  
  // Feedback state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/faculty/profile');
      const d = await res.json();
      if (d.success) {
        setProfile(d.data);
        setTitle(d.data.title || '');
        setFirstName(d.data.firstName || '');
        setLastName(d.data.lastName || '');
        setEmail(d.data.email || '');
        setPictureUrl(d.data.pictureUrl || '');
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFeedback({ type: 'error', text: 'First name, last name, and email are required fields.' });
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/faculty/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || undefined,
          firstName,
          lastName,
          email,
          pictureUrl: pictureUrl || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'Your profile has been updated successfully!' });
        fetchProfile(); // reload metrics and headers
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', text: 'An unexpected network error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200">
      <SidebarNavigation role="FACULTY" />

      <main className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Premium Header Container */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20"></div>

          {pictureUrl ? (
            <img
              src={pictureUrl}
              alt="Faculty Roster"
              className="relative z-10 w-32 h-32 object-cover rounded-full shadow-lg shadow-indigo-500/20 border-4 border-white flex-shrink-0"
              onError={(e) => {
                // fall back to default emoji
                (e.target as any).style.display = 'none';
              }}
            />
          ) : (
            <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-5xl shadow-lg shadow-indigo-500/30 text-white flex-shrink-0 border-4 border-white">
              👨‍🏫
            </div>
          )}

          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active Faculty Profile
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? 'Loading Profile...' : profile ? `${title ? title + ' ' : ''}${profile.firstName} ${profile.lastName}` : 'Faculty Member'}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {profile?.departmentName || 'Department of Instruction'}
            </p>
          </div>

          <div className="relative z-10">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 text-sm"
            >
              {isLoggingOut ? 'Logging out...' : 'Secure Exit Sign Out'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : !profile ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="text-5xl mb-4 opacity-50">❌</div>
            <h3 className="text-xl font-bold text-slate-700">Profile Not Found</h3>
            <p className="text-slate-500 mt-2">Could not retrieve your faculty identity data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/30 lg:col-span-2 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-800">Update Profile Details</h2>
                <p className="text-xs text-slate-400 mt-1">Modify your instructional rank and core contact information.</p>
              </div>

              {feedback && (
                <div
                  className={`p-4 rounded-xl text-sm border font-medium ${
                    feedback.type === 'success'
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title Select Section */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Faculty Title Prefix</label>
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 font-medium text-slate-700 transition"
                    >
                      <option value="">None (No Prefix)</option>
                      <option value="Dn.">Dn. (Deacon)</option>
                      <option value="Rev.">Rev. (Reverend)</option>
                      <option value="Dr.">Dr. (Doctor)</option>
                      <option value="Professor">Professor</option>
                      <option value="Archdeacon">Archdeacon</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                    </select>
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 transition"
                      placeholder="Enter first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 transition"
                      placeholder="Enter last name"
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 font-mono transition"
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Portrait URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Portrait Photo URL (Optional)</label>
                    <input
                      type="url"
                      value={pictureUrl}
                      onChange={(e) => setPictureUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 transition"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving Profile Changes...</>
                  ) : (
                    'Save Profile Changes'
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              
              {/* Department Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/30">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-xl">🏛️</div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Department Affiliation</p>
                <p className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  {profile.departmentName}
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-black font-mono border border-slate-200">
                    {profile.departmentCode}
                  </span>
                </p>
              </div>

              {/* Statistics Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/30">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 text-xl">📊</div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Teaching Overview</p>
                <p className="text-lg font-extrabold text-slate-800">
                  <span className="text-emerald-600 font-black">{profile.activeCourses}</span> Assigned Course Sections
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Total Enrolled Students</span>
                  <span className="text-2xl font-black text-slate-700">{profile.totalStudents}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
