import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';
import AlumniClient from './AlumniClient';

export default async function AlumniPage() {
  const alumni = await prisma.student.findMany({
    where: { 
      status: 'GRADUATED' 
    },
    include: {
      user: true,
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

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Alumni & Legacy Records</h1>
          <p className="text-sm text-slate-500 mt-1">Manage graduated students, verify legacy transcripts, and digitize manual records.</p>
        </div>
        
        <AlumniClient initialAlumni={alumni} />
      </main>
    </div>
  );
}
