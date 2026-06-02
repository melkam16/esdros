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

    const currentSemesterSetting = await prisma.systemSetting.findUnique({
      where: { key: 'CURRENT_SEMESTER' }
    });
    const currentSemester = currentSemesterSetting?.value || 'Fall 2026';

    const sections = await prisma.courseSection.findMany({
      where: { 
        course: { track: student.track },
        semester: currentSemester
      },
      include: {
        course: {
          include: {
            class: true
          }
        },
        faculty: { include: { user: true } },
        _count: { select: { enrollments: { where: { enrollmentStatus: 'APPROVED' } } } },
      },
      orderBy: { semester: 'asc' },
    });

    return { student, sections, currentSemester };
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

  const { student, sections, currentSemester } = data;
  const isWithdrawn = student.status === 'WITHDRAWN';

  // Enrolled section IDs that are not dropped
  const enrolledSectionIds = new Set(
    student.enrollments
      .filter((e) => e.enrollmentStatus !== 'DROPPED')
      .map((e) => e.courseSectionId)
  );

  // Grouping Student Enrollments:
  // 1. Active Enrollments (Current or In-Progress Term where grade is null)
  const activeEnrollments = student.enrollments.filter(
    (e) => e.enrollmentStatus !== 'DROPPED' && e.grade === null
  );

  // 2. Completed Enrollments (Any term where grade is not null and grade >= 60)
  const completedEnrollments = student.enrollments.filter(
    (e) => e.enrollmentStatus !== 'DROPPED' && e.grade !== null && e.grade >= 60
  );

  // 3. Available sections (only from current semester that the student has not enrolled in yet)
  const availableSectionsForEnrollment = sections.filter(
    (s) => !enrolledSectionIds.has(s.id)
  );

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {isWithdrawn && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm text-amber-950 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-350">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Enrollment Console Locked (Read-Only Mode)</h3>
              <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                Your account is currently in <b>Read-Only Mode</b> because your student withdrawal has been formally approved. Course additions and section changes are locked.
              </p>
            </div>
          </div>
        )}

        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex gap-6 items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-blue-500/30 text-white">
              📝
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enrollment Console</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-md">
                Browse available course offerings for the current term and manage your academic registration.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                <span>{student.class?.name || 'Seminary Candidate'}</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                <span className="text-blue-600">{student.track === 'THEOLOGY' ? 'Theology Track' : 'Geez Language Track'}</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center bg-blue-50 px-8 py-5 rounded-2xl border border-blue-100 shadow-sm">
            <p className="text-xs text-blue-600 uppercase font-bold tracking-widest mb-1">Active Enrollments</p>
            <span className="text-4xl font-black tracking-tight text-blue-600">
              {student.enrollments.filter((e) => e.enrollmentStatus === 'APPROVED' && e.grade === null).length}
            </span>
          </div>
        </div>

        {/* 1. TOP SECTION: Available Course Offerings for Enrollment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
              Available Courses for Enrollment ({currentSemester})
            </h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Current Term Offerings Only
            </span>
          </div>

          <EnrollmentConsoleClient
            isWithdrawn={isWithdrawn}
            studentClassId={student.classId || ''}
            sections={availableSectionsForEnrollment.map((s: any) => ({
              id: s.id,
              courseCode: s.course?.code || 'CRS',
              courseTitle: s.course?.title || 'Course Offering',
              credits: s.course?.credits || 3,
              faculty: s.faculty ? `${s.faculty.user.firstName} ${s.faculty.user.lastName}` : 'Seminary Faculty',
              semester: s.semester,
              room: s.room,
              capacity: s.capacity,
              enrolled: s._count.enrollments,
              alreadyEnrolled: false,
              enrollmentStatus: null,
              classId: s.course?.classId || '',
              className: s.course?.class?.name || 'General Course',
            }))}
          />
        </div>

        {/* 2. MIDDLE SECTION: Current Enrolled / Active Term Courses */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="px-8 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> My Current Enrollments & Requests
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-150 px-2 py-0.5 rounded-lg border border-slate-200">
              Term: {currentSemester}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {activeEnrollments.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-medium italic">You have no active or pending enrollments for this term.</div>
            ) : (
              activeEnrollments.map((e) => (
                <div key={e.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-500 shadow-sm group-hover:scale-110 transition-transform">
                      {e.courseSection?.course?.code?.substring(0, 2) || 'CR'}
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-slate-900">{e.courseSection?.course?.title || 'Unknown'}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                        <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{e.courseSection?.course?.code || 'Legacy'}</span>
                        {e.courseSection?.semester || 'Term'} · {e.courseSection?.faculty ? `${e.courseSection.faculty.user.firstName} ${e.courseSection.faculty.user.lastName}` : 'Faculty'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. BOTTOM SECTION: Completed Courses */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="px-8 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Completed Courses (Academic History)
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Completed Records
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {completedEnrollments.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-medium italic">No completed course records found on file.</div>
            ) : (
              completedEnrollments.map((e) => (
                <div key={e.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-500 shadow-sm group-hover:scale-110 transition-transform">
                      {e.courseSection?.course?.code?.substring(0, 2) || 'CR'}
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-slate-900">{e.courseSection?.course?.title || 'Unknown'}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                        <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{e.courseSection?.course?.code || 'Legacy'}</span>
                        {e.courseSection?.semester || 'Term'} · {e.courseSection?.faculty ? `${e.courseSection.faculty.user.firstName} ${e.courseSection.faculty.user.lastName}` : 'Faculty'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1">
                      🎓 Grade: {e.grade}%
                    </span>
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