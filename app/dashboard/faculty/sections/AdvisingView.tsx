'use client';

export default function AdvisingView() {
  return (
    <div className="bg-white border p-6 rounded-xl shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Academic Advising & Mentorship Logs</h3>
        <p className="text-xs text-slate-400">Document student track alignment counseling sessions parameters.</p>
      </div>
      <div className="space-y-3">
        <textarea placeholder="Log dynamic milestone advising descriptions here..." className="w-full h-24 p-3 border rounded-lg text-xs focus:ring-1 focus:ring-indigo-500" />
        <button className="bg-indigo-600 text-white text-xs px-4 py-2 font-bold rounded shadow-sm hover:bg-indigo-700">Save Counseling Entry</button>
      </div>
    </div>
  );
}