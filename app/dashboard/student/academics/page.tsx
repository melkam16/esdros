import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default async function AcademicsPage(props: { searchParams: Promise<{ success?: string }> }) {
  const resolvedParams = await props.searchParams;
  const showSuccessAlert = resolvedParams.success === 'true';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return <div className="p-8 text-red-500 font-medium">Session expired. Please sign in again.</div>;

  let record;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'));
    record = await prisma.student.findUnique({ 
      where: { userId: payload.id as string }, 
      include: { enrollments: { include: { courseSection: { include: { course: true } } } } } 
    });
  } catch {
    return <div className="p-8 text-red-500 font-medium">Authentication failed.</div>;
  }

  const creditsEarned = record?.enrollments.reduce((acc, e) => {
    if (!e.courseSection || !e.courseSection.course) return acc;
    return acc + (e.grade !== null && e.grade >= 60 ? e.courseSection.course.credits : 0);
  }, 0) || 0;

  const activeCredits = record?.enrollments.reduce((acc, e) => {
    if (!e.courseSection || !e.courseSection.course) return acc;
    return acc + (e.grade === null ? e.courseSection.course.credits : 0);
  }, 0) || 0;

  async function handleRequestOfficial() {
    'use server';
    let requestSuccess = false;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (token) {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'));
        const student = await prisma.student.findUnique({
          where: { userId: payload.id as string },
          include: { user: true }
        });

        if (student) {
          await prisma.alumniRequest.create({
            data: {
              type: 'TRANSCRIPT',
              name: `${student.user.firstName} ${student.user.lastName}`,
              email: student.user.email,
              phone: student.phone || '',
              details: `Official transcript requested directly by active student ${student.user.firstName} ${student.user.lastName} (Student ID: ${student.id.substring(0, 8).toUpperCase()}) from their student academics portal console.`
            }
          });
          requestSuccess = true;
        }
      }
    } catch (err) {
      console.error("Failed to create official transcript request:", err);
    }
    
    if (requestSuccess) {
      const { redirect } = await import('next/navigation');
      redirect('/dashboard/student/academics?success=true');
    }
  }

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {showSuccessAlert && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300 animate-bounce">
            <span>✅</span>
            <p>Your Request for an Official Transcript has been successfully logged! The Registrar's Office will process your academic audit and notify you.</p>
          </div>
        )}

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl shadow-slate-900/20 border border-slate-700/50 p-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="text-4xl">📄</span> Academic Audit & Transcript
            </h1>
            <p className="text-slate-300 font-medium max-w-xl">
              Official live view of your academic progress, course enrollments, and permanent grading record.
            </p>
          </div>
          <div className="relative z-10 flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Earned</p>
              <p className="text-3xl font-black text-emerald-400">{creditsEarned}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[120px]">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Active</p>
              <p className="text-3xl font-black text-blue-400">{activeCredits}</p>
            </div>
          </div>
        </div>

        {/* Course Records Table */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800">Historical & Current Term Enrollments</h2>
            <div className="flex gap-2 items-center">
              <a 
                href="/api/student/transcript/unofficial" 
                target="_blank"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                📥 Download Unofficial Transcript
              </a>
              <form action={handleRequestOfficial}>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  🔒 Request Official Transcript
                </button>
              </form>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {record?.enrollments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">No academic records found on file.</div>
            ) : (
              record?.enrollments.map(e => (
                <div key={e.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold group-hover:scale-110 transition-transform">
                      {e.courseSection?.course?.code?.split(/[-0-9]/)[0] || 'CR'}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{e.courseSection?.course?.title || 'Unknown Subject'}</h4>
                      <p className="text-sm font-medium text-slate-500 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mr-2">{e.courseSection?.course?.code || 'Legacy'}</span>
                        {e.courseSection?.course?.credits || 3} Credits • {e.courseSection?.semester || 'Term'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {e.grade !== null ? (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Final Grade</p>
                          <p className={`text-xl font-black ${e.grade >= 90 ? 'text-emerald-600' : e.grade >= 80 ? 'text-blue-600' : e.grade >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {e.grade}%
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm
                          ${e.grade >= 90 ? 'bg-emerald-500' : e.grade >= 80 ? 'bg-blue-500' : e.grade >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}>
                          {e.grade >= 90 ? 'A' : e.grade >= 80 ? 'B' : e.grade >= 70 ? 'C' : 'F'}
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        In Progress
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}