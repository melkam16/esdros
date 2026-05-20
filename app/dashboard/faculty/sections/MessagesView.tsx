'use client';
import { useState, useEffect } from 'react';

export default function MessagesView() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=Messages')
      .then(res => res.json())
      .then(d => setThreads(d.threads || []))
      .catch(err => console.error('Failed to load messages:', err));
  }, []);

  return (
    <div className="bg-white border p-6 rounded-xl shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Internal Secure Channels</h3>
      <div className="space-y-2">
        {threads.map((t: any) => (
          <div key={t.id} className="p-3 border rounded-xl hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-start bg-slate-50/20">
            <div className="space-y-1">
              <p className="font-bold text-slate-800">{t.sender}</p>
              <p className="text-slate-500 font-medium line-clamp-1">{t.snippet}</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono font-bold">{t.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}