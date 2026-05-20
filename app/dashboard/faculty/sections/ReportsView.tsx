'use client';
import { useState, useEffect } from 'react';

export default function ReportsView() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/faculty/portal?section=Reports').then(res => res.json()).then(d => setMetrics(d.metrics));
  }, []);

  if (!metrics) return <div className="text-xs animate-pulse text-slate-400 font-mono">Parsing analytical spreads...</div>;

  return (
    <div className="bg-white border p-6 rounded-xl shadow-sm space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Performance Telemetry Trends</h3>
        <p className="text-xs text-slate-400">Aggregated passing metric profiles across assigned tracks.</p>
      </div>
      <div className="space-y-4">
        {metrics.classAverages?.map((c: any, i: number) => (
          <div key={i} className="space-y-1 text-xs font-semibold">
            <div className="flex justify-between"><span className="text-slate-700">{c.name}</span><span className="font-mono text-indigo-600">{c.average}% Avg</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-indigo-600 h-full rounded-full" style={{ width: `${c.average}%` }}></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}