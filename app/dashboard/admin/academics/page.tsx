import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';
import SetupFormInterface from './SetupFormInterface';

export default async function AcademicStructureConsole() {
  // Fetch existing topology parameters for mapping references
  const departments = await prisma.department.findMany({ include: { classes: true } });
  const classes = await prisma.class.findMany({ include: { subjects: true } }); // schema model field is named subjects
  const courses = await prisma.course.findMany({ include: { sections: true } }); // changed model target to prisma.course

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Structure Setup</h1>
            <p className="text-sm text-slate-500 mt-1">Configure institutional frameworks, departments, and classes.</p>
          </div>
        </div>

        {/* Tabs/Sections View */}
        <div className="space-y-12">
          {/* Section 1: Academic Structure Setup */}
          <div id="structure" className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm scroll-mt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
              Academic Structure Setup
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left / Center: Interactive Setup Workflows */}
              <div className="lg:col-span-2 space-y-6">
                <SetupFormInterface departments={departments} classes={classes} />
              </div>

              {/* Right Column: Live Institutional Hierarchy Tracker */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 h-fit">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Structural Blueprint Tree</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {departments.map((dept) => (
                    <div key={dept.id} className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-800">{dept.name}</span>
                        <span className="text-xs bg-slate-200 font-mono text-slate-600 px-1.5 py-0.5 rounded">{dept.code}</span>
                      </div>
                      
                      {/* Nested Sub-branches for Class parameters */}
                      <div className="mt-2 pl-4 border-l-2 border-slate-300 space-y-2">
                        {dept.classes.map((cls) => (
                          <div key={cls.id} className="text-xs text-slate-600">
                            <p className="font-semibold text-slate-700">• Class: {cls.name} ({cls.code})</p>
                            {/* Nested Sub-branches for Subjects */}
                            <div className="pl-3 mt-0.5 text-slate-500 space-y-0.5">
                              {classes.find(c => c.id === cls.id)?.subjects.map((sub) => (
                                <p key={sub.id}>↳ Subject: {sub.title} ({sub.code})</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {departments.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No departments configured yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}