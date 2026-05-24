// components/SidebarNavigation.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SidebarProps {
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
}

export default function SidebarNavigation({ role }: SidebarProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isStandardAdmin, setIsStandardAdmin] = useState(false);
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'FACULTY' | 'STUDENT'>(role);
  const [hasFacultyProfile, setHasFacultyProfile] = useState(false);
  const [dbRole, setDbRole] = useState<string | null>(null);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Synchronize activeRole with the current layout role prop on page transitions
  useEffect(() => {
    setActiveRole(role);
  }, [role]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.name) setUserName(data.name);
        if (data.id) setUserId(data.id.substring(0, 8).toUpperCase());
        if (data.isSuperAdmin) setIsSuperAdmin(true);
        if (data.isStandardAdmin) setIsStandardAdmin(true);
        if (data.hasFacultyProfile) setHasFacultyProfile(true);
        if (data.role) setDbRole(data.role);
      })
      .catch(err => console.error('Failed to fetch user metadata', err));
  }, []);

  const modules = {
    ADMIN: [
      {
        title: 'Dashboard',
        items: [
          { name: 'Overview Console', href: '/dashboard/admin', icon: '📊' },
        ],
      },
      {
        title: 'CRM & Admissions',
        items: [
          { name: 'Leads & Applications', href: '/dashboard/admin/admissions', icon: '📥' },
          { name: 'Enrollment Processing', href: '/dashboard/admin/enrollments', icon: '📝' },
        ],
      },
      {
        title: 'Learning Management System',
        items: [
          { name: 'Academic Structure', href: '/dashboard/admin/academics', icon: '🏛️' },
          { name: 'Course Management', href: '/dashboard/admin/courses', icon: '📚' },
        ],
      },
      {
        title: 'HR Management',
        items: [
          { name: 'Faculty Directory', href: '/dashboard/admin/faculty', icon: '👨‍🏫' },
        ],
      },
      {
        title: 'Finance & Accounting',
        items: [
          { name: 'Fee Management', href: '/dashboard/admin/finance', icon: '💳' },
        ],
      },
      {
        title: 'Degree & Transcripts',
        items: [
          { name: 'Degree Audit', href: '/dashboard/admin/degrees', icon: '🎓' },
          { name: 'Official Transcripts', href: '/dashboard/admin/transcripts', icon: '📜' },
          { name: 'Alumni Records', href: '/dashboard/admin/alumni', icon: '🏛️' },
          { name: 'Alumni Requests', href: '/dashboard/admin/requests', icon: '📥' },
        ],
      },
      {
        title: 'Reports & Analytics',
        items: [
          { name: 'System Reports', href: '/dashboard/admin/reports', icon: '📈' },
        ],
      },
      {
        title: 'System Administration',
        items: [
          { name: 'Manage Admins', href: '/dashboard/admin/manage-admins', icon: '👥' },
          { name: 'Settings', href: '/dashboard/admin/settings', icon: '⚙️' },
        ],
      },
    ],
    FACULTY: [
      {
        title: 'Core System',
        items: [
          { name: 'Dashboard Home', href: '/dashboard/faculty', icon: '🏠' },
          { name: 'Notification Center', href: '/dashboard/faculty/notifications', icon: '🔔' },
        ],
      },
      {
        title: 'Learning Management System',
        items: [
          { name: 'My Courses', href: '/dashboard/faculty/courses', icon: '🏫' },
          { name: 'Attendance Tracking', href: '/dashboard/faculty/attendance', icon: '📅' },
          { name: 'Gradebook', href: '/dashboard/faculty/gradebook', icon: '📈' },
          { name: 'My Students', href: '/dashboard/faculty/students', icon: '👥' },
        ],
      },
      {
        title: 'Faculty Profile',
        items: [
          { name: 'Profile & Settings', href: '/dashboard/faculty/profile', icon: '👨‍🏫' },
        ],
      },
    ],
    STUDENT: [
      {
        title: 'Core System',
        items: [
          { name: 'Dashboard Home', href: '/dashboard/student', icon: '🎓' },
          { name: 'Notification Center', href: '/dashboard/student/notifications', icon: '🔔' },
        ],
      },
      {
        title: 'Student Information System',
        items: [
          { name: 'Student Profile', href: '/dashboard/student/profile', icon: '👤' },
          { name: 'Account Settings', href: '/dashboard/student/settings', icon: '⚙️' },
        ],
      },
      {
        title: 'Learning Management System',
        items: [
          { name: 'Enrollment Console', href: '/dashboard/student/enrollment', icon: '📝' },
          { name: 'Academic Record', href: '/dashboard/student/academics', icon: '📄' },
          { name: 'Attendance History', href: '/dashboard/student/attendance', icon: '📅' },
        ],
      },
      {
        title: 'Finance & Accounting',
        items: [
          { name: 'Fee & Payment', href: '/dashboard/student/finance', icon: '💳' },
        ],
      },
    ],
  };

  const rawModules = modules[activeRole] || [];
  const activeModules = rawModules.map(module => {
    if (activeRole === 'ADMIN') {
      const filtered = module.items.filter(item => {
        // Only Super Admins can access manage-admins
        if (item.href.includes('/manage-admins') && !isSuperAdmin) {
          return false;
        }
        // Only Super Admins and Standard Admins can access settings, finance, reports, and requests
        if (!isSuperAdmin && !isStandardAdmin) {
          if (
            item.href.includes('/settings') ||
            item.href.includes('/finance') ||
            item.href.includes('/reports') ||
            item.href.includes('/requests')
          ) {
            return false;
          }
        }
        return true;
      });
      return { ...module, items: filtered };
    }
    return module;
  }).filter(module => module.items.length > 0);

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-white leading-tight">Esderos EOTC Theological Seminary</h2>
          <p className="text-xs text-[#009fe5] font-semibold mt-0.5 uppercase tracking-wider truncate">
            {userName && userId ? `${userName} (${userId})` : 'Class365 SMS'}
          </p>
        </div>
        {/* Close button — tablet/mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Role view switcher if user has both Admin role and Faculty profile */}
      {dbRole === 'ADMIN' && hasFacultyProfile && (
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/45">
          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
            Clearance View
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => {
                setActiveRole('ADMIN');
                window.location.href = '/dashboard/admin';
              }}
              className={`text-center py-1.5 px-1.5 text-xs font-bold rounded-lg transition-all ${
                activeRole === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Admin View
            </button>
            <button
              onClick={() => {
                setActiveRole('FACULTY');
                window.location.href = '/dashboard/faculty';
              }}
              className={`text-center py-1.5 px-1.5 text-xs font-bold rounded-lg transition-all ${
                activeRole === 'FACULTY'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Faculty View
            </button>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {activeModules.map((module) => (
          <div key={module.title} className="space-y-0.5">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              {module.title}
            </h3>
            {module.items.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{link.icon}</span>
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <a
          href="/api/auth/logout"
          className="block text-center text-xs text-red-400 hover:text-red-300 font-medium py-2 rounded border border-red-900/50 hover:bg-red-950/30 transition"
        >
          Sign Out
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE / TABLET TOP BAR (< 1024px) ──────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm font-bold text-white">Esderos EOTC Theological Seminary</span>
        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 uppercase tracking-wider">
          {activeRole}
        </span>
      </div>

      {/* ── DESKTOP SIDEBAR (≥ 1024px) ───────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-slate-100 h-screen fixed left-0 top-0 border-r border-slate-800 z-30">
        <SidebarContent />
      </aside>

      {/* ── MOBILE / TABLET DRAWER OVERLAY (< 1024px) ────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer panel */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-slate-900 text-slate-100 h-full shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}