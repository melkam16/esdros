import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default async function FinancePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return <div className="p-8 text-red-500 font-medium">Session expired. Please sign in again.</div>;

  let statements;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'));
    statements = await prisma.invoice.findMany({ 
      where: { student: { userId: payload.id as string } },
      orderBy: { dueDate: 'asc' } 
    });
  } catch {
    return <div className="p-8 text-red-500 font-medium">Authentication failed.</div>;
  }

  const totalOutstanding = statements?.filter(s => s.status === 'UNPAID').reduce((acc, s) => acc + s.balanceDue, 0) || 0;
  const totalPaid = statements?.filter(s => s.status === 'PAID').reduce((acc, s) => acc + s.amount, 0) || 0;

  return (
    <div className="pl-64 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200">
      <SidebarNavigation role="STUDENT" />
      <main className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header Container */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -ml-20 -mt-20"></div>
          
          <div className="relative z-10 flex gap-6 items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-rose-500/30 text-white">
              💳
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tuition & Finance</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-md">
                Securely manage your fee remittance ledger, review outstanding statements, and track payment history.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex gap-4">
            <div className="flex flex-col items-center bg-rose-50 px-6 py-4 rounded-2xl border border-rose-100">
              <p className="text-xs text-rose-600 uppercase font-bold tracking-widest mb-1">Total Outstanding</p>
              <span className="text-3xl font-black text-rose-600 tracking-tight">${totalOutstanding.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-center bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100">
              <p className="text-xs text-emerald-600 uppercase font-bold tracking-widest mb-1">Total Paid</p>
              <span className="text-3xl font-black text-emerald-600 tracking-tight">${totalPaid.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Statement Ledger</h2>
          <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/50 transition-all hover:-translate-y-0.5 flex items-center gap-2">
            Make Online Payment
          </button>
        </div>

        {/* Ledger List */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          {statements?.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">No financial statements generated for this account.</div>
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
                          Due: {s.dueDate ? new Date(s.dueDate).toLocaleDateString() : 'Upon Receipt'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">Amount Due</p>
                      <p className={`text-2xl font-black font-mono ${s.status === 'PAID' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        ${s.balanceDue.toFixed(2)}
                      </p>
                    </div>
                    {s.status === 'UNPAID' && (
                      <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md">
                        Pay Now
                      </button>
                    )}
                    {s.status === 'PAID' && (
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                        Receipt
                      </button>
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