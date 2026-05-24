import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default async function FinancePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return <div className="p-8 text-red-500 font-medium">Session expired. Please sign in again.</div>;

  let statements;
  let userName = '';
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'));
    statements = await prisma.invoice.findMany({ 
      where: { student: { userId: payload.id as string } },
      orderBy: { dueDate: 'asc' } 
    });

    const userRecord = await prisma.user.findUnique({
      where: { id: payload.id as string }
    });
    if (userRecord) {
      userName = `${userRecord.firstName} ${userRecord.lastName}`;
    }
  } catch {
    return <div className="p-8 text-red-500 font-medium">Authentication failed.</div>;
  }

  const totalOutstanding = statements?.filter(s => s.status === 'UNPAID').reduce((acc, s) => acc + s.balanceDue, 0) || 0;
  const totalPaid = statements?.filter(s => s.status === 'PAID').reduce((acc, s) => acc + s.amount, 0) || 0;

  // Primary Aplos checkout URL (can be customized via environment variables)
  const aplosGatewayUrl = process.env.NEXT_PUBLIC_APLOS_PORTAL_URL || "https://www.aplos.com/aws/giving/esderostheologicalseminary";

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header Banner */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -ml-20 -mt-20"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mb-20"></div>
          
          <div className="relative z-10 flex gap-6 items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-blue-500/30 text-white font-black">
              🏦
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tuition & Financial Services</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-md">
                Review your mirrored general ledger balances, track active payments, and securely process fees via the seminary's integration system.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex gap-4">
            <div className="flex flex-col items-center bg-rose-50/70 px-6 py-4 rounded-2xl border border-rose-100">
              <p className="text-[10px] text-rose-700 uppercase font-extrabold tracking-widest mb-1">Outstanding</p>
              <span className="text-3xl font-black text-rose-600 tracking-tight">${totalOutstanding.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-center bg-emerald-50/70 px-6 py-4 rounded-2xl border border-emerald-100">
              <p className="text-[10px] text-emerald-700 uppercase font-extrabold tracking-widest mb-1">Total Remitted</p>
              <span className="text-3xl font-black text-emerald-600 tracking-tight">${totalPaid.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Aplos Portal Launcher Card */}
        <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 font-extrabold text-[10px] uppercase tracking-wider rounded-md border border-blue-500/30">
                  Secure Integration
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Powered by Aplos Software</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Tuition & Payments Managed by Aplos</h2>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Esderos EOTC Theological Seminary partner with **Aplos Software** to handle student ledger audits, fee collection, tax-receipt compliance, and secure digital card remittances. Click the secure gateway button to remit payment directly.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a 
                href={aplosGatewayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-[#009fe5] hover:bg-[#008bd0] text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
              >
                💳 Secure Payment Gateway (Aplos) →
              </a>
            </div>
          </div>
        </div>

        {/* Statement Mirror Ledger Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Statement Ledger Mirror</h2>
            <p className="text-xs text-slate-500 mt-1">Below is a mirrored log of financial assessments synced with primary Aplos batches.</p>
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Synced with Aplos Ledger
          </div>
        </div>

        {/* Ledger List */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          {statements?.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">No historical statement ledgers mirrored for this student account.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {statements?.map(s => (
                <div key={s.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner
                      ${s.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {s.status === 'PAID' ? '✓' : '!'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg">{s.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider
                          ${s.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'}`}>
                          {s.status}
                        </span>
                        <span className="text-sm font-medium text-slate-500">
                          Due Date: {s.dueDate ? new Date(s.dueDate).toLocaleDateString() : 'Upon Receipt'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">Balance Mirror</p>
                      <p className={`text-2xl font-black font-mono ${s.status === 'PAID' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        ${s.balanceDue.toFixed(2)}
                      </p>
                    </div>
                    {s.status === 'UNPAID' && (
                      <a 
                        href={aplosGatewayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-slate-900 text-white text-xs font-extrabold rounded-xl hover:bg-slate-800 transition shadow-sm block text-center"
                      >
                        Pay on Aplos Gateway
                      </a>
                    )}
                    {s.status === 'PAID' && (
                      <span className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-extrabold rounded-xl select-none">
                        Remitted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}