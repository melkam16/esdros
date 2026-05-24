// components/StudentSidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard Home', href: '/dashboard/student' },
    { name: 'Student Profile', href: '/dashboard/student/profile' },
    { name: 'Enrollment Console', href: '/dashboard/student/enrollment' },
    { name: 'Attendance History', href: '/dashboard/student/attendance' },
    { name: 'Academic Record', href: '/dashboard/student/academics' },
    { name: 'Fee & Payment', href: '/dashboard/student/finance' },
    { name: 'Notification Center', href: '/dashboard/student/notifications' },
    { name: 'Account Settings', href: '/dashboard/student/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 bg-slate-950">
        <h2 className="text-xl font-bold tracking-tight text-white">Esderos Student</h2>
        <p className="text-xs text-slate-400 mt-1">Self-Service Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <a href="/api/auth/logout" className="block text-center text-xs text-red-400 hover:text-red-300 font-medium py-2 rounded border border-red-900/50 hover:bg-red-950/30 transition">
          Exit Portal
        </a>
      </div>
    </aside>
  );
}