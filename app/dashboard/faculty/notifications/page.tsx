'use client';

import { useState, useEffect } from 'react';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default function FacultyNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/faculty/notifications');
        const result = await res.json();
        if (result.success) {
          setNotifications(result.data);
        }
      } catch (err) {
        console.error('Failed to load faculty notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getTargetBadge = (type: string) => {
    switch (type) {
      case 'ALL_FACULTY':
        return '📢 Staff Broadcast';
      case 'DEPARTMENT':
        return '🏛️ Department Alert';
      case 'INDIVIDUAL':
        return '✉️ Direct Message';
      default:
        return '🔔 System Alert';
    }
  };

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-205">
      <SidebarNavigation role="FACULTY" />
      <main className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-indigo-550/30 text-white flex-shrink-0">
            🔔
          </div>
          
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Faculty Notification Center</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl">
              Stay updated with academic calendar scheduling, administrative notices, and individual messages.
            </p>
          </div>
        </div>

        {/* Notifications Feed */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-md text-center text-slate-500 font-medium">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-550 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading announcements feed...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-100 shadow-md text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              📭
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Announcements Feed is Clear</h3>
            <p className="text-slate-500 text-sm mt-1">There are currently no active announcements matching your staff profile context.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n, i) => (
              <div 
                key={n.id} 
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/30 flex gap-6 hover:-translate-y-1 transition-transform relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                  📢
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-extrabold text-slate-900 text-lg">{n.title}</h3>
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border border-indigo-100">
                      {getTargetBadge(n.targetType)}
                    </span>
                    {i === 0 && (
                      <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md animate-pulse">New</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-line mt-2">
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">
                    Published {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
