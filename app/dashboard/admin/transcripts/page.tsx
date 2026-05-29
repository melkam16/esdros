import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';
import TranscriptClient from './TranscriptClient';

export default async function TranscriptsPage() {
  const students = await prisma.student.findMany({
    include: {
      user: true,
      class: {
        include: { department: true }
      },
      enrollments: {
        where: { enrollmentStatus: 'APPROVED' },
        include: {
          courseSection: {
            include: { course: true }
          }
        }
      }
    }
  });

  const withdrawalRequests = await prisma.withdrawalRequest.findMany({
    include: {
      student: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const classes = await prisma.class.findMany({
    include: { department: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Official Transcripts & Student Records</h1>
          <p className="text-sm text-slate-500 mt-1">Generate, audit, and distribute official student academic records, and process withdrawal requests.</p>
        </div>
        <TranscriptClient students={students} classes={classes} withdrawalRequests={withdrawalRequests} />
      </main>
    </div>
  );
}
