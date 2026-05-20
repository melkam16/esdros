// app/dashboard/student/attendance/page.tsx
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';

async function getAttendanceData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, SECRET);
    const student = await prisma.student.findUnique({ where: { userId: payload.id as string } });
    if (!student) return null;

    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: { courseSection: { include: { course: true, faculty: { include: { user: true } } } } },
      orderBy: { date: 'desc' },
    });

    return { student, attendances };
  } catch {
    return null;
  }
}

export default async function StudentAttendancePage() {
  const data = await getAttendanceData();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="p-8 bg-white rounded-2xl shadow-xl text-center max-w-md border border-slate-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Session Expired</h2>
          <p className="text-slate-500 mb-6">Your secure session context has expired. Please re-authenticate to continue.</p>
          <a href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30">Return to Login</a>
        </div>
      </div>
    );
  }

  const { attendances } = data;

  // Group by courseSection
  const grouped: Record<string, {
    courseCode: string;
    courseTitle: string;
    faculty: string;
    semester: string;
    total: number; present: number; absent: number; excused: number;
    records: { date: Date; status: string; notes: string | null }[];
  }> = {};

  for (const a of attendances) {
    const key = a.courseSectionId;
    if (!grouped[key]) {
      grouped[key] = {
        courseCode: a.courseSection.course.code,
        courseTitle: a.courseSection.course.title,
        faculty: `${a.courseSection.faculty.user.firstName} ${a.courseSection.faculty.user.lastName}`,
        semester: a.courseSection.semester,
        total: 0, present: 0, absent: 0, excused: 0,
        records: [],
      };
    }
    grouped[key].total++;
    if (a.status === 'PRESENT') grouped[key].present++;
    if (a.status === 'ABSENT') grouped[key].absent++;
    if (a.status === 'EXCUSED') grouped[key].excused++;
    grouped[key].records.push({ date: a.date, status: a.status, notes: a.notes });
  }

  const courses = Object.values(grouped);
  const overallRate =
    attendances.length > 0
      ? Math.round((attendances.filter((a) => a.status !== 'ABSENT').length / attendances.length) * 100)
      : 100;

  const STATUS_STYLE: Record<string, string> = {
    PRESENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ABSENT: 'bg-rose-100 text-rose-700 border-rose-200',
    EXCUSED: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const STATUS_ICON: Record<string, string> = {
    PRESENT: '✓',
    ABSENT: '✗',
    EXCUSED: 'ℹ',
  };

  return (
    <div className="pl-64 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Premium Header Container */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex gap-6 items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/30 text-white">
              📅
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Record</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-md">
                Monitor your term attendance history to ensure compliance with minimum participation requirements.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center bg-slate-50 px-8 py-5 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Cumulative Rate</p>
            <div className="flex items-end gap-1">
              <span className={`text-4xl font-black tracking-tight ${overallRate >= 80 ? 'text-emerald-600' : overallRate >= 60 ? 'text-amber-500' : 'text-rose-600'}`}>
                {overallRate}%
              </span>
            </div>
            <div className={`mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden`}>
              <div className={`h-full ${overallRate >= 80 ? 'bg-emerald-500' : overallRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${overallRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Tracked Sessions', value: attendances.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📊' },
            { label: 'Present & Excused', value: attendances.filter(a => a.status !== 'ABSENT').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✅' },
            { label: 'Total Absences', value: attendances.filter(a => a.status === 'ABSENT').length, color: 'text-rose-600', bg: 'bg-rose-50', icon: '⚠️' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform">
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Per-Course Breakdown */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">No Attendance Records Yet</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Your session tracking will automatically populate here once your professors begin logging classroom attendance for the active term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => {
              const rate = course.total > 0 ? Math.round(((course.present + course.excused) / course.total) * 100) : 100;
              return (
                <div key={course.courseCode} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
                  {/* Course Header */}
                  <div className="px-8 py-6 bg-slate-50/80 border-b border-slate-100 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{course.courseTitle}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                          <span className="font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">{course.courseCode}</span>
                          {course.faculty}
                        </p>
                      </div>
                      <div className={`text-2xl font-black ${rate >= 80 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-500' : 'text-rose-600'}`}>
                        {rate}%
                      </div>
                    </div>
                    
                    {/* Tiny Stat Bar */}
                    <div className="flex items-center gap-2 text-xs font-bold bg-white rounded-xl p-2 border border-slate-100 shadow-sm">
                      <div className="flex-1 text-center bg-emerald-50 text-emerald-700 py-1 rounded-lg">{course.present} Present</div>
                      <div className="flex-1 text-center bg-rose-50 text-rose-700 py-1 rounded-lg">{course.absent} Absent</div>
                      <div className="flex-1 text-center bg-amber-50 text-amber-700 py-1 rounded-lg">{course.excused} Excused</div>
                    </div>
                  </div>

                  {/* Session Records (Scrollable if many) */}
                  <div className="flex-1 overflow-y-auto max-h-[300px] p-4 space-y-2">
                    {course.records.map((rec, i) => (
                      <div key={i} className="px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between group hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${STATUS_STYLE[rec.status]}`}>
                            {STATUS_ICON[rec.status]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">
                              {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                            {rec.notes && <p className="text-xs font-medium text-slate-500 mt-0.5 italic">{rec.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}