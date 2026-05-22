import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default async function FinanceManagementPage() {
  // Fetch mirrored ledger data
  const invoices = await prisma.invoice.findMany({
    include: {
      student: {
        include: {
          user: true,
        },
      },
      payments: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate stats based on mirrored ledger
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidAmount = invoices
    .filter((inv) => inv.status === 'UNPAID' || inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);
  const overdueInvoices = invoices.filter((inv) => inv.status === 'OVERDUE').length;

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50 text-slate-900 font-sans">
      <SidebarNavigation role="ADMIN" />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial & Fee Operations</h1>
            <p className="text-sm text-slate-500 mt-1">Review student invoices, bookkeeping syncs, and remittance receipts.</p>
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            General Ledger Connected
          </div>
        </div>

        {/* Dynamic Aplos Accounting Suite Integration Card */}
        <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 font-extrabold text-[10px] uppercase tracking-wider rounded-md border border-blue-500/30">
                  Primary Bookkeeper
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Direct Accounting Link</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Ledger & Receivables Managed by Aplos</h2>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                All student billing accounts, bank reconciliations, donor statements, tax receipts, and general ledgers are managed directly inside the **Aplos Non-Profit Management Suite**. Outstanding invoice updates and receipts mirror back into the SIS database.
              </p>
            </div>
            <div className="flex-shrink-0 flex gap-3 w-full lg:w-auto">
              <a 
                href="https://www.aplos.com/aws/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full lg:w-auto text-center px-6 py-3.5 bg-[#009fe5] hover:bg-[#008bd0] text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
              >
                💼 Launch Aplos Accounting Console
              </a>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Total Mirrored Invoices
            </h3>
            <p className="text-3xl font-black text-slate-900">{totalInvoices}</p>
            <p className="text-xs text-slate-400 mt-1">Matched with Aplos batches</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Cumulative Receivables
            </h3>
            <p className="text-3xl font-black text-slate-900">
              ${totalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total invoiced fees</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Remitted & Reconciled
            </h3>
            <p className="text-3xl font-black text-emerald-600">
              ${paidAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Cleared in bank deposits</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Outstanding Ledger
            </h3>
            <p className="text-3xl font-black text-rose-600">
              ${unpaidAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Awaiting online clearance</p>
          </div>
        </div>

        {/* Alerts */}
        {overdueInvoices > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-rose-900">Outstanding Overdue Accounts</h3>
                <p className="text-sm text-rose-800">
                  There are {overdueInvoices} student invoice{overdueInvoices !== 1 ? 's' : ''} currently marked as overdue in the Aplos journal system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Local Synced Ledger Journals</h2>
              <p className="text-sm text-slate-500 mt-1">Mirrored historical records synced with Aplos student accounts</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Student Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Journal Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Balance Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Aplos Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tx Receipts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No matching financial invoices synchronized in ledger database.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    const statusColor = {
                      PAID: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                      UNPAID: 'bg-amber-50 text-amber-700 border border-amber-200',
                      PARTIAL: 'bg-blue-50 text-blue-700 border border-blue-200',
                      OVERDUE: 'bg-rose-50 text-rose-700 border border-rose-200',
                    };

                    const isOverdue =
                      new Date(invoice.dueDate) < new Date() &&
                      invoice.status !== 'PAID';

                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50/75 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-900">
                              {invoice.student.user.firstName} {invoice.student.user.lastName}
                            </p>
                            <p className="text-xs font-mono text-slate-500">{invoice.student.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800">{invoice.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold font-mono text-slate-800">
                            ${invoice.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`font-bold font-mono ${invoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            ${invoice.balanceDue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border ${
                              statusColor[invoice.status as keyof typeof statusColor]
                            }`}
                          >
                            {isOverdue && invoice.status !== 'PAID'
                              ? 'OVERDUE'
                              : invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          {isOverdue && (
                            <p className="text-xs text-rose-600 font-bold mt-0.5">Payment Overdue</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {invoice.payments.length} reconciled
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reconciliation Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Aplos Invoice Status Ratios</h3>
            <div className="space-y-3">
              {[
                {
                  status: 'PAID (Cleared)',
                  count: invoices.filter((i) => i.status === 'PAID').length,
                  color: 'bg-emerald-500',
                },
                {
                  status: 'PARTIAL (Installment)',
                  count: invoices.filter((i) => i.status === 'PARTIAL').length,
                  color: 'bg-blue-500',
                },
                {
                  status: 'UNPAID (Pending)',
                  count: invoices.filter((i) => i.status === 'UNPAID').length,
                  color: 'bg-amber-500',
                },
                {
                  status: 'OVERDUE (Delinquent)',
                  count: invoices.filter((i) => i.status === 'OVERDUE').length,
                  color: 'bg-rose-500',
                },
              ].map((stat) => (
                <div key={stat.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                    <span className="text-sm font-semibold text-slate-700">{stat.status}</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Total Fee Recovery Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-600">Collection Recovery Rate</span>
                  <span className="font-extrabold text-slate-900">
                    {totalAmount > 0
                      ? Math.round((paidAmount / totalAmount) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2 text-sm font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Total Invoices Generated</span>
                  <span className="text-slate-950 font-bold">$ {totalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Collected & Reconciled</span>
                  <span className="text-emerald-600 font-extrabold">$ {paidAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outstanding Balances</span>
                  <span className="text-rose-600 font-extrabold">$ {unpaidAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
