import { prisma } from '@/lib/prisma';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default async function FinanceManagementPage() {
  // Fetch finance data
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

  // Calculate statistics
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
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-slate-50">
      <SidebarNavigation role="ADMIN" />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fee Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage student invoices and payment tracking.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Total Invoices
            </h3>
            <p className="text-3xl font-bold text-slate-900">{totalInvoices}</p>
            <p className="text-xs text-slate-500 mt-1">All invoices</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Total Owed
            </h3>
            <p className="text-3xl font-bold text-slate-900">
              ${totalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total invoice amount</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Paid Amount
            </h3>
            <p className="text-3xl font-bold text-green-600">
              ${paidAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Successfully collected</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Outstanding
            </h3>
            <p className="text-3xl font-bold text-red-600">
              ${unpaidAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Awaiting payment</p>
          </div>
        </div>

        {/* Alerts */}
        {overdueInvoices > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-900">Overdue Invoices</h3>
                <p className="text-sm text-red-800">
                  {overdueInvoices} invoice{overdueInvoices !== 1 ? 's' : ''} are overdue and require
                  attention.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Invoice History</h2>
            <p className="text-sm text-slate-500 mt-1">All student invoices and payment status</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Invoice Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Balance Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Payments
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    const statusColor = {
                      PAID: 'bg-green-100 text-green-800',
                      UNPAID: 'bg-yellow-100 text-yellow-800',
                      PARTIAL: 'bg-blue-100 text-blue-800',
                      OVERDUE: 'bg-red-100 text-red-800',
                    };

                    const isOverdue =
                      new Date(invoice.dueDate) < new Date() &&
                      invoice.status !== 'PAID';

                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {invoice.student.user.firstName} {invoice.student.user.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{invoice.student.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-900">{invoice.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            ${invoice.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`font-medium ${invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${invoice.balanceDue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColor[invoice.status as keyof typeof statusColor]
                            }`}
                          >
                            {isOverdue && invoice.status !== 'PAID'
                              ? 'OVERDUE'
                              : invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-900">
                            {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          {isOverdue && (
                            <p className="text-xs text-red-600 font-medium">Overdue</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {invoice.payments.length}
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

        {/* Payment Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Status Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Invoice Status Breakdown</h3>
            <div className="space-y-3">
              {[
                {
                  status: 'PAID',
                  count: invoices.filter((i) => i.status === 'PAID').length,
                  color: 'bg-green-500',
                },
                {
                  status: 'PARTIAL',
                  count: invoices.filter((i) => i.status === 'PARTIAL').length,
                  color: 'bg-blue-500',
                },
                {
                  status: 'UNPAID',
                  count: invoices.filter((i) => i.status === 'UNPAID').length,
                  color: 'bg-yellow-500',
                },
                {
                  status: 'OVERDUE',
                  count: invoices.filter((i) => i.status === 'OVERDUE').length,
                  color: 'bg-red-500',
                },
              ].map((stat) => (
                <div key={stat.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                    <span className="text-sm text-slate-700">{stat.status}</span>
                  </div>
                  <span className="font-bold text-slate-900">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Rate */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Collection Rate</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-700">Collection Progress</span>
                  <span className="font-bold text-slate-900">
                    {totalAmount > 0
                      ? Math.round((paidAmount / totalAmount) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Invoices</span>
                  <span className="font-medium text-slate-900">$ {totalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Collected</span>
                  <span className="font-medium text-green-600">$ {paidAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Outstanding</span>
                  <span className="font-medium text-red-600">$ {unpaidAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
