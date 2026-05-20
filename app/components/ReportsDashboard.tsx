'use client';

import { useState, useEffect } from 'react';

export default function ReportsDashboard() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/admin/reports');

        if (res.ok) {
          const payload = await res.json();
          setReportData(payload.data);
        }
      } catch (err) {
        console.error('Error communicating with metrics service:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="text-sm p-6 text-slate-500 animate-pulse font-medium">
        Loading system analytics...
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-sm p-6 text-rose-500 font-semibold">
        Failed to load platform analytics. Ensure database connection is stable.
      </div>
    );
  }

  const { summaryCards, charts } = reportData;

  const collectionPercentage =
    summaryCards.totalRevenue > 0
      ? Math.round(
          (summaryCards.collectedFees / summaryCards.totalRevenue) * 100
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Academic & Financial Dashboard
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Real-time system analytics and institutional metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Enrolled Students
          </span>

          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {summaryCards.totalStudents}
            </span>

            <p className="text-xs text-slate-500 mt-1">
              Active enrollment
            </p>
          </div>
        </div>

        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Faculty
          </span>

          <div className="mt-3">
            <span className="text-3xl font-black text-indigo-600">
              {summaryCards.totalFaculty}
            </span>

            <p className="text-xs text-slate-500 mt-1">
              Instructors
            </p>
          </div>
        </div>

        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Applied Students
          </span>

          <div className="mt-3">
            <span className="text-3xl font-black text-blue-600">
              {summaryCards.appliedStudents}
            </span>

            <p className="text-xs text-slate-500 mt-1">
              Pending review
            </p>
          </div>
        </div>

        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Collected Fees
          </span>

          <div className="mt-3">
            <span className="text-3xl font-black text-green-600">
              $
              {summaryCards.collectedFees.toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })}
            </span>

            <p className="text-xs text-slate-500 mt-1">
              Payments received
            </p>
          </div>
        </div>

        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pending Fees
          </span>

          <div className="mt-3">
            <span className="text-3xl font-black text-amber-600">
              $
              {summaryCards.pendingFees.toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })}
            </span>

            <p className="text-xs text-slate-500 mt-1">
              Outstanding balance
            </p>
          </div>
        </div>
      </div>

      {/* Financial Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Financial Summary
            </h3>

            <div className="space-y-3">
              {charts.financials.map((item: any, idx: number) => {
                const percentage =
                  summaryCards.totalRevenue > 0
                    ? Math.round(
                        (item.amount / summaryCards.totalRevenue) * 100
                      )
                    : 0;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700">
                        {item.label}
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        $
                        {item.amount.toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="text-xs text-slate-500">
                      {percentage}% of total invoiced amount
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collection Rate */}
          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Collection Rate
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-green-700 transition-all duration-500"
                    style={{ width: `${collectionPercentage}%` }}
                  />
                </div>

                <div className="mt-2 text-sm text-slate-600">
                  <span className="font-bold text-slate-900">
                    {collectionPercentage}%
                  </span>{' '}
                  of total invoiced amount collected
                </div>
              </div>

              <div className="ml-6 text-center">
                <div className="text-3xl font-black text-green-600">
                  {collectionPercentage}%
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  Collection Rate
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white border p-6 rounded-xl shadow-sm flex flex-col justify-center items-center">
          <h3 className="text-sm font-bold text-slate-900 mb-4 w-full">
            Fee Distribution
          </h3>

          <div className="flex justify-center items-center relative mb-4">
            <svg width="140" height="140" className="transform -rotate-90">
              <circle
                cx="70"
                cy="70"
                r="50"
                stroke="#f1f5f9"
                strokeWidth="12"
                fill="transparent"
              />

              <circle
                cx="70"
                cy="70"
                r="50"
                stroke="#10b981"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="314.16"
                strokeDashoffset={
                  314.16 -
                  (314.16 * collectionPercentage) / 100
                }
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute text-center">
              <span className="text-2xl font-black text-slate-800 block">
                {collectionPercentage}%
              </span>

              <span className="text-[9px] font-bold text-slate-400 uppercase">
                Collected
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-50 rounded-lg p-3 grid grid-cols-2 text-center text-xs divide-x border-t">
            <div className="py-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Collected
              </span>

              <span className="font-extrabold text-green-600">
                $
                {summaryCards.collectedFees.toLocaleString('en-US', {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>

            <div className="py-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Pending
              </span>

              <span className="font-extrabold text-amber-600">
                $
                {summaryCards.pendingFees.toLocaleString('en-US', {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment by Department */}
      <div className="bg-white border p-6 rounded-xl shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Enrollment by Department
          </h3>

          <p className="text-[11px] text-slate-400 mt-1">
            Distribution of students, faculty, and classes across departments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left font-bold text-slate-700">
                  Department
                </th>

                <th className="px-4 py-3 text-center font-bold text-slate-700">
                  Code
                </th>

                <th className="px-4 py-3 text-center font-bold text-slate-700">
                  Enrolled Students
                </th>

                <th className="px-4 py-3 text-center font-bold text-slate-700">
                  Faculty
                </th>

                <th className="px-4 py-3 text-center font-bold text-slate-700">
                  Classes
                </th>
              </tr>
            </thead>

            <tbody>
              {charts.enrolledByDepartment.map((dept: any, idx: number) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {dept.name}
                  </td>

                  <td className="px-4 py-3 text-center text-slate-600 font-mono font-semibold">
                    {dept.code}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold text-xs">
                      {dept.studentCount}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold text-xs">
                      {dept.facultyCount}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold text-xs">
                      {dept.classCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {charts.enrolledByDepartment.length === 0 && (
          <p className="text-sm italic text-slate-400 text-center py-8">
            No departments configured yet.
          </p>
        )}
      </div>

      {/* Student Distribution */}
      <div className="bg-white border p-6 rounded-xl shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Student Distribution by Track
          </h3>

          <p className="text-[11px] text-slate-400 mt-1">
            Program track enrollment breakdown
          </p>
        </div>

        <div className="space-y-3">
          {charts.studentDistribution.map((track: any, i: number) => {
            const maxCount = Math.max(
              ...charts.studentDistribution.map((t: any) => t.count),
              1
            );

            const barPercentage = Math.min(
              Math.round((track.count / maxCount) * 100),
              100
            );

            return (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-700">
                    {track.name}
                  </span>

                  <span className="text-slate-600 font-mono">
                    {track.count} Students
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      i % 2 === 0
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                        : 'bg-gradient-to-r from-sky-400 to-sky-500'
                    }`}
                    style={{ width: `${barPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          {charts.studentDistribution.length === 0 && (
            <p className="text-xs italic text-slate-400">
              No student data available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}