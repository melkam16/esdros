// app/dashboard/student/enrollment/page.tsx
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';
import EnrollmentConsoleClient from './EnrollmentConsoleClient';

async function getData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);

    const student = await prisma.student.findUnique({
      where: { userId: payload.id as string },
      include: {
        class: true,
        enrollments: {
          include: { courseSection: { include: { course: true, faculty: { include: { user: true } } } } },
        },
      },
    });

    if (!student) return null;

    const sections = await prisma.courseSection.findMany({
      where: { course: { track: student.track } },
      include: {
        course: true,
        faculty: { include: { user: true } },
        _count: { select: { enrollments: { where: { enrollmentStatus: 'APPROVED' } } } },
      },
      orderBy: { semester: 'asc' },
    });

    return { student, sections };
  } catch {
    return null;
  }
}

export default async function EnrollmentConsolePage() {
  const data = await getData();

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

  const { student, sections } = data;
  const enrolledSectionIds = new Set(
    student.enrollments
      .filter((e) => e.enrollmentStatus !== 'DROPPED')
      .map((e) => e.courseSectionId)
  );

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex gap-6 items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30 text-white">
              📝
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enrollment Console</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-md">
                Browse available course offerings and manage your active term registration requests.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                <span>{student.class.name}</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                <span className="text-blue-600">{student.track === 'THEOLOGY' ? 'Theology Track' : 'Geez Language Track'}</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center bg-blue-50 px-8 py-5 rounded-2xl border border-blue-100 shadow-sm">
            <p className="text-xs text-blue-600 uppercase font-bold tracking-widest mb-1">Active Enrollments</p>
            <span className="text-4xl font-black tracking-tight text-blue-600">
              {student.enrollments.filter((e) => e.enrollmentStatus === 'APPROVED').length}
            </span>
          </div>
        </div>

        {/* My Enrollments Summary */}
        {student.enrollments.filter(e => e.enrollmentStatus !== 'DROPPED').length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="px-8 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> My Current Enrollments
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {student.enrollments
                .filter(e => e.enrollmentStatus !== 'DROPPED')
                .map((e) => (
                  <div key={e.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-500 shadow-sm group-hover:scale-110 transition-transform">
                        {e.courseSection.course.code.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-slate-900">{e.courseSection.course.title}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                          <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{e.courseSection.course.code}</span>
                          {e.courseSection.semester} · {e.courseSection.faculty.user.firstName} {e.courseSection.faculty.user.lastName}
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border shadow-sm flex items-center gap-1.5 ${
                      e.enrollmentStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      e.enrollmentStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {e.enrollmentStatus === 'APPROVED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                      {e.enrollmentStatus === 'PENDING' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                      {e.enrollmentStatus === 'REJECTED' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                      
                      {e.enrollmentStatus === 'APPROVED' ? 'Enrolled' : e.enrollmentStatus === 'PENDING' ? 'Pending Approval' : 'Rejected'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Available Sections Header */}
        <div className="pt-4">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Available Course Offerings</h2>
        </div>

        {/* Available Sections Client Interface */}
        <EnrollmentConsoleClient
          sections={sections.map((s) => ({
            id: s.id,
            courseCode: s.course.code,
            courseTitle: s.course.title,
            credits: s.course.credits,
            faculty: `${s.faculty.user.firstName} ${s.faculty.user.lastName}`,
            semester: s.semester,
            room: s.room,
            capacity: s.capacity,
            enrolled: s._count.enrollments,
            alreadyEnrolled: enrolledSectionIds.has(s.id),
            enrollmentStatus: student.enrollments.find(e => e.courseSectionId === s.id)?.enrollmentStatus ?? null,
          }))}
        />
      </main>
    </div>
  );
}