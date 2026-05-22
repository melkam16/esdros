import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../components/SidebarNavigation';

async function getAggregatedStudentDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    return await prisma.student.findUnique({
      where: { userId: payload.id as string },
      include: {
        user: true,
        class: true,
        enrollments: { include: { courseSection: { include: { course: true } } } },
        invoices: { where: { status: 'UNPAID' } }
      }
    });
  } catch {
    return null;
  }
}

export default async function StudentDashboardHome() {
  const data = await getAggregatedStudentDashboard();

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="p-8 bg-white rounded-2xl shadow-xl text-center max-w-md border border-slate-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Session Expired</h2>
        <p className="text-slate-500 mb-6">Your secure session context has expired. Please re-authenticate to continue.</p>
        <a href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30">Return to Login</a>
      </div>
    </div>
  );

  const activeEnrollmentsCount = data.enrollments.length;
  const pendingFeesTotal = data.invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const mockAttendanceRate = 96.4; 

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Welcome Hero / Glassmorphism Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl shadow-blue-900/20 border border-blue-700/50">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative z-10 p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold tracking-wider text-blue-100 uppercase">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Active Student Status
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Welcome back, {data.user.firstName}! 👋
              </h1>
              <p className="text-lg text-blue-100/90 font-medium max-w-xl">
                Here is what is happening with your <span className="text-white font-bold">{data.class.name}</span> cohort this semester. Keep up the excellent work!
              </p>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-center w-32 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-inner">
              <span className="text-5xl">🎓</span>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-inner">📊</div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Attendance Rate</h3>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{mockAttendanceRate}%</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50/50 py-1.5 px-3 rounded-lg w-fit">
                ✓ Satisfies Requirement
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-inner">💳</div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pending Balance</h3>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-4xl font-extrabold text-slate-900 tracking-tight">${pendingFeesTotal.toFixed(2)}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-rose-600 bg-rose-50/50 py-1.5 px-3 rounded-lg w-fit">
                {data.invoices.length} Outstanding Invoices
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-inner">📚</div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Courses</h3>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{activeEnrollmentsCount}</p>
                <span className="text-lg font-medium text-slate-500 mb-1">Enrolled</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50/50 py-1.5 px-3 rounded-lg w-fit">
                Current Term Assignments
              </div>
            </div>
          </div>
        </div>

        {/* Current Schedule & Notices Flexbox */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Course List section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Enrolled Courses</h2>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">View Full Record →</button>
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden divide-y divide-slate-100">
              {data.enrollments.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium">You are not currently enrolled in any courses for this term.</div>
              ) : (
                data.enrollments.map((enrollment, i) => (
                  <div key={enrollment.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/50 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:scale-110 transition-transform">
                        {enrollment.courseSection.course.code.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{enrollment.courseSection.course.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">{enrollment.courseSection.course.code}</span>
                          <span>• {enrollment.courseSection.course.credits} Credits</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notices Sidebar area */}
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Notices</h2>
            
            <div className="bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-6 shadow-lg shadow-amber-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -mt-10 -mr-10 blur-xl"></div>
              
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-lg mb-4 shadow-sm border border-amber-200">
                ⚠️
              </div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">Registration Verification Window</h3>
              <p className="text-sm text-amber-800/90 leading-relaxed font-medium">
                Please ensure all administrative track selection updates are committed through the Enrollment Console before the final term locked filters apply on Friday.
              </p>
              
              <button className="mt-5 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:shadow-lg">
                Review Registration
              </button>
            </div>

            {/* Moodle LMS Integration Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white p-6 shadow-xl border border-indigo-900/50 hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl mix-blend-screen transition-transform duration-500 group-hover:scale-125"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-lg shadow-inner border border-white/20">
                    🌐
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider">
                    E-Learning
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">Moodle LMS Portal</h3>
                  <p className="text-xs text-indigo-200/80 leading-relaxed mt-1 font-medium">
                    Access your course modules, lecture notes, discussion boards, and digital syllabi directly on our traditional learning management system.
                  </p>
                </div>

                <a 
                  href="https://esderos.eotcmk.org/seminary" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Launch Moodle Classroom ↗
                </a>
              </div>
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}