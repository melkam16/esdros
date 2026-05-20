import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default async function StudentProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return <div className="p-8 text-red-500 font-medium">Session expired. Please sign in again.</div>;

  let profile;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    profile = await prisma.student.findUnique({ 
      where: { userId: payload.id as string }, 
      include: { user: true, class: true } 
    });
  } catch {
    return <div className="p-8 text-red-500 font-medium">Authentication failed.</div>;
  }

  if (!profile) return <div className="p-8 text-red-500 font-medium">Profile not found.</div>;

  return (
    <div className="pl-64 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center text-5xl shadow-lg shadow-fuchsia-500/30 text-white flex-shrink-0 border-4 border-white">
            {profile.user.firstName.charAt(0)}{profile.user.lastName.charAt(0)}
          </div>
          
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Valid & Active Profile
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {profile.user.firstName} {profile.user.lastName}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Registered Student • Class of {new Date().getFullYear() + 2}
            </p>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-xl">📧</div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Registrar Email Address</p>
            <p className="text-lg font-extrabold text-slate-800">{profile.user.email}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 text-xl">🎓</div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Track Designation</p>
            <p className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              {profile.track === 'THEOLOGY' ? 'Theology' : 'Geez Language'}
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Standard</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 md:col-span-2 hover:-translate-y-1 transition-transform">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 text-xl">🏫</div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Class Framework</p>
                <p className="text-lg font-extrabold text-slate-800">{profile.class.name}</p>
              </div>
              <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Class Code Reference</p>
                <p className="text-xl font-mono font-black text-slate-700">{profile.class.code}</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}