// app/dashboard/admin/activity-logs/page.tsx
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import SidebarNavigation from '../../../components/SidebarNavigation';
import ActivityLogClient from './ActivityLogClient';

export const dynamic = 'force-dynamic';

export default async function ActivityLogsPage() {
  // 1. Authenticate user session & verify Super Admin clearance
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Session Expired</h2>
          <p className="text-sm text-slate-500">Please sign in to access this page.</p>
          <a href="/login" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  let dbUser = null;
  try {
    const SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
    );
    const { payload } = await jwtVerify(token, SECRET);
    dbUser = await prisma.user.findUnique({
      where: { id: payload.id as string }
    });
  } catch (err) {
    console.error('Session error:', err);
  }

  if (!dbUser || dbUser.role !== 'ADMIN' || !dbUser.isSuperAdmin) {
    return (
      <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
        <SidebarNavigation role="ADMIN" />
        <main className="p-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
            <span className="text-4xl">🔒</span>
            <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
            <p className="text-sm text-slate-500">
              This panel is strictly reserved for Super Administrator clearance levels only. Standard admins are forbidden from auditing system activity logs.
            </p>
            <a href="/dashboard/admin" className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition">
              Return to Overview Console
            </a>
          </div>
        </main>
      </div>
    );
  }

  // 2. Fetch the activity logs for the last three months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const logs = await prisma.activityLog.findMany({
    where: {
      createdAt: {
        gte: threeMonthsAgo
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Serialize dates safely to plain JSON types
  const serializedLogs = logs.map(log => ({
    ...log,
    createdAt: log.createdAt.toISOString()
  }));

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Audit & Activity Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time track of logins, deletions, status revisions, and system operations across all users for the last three months.
          </p>
        </div>
        
        {/* Pass data to the premium interactivity client component */}
        <ActivityLogClient initialLogs={serializedLogs} />
      </main>
    </div>
  );
}
