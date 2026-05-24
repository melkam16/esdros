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
                      
                      {/* Nested Sub-branches for Class parameters with elegant accordions */}
                      <div className="mt-2 pl-4 border-l-2 border-slate-200 space-y-2">
                        {dept.classes.map((cls) => (
                          <details key={cls.id} className="group border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm text-xs">
                            <summary className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer font-bold text-slate-700 list-none select-none">
                              <span className="flex items-center gap-1.5">
                                <span>🏫</span>
                                <span>Class: {cls.name} ({cls.code})</span>
                              </span>
                              <span className="text-slate-400 group-open:rotate-90 transition-transform duration-200">▶</span>
                            </summary>
                            <div className="p-3 pl-6 border-t border-slate-100 bg-white space-y-1.5 text-slate-500">
                              {classes.find(c => c.id === cls.id)?.subjects.map((sub) => (
                                <p key={sub.id} className="flex items-center gap-1.5 hover:text-blue-600 transition">
                                  <span>📚</span>
                                  <span>Subject: {sub.title} ({sub.code})</span>
                                </p>
                              ))}
                              {(!classes.find(c => c.id === cls.id)?.subjects || classes.find(c => c.id === cls.id)?.subjects.length === 0) && (
                                <p className="text-slate-400 italic">No subjects assigned yet.</p>
                              )}
                            </div>
                          </details>
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