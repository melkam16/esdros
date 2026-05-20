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

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.name) setUserName(data.name);
        if (data.id) setUserId(data.id.substring(0, 8).toUpperCase());
      })
      .catch(err => console.error("Failed to fetch user metadata", err));
  }, []);

  const modules = {
    ADMIN: [
      {
        title: 'Dashboard',
        items: [
          { name: 'Overview Console', href: '/dashboard/admin', icon: '📊' },
        ]
      },
      {
        title: 'CRM & Admissions',
        items: [
          { name: 'Leads & Applications', href: '/dashboard/admin/admissions', icon: '📥' },
          { name: 'Enrollment Processing', href: '/dashboard/admin/enrollments', icon: '📝' },
        ]
      },
      {
        title: 'Learning Management System',
        items: [
          { name: 'Academic Structure', href: '/dashboard/admin/academics', icon: '🏛️' },
          { name: 'Course Management', href: '/dashboard/admin/courses', icon: '📚' },
        ]
      },
      {
        title: 'HR Management',
        items: [
          { name: 'Faculty Directory', href: '/dashboard/admin/faculty', icon: '👨‍🏫' },
        ]
      },
      {
        title: 'Finance & Accounting',
        items: [
          { name: 'Fee Management', href: '/dashboard/admin/finance', icon: '💳' },
        ]
      },
      {
        title: 'Degree & Transcripts',
        items: [
          { name: 'Degree Audit', href: '/dashboard/admin/degrees', icon: '🎓' },
          { name: 'Official Transcripts', href: '/dashboard/admin/transcripts', icon: '📜' },
          { name: 'Alumni Records', href: '/dashboard/admin/alumni', icon: '🏛️' },
        ]
      },
      {
        title: 'Reports & Analytics',
        items: [
          { name: 'System Reports', href: '/dashboard/admin/reports', icon: '📈' },
        ]
      },
      {
        title: 'System Administration',
        items: [
          { name: 'Settings', href: '/dashboard/admin/settings', icon: '⚙️' },
        ]
      }
    ],
    FACULTY: [
      {
        title: 'Core System',
        items: [
          { name: 'Dashboard Home', href: '/dashboard/faculty', icon: '🏠' },
        ]
      },
      {
        title: 'Learning Management System',
        items: [
          { name: 'My Courses', href: '/dashboard/faculty/courses', icon: '🏫' },
          { name: 'Attendance Tracking', href: '/dashboard/faculty/attendance', icon: '📅' },
          { name: 'Gradebook', href: '/dashboard/faculty/gradebook', icon: '📈' },
          { name: 'My Students', href: '/dashboard/faculty/students', icon: '👥' },
        ]
      },
      {
        title: 'Faculty Profile',
        items: [
          { name: 'Profile & Settings', href: '/dashboard/faculty/profile', icon: '👨‍🏫' },
        ]
      }
    ],
    STUDENT: [
      {
        title: 'Core System',
        items: [
          { name: 'Dashboard Home', href: '/dashboard/student', icon: '🎓' },
          { name: 'Notification Center', href: '/dashboard/student/notifications', icon: '🔔' },
        ]
      },
      {
        title: 'Student Information System',
        items: [
          { name: 'Student Profile', href: '/dashboard/student/profile', icon: '👤' },
          { name: 'Account Settings', href: '/dashboard/student/settings', icon: '⚙️' },
        ]
      },
      {
        title: 'Learning Management System',
        items: [
          { name: 'Enrollment Console', href: '/dashboard/student/enrollment', icon: '📝' },
          { name: 'Academic Record', href: '/dashboard/student/academics', icon: '📄' },
          { name: 'Attendance History', href: '/dashboard/student/attendance', icon: '📅' },
        ]
      },
      {
        title: 'Finance & Accounting',
        items: [
          { name: 'Fee & Payment', href: '/dashboard/student/finance', icon: '💳' },
        ]
      }
    ],
  };

  const activeModules = modules[role] || [];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 bg-slate-950">
        <h2 className="text-xl font-bold tracking-tight text-white">Esdros Seminary</h2>
        <p className="text-xs text-[#009fe5] font-semibold mt-1 uppercase tracking-wider">
          {userName && userId ? `${userName} (${userId})` : 'Class365 SMS Modules'}
        </p>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {activeModules.map((module) => (
          <div key={module.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{module.title}</h3>
            {module.items.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <span className="text-lg opacity-80">{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <a href="/api/auth/logout" className="block text-center text-xs text-red-400 hover:text-red-300 font-medium py-2 rounded border border-red-900/50 hover:bg-red-950/30 transition">
          Sign Out
        </a>
      </div>
    </aside>
  );
}