// app/dashboard/admin/courses/import-grades/page.tsx
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '@/app/components/SidebarNavigation';
import GradeImporterClient from './GradeImporterClient';

export const dynamic = 'force-dynamic';

export default async function GradeImporterPage() {
  const sections = await prisma.courseSection.findMany({
    include: {
      course: true,
      faculty: {
        include: {
          user: true,
        },
      },
      enrollments: {
        where: {
          enrollmentStatus: 'APPROVED',
          student: {
            status: 'ACTIVE',
          },
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: {
      semester: 'desc',
    },
  });

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        <GradeImporterClient initialSections={JSON.parse(JSON.stringify(sections))} />
      </main>
    </div>
  );
}
