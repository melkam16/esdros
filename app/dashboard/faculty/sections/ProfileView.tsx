'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileView() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/faculty/profile');
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Create a response that clears the cookie
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logout: true }),
      });

      // Clear token from localStorage if it exists and redirect
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
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">👨‍🏫</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Faculty Profile</h1>
              <p className="text-sm text-slate-500 mt-1">Account Information & Settings</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {isLoggingOut ? 'Logging out...' : '🚪 Logout'}
          </button>
        </div>
      </div>

      {/* Profile Information Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 animate-pulse">Loading profile data...</div>
      ) : profile ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b">Personal Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
              <p className="text-sm font-medium text-slate-700 mt-1">{profile.firstName}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
              <p className="text-sm font-medium text-slate-700 mt-1">{profile.lastName}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <p className="text-sm font-medium text-slate-700 mt-1 font-mono">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Department & Assignment Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b">Department Assignment</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
              <p className="text-sm font-medium text-slate-700 mt-1">{profile.departmentName}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Code</label>
              <p className="text-sm font-medium text-slate-700 mt-1 font-mono">{profile.departmentCode}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Course Sections</label>
              <p className="text-sm font-bold text-indigo-600 mt-1">{profile.activeCourses} Active Sections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Courses</p>
          <p className="text-2xl font-bold text-indigo-600">{profile.activeCourses}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Students</p>
          <p className="text-2xl font-bold text-emerald-600">{profile.totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Grades</p>
          <p className="text-2xl font-bold text-amber-600">12</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Messages</p>
          <p className="text-2xl font-bold text-blue-600">5</p>
        </div>
      </div>

      {/* Account Security Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b">Account Security</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Password</p>
            <p className="text-xs text-slate-500 mt-1">Last changed 45 days ago</p>
          </div>
          <button className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
            Change Password
          </button>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b">Session Management</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Current Session</p>
              <p className="text-xs text-slate-500 mt-1">Active • Last activity: Just now</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>
      </div>
      </>
      ) : (
        <div className="p-8 text-center text-red-500">Failed to load profile.</div>
      )}
    </div>
  );
}
