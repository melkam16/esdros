'use client';
import { useState, useEffect } from 'react';

export default function GradebookView() {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState<any>(null);

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=Gradebook')
      .then(res => res.json())
      .then(d => {
        setClasses(d.students || d.classes || []);
        if (d.students?.length > 0) setActiveClass(d.students[0]);
        else if (d.classes?.length > 0) setActiveClass(d.classes[0]);
      })
      .catch(err => console.error('Failed to load gradebook:', err));
  }, []);

  return (
    <div className="bg-white border p-6 rounded-xl shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Evaluations Ledger Matrix</h3>
        <p className="text-xs text-slate-400">Input cumulative track checkpoints cleanly.</p>
      </div>
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-400 font-bold uppercase"><th className="p-3">Student Candidate</th><th className="p-3">Quiz 1</th><th className="p-3">Final Examination</th></tr>
          </thead>
          <tbody className="divide-y font-medium text-slate-700">
            {activeClass?.students?.map((s: any) => (
              <tr key={s.id} className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-800">{s.user?.name}</td>
                <td className="p-3"><input type="number" className="w-16 p-1 border rounded text-center font-mono" defaultValue="88" /></td>
                <td className="p-3"><input type="number" className="w-16 p-1 border rounded text-center font-mono" defaultValue="91" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}