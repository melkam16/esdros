'use client';
import { useState } from 'react';

export default function DegreeAuditClient({ students }: { students: any[] }) {
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditedStudent, setAuditedStudent] = useState<any | null>(null);

  const filteredStudents = students.filter(s => {
    const matchTrack = selectedTrack === 'ALL' || s.track === selectedTrack;
    const matchSearch = `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTrack && matchSearch;
  });

  const getRequiredCredits = (track: string) => {
    return track === 'THEOLOGY' ? 120 : 60;
  };

  const getEarnedCredits = (enrollments: any[]) => {
    return enrollments.reduce((acc, curr) => {
      // Assuming grade >= 60 is a passing grade yielding credits
      if (curr.grade !== null && curr.grade >= 60) {
        return acc + (curr.courseSection.course.credits || 3);
      }
      return acc;
    }, 0);
  };

  const getFeeDue = (invoices: any[]) => {
    return invoices.reduce((acc, curr) => acc + (curr.balanceDue || 0), 0);
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise(r => setTimeout(r, 1500)); // Mock API delay
    setIsPublishing(false);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {!auditedStudent ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
            <div className="flex-1 w-full relative">
              <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Program:</span>
              <select 
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 outline-none"
              >
                <option value="ALL">All Programs</option>
                <option value="THEOLOGY">Theology Track</option>
                <option value="GEEZ_LANGUAGE">Geez Language Track</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Student Candidate</th>
                  <th className="px-6 py-4">Admission No.</th>
                  <th className="px-6 py-4">Program Track</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {student.user.firstName} {student.user.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{student.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase">
                        {student.track.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                        student.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                        student.status === 'GRADUATED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setAuditedStudent(student)}
                        className="px-6 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg shadow-md hover:bg-slate-800 transition transform group-hover:-translate-y-0.5"
                      >
                        View Audit
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 italic">No candidates match the selected criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <button 
                  onClick={() => setAuditedStudent(null)}
                  className="mb-6 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg transition backdrop-blur-sm"
                >
                  &larr; Back to Directory
                </button>
                <h2 className="text-3xl font-black">{auditedStudent.user.firstName} {auditedStudent.user.lastName}</h2>
                <p className="text-blue-300 font-mono mt-1 text-sm tracking-wider">ADM-{auditedStudent.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Academic Status</p>
                <span className={`inline-block px-4 py-1.5 rounded-lg text-sm font-black uppercase ${
                  auditedStudent.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
                  auditedStudent.status === 'GRADUATED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {auditedStudent.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Credits Audit */}
              <div className="col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Graduation Progression</h3>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-4xl font-black text-slate-900">{getEarnedCredits(auditedStudent.enrollments)}</span>
                    <span className="text-lg font-bold text-slate-400 ml-1">/ {getRequiredCredits(auditedStudent.track)}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-500">Credits Earned</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getEarnedCredits(auditedStudent.enrollments) >= getRequiredCredits(auditedStudent.track) ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, (getEarnedCredits(auditedStudent.enrollments) / getRequiredCredits(auditedStudent.track)) * 100)}%` }}
                  ></div>
                </div>
                {getEarnedCredits(auditedStudent.enrollments) >= getRequiredCredits(auditedStudent.track) ? (
                  <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">✨ Eligible for Graduation</p>
                ) : (
                  <p className="text-xs font-bold text-amber-600 mt-3">Needs {getRequiredCredits(auditedStudent.track) - getEarnedCredits(auditedStudent.enrollments)} more credits to graduate.</p>
                )}
              </div>

              {/* Financial Clearance */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Financial Audit</h3>
                  <p className="text-sm font-medium text-slate-600 mb-4">Outstanding Tuition & Fees</p>
                </div>
                <div>
                  <p className={`text-4xl font-black tracking-tight ${getFeeDue(auditedStudent.invoices) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ${getFeeDue(auditedStudent.invoices).toFixed(2)}
                  </p>
                  <p className="text-xs font-bold text-slate-500 mt-2">
                    {getFeeDue(auditedStudent.invoices) === 0 ? '✓ Cleared for Degree Issuance' : '⚠ Financial Hold Active'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <a 
                href="/dashboard/admin/transcripts" 
                className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition text-sm flex items-center gap-2"
              >
                📜 Access Transcript Portal
              </a>

              <div className="flex gap-3">
                <button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className={`px-8 py-3 font-bold rounded-xl text-sm shadow-lg transition flex items-center gap-2 ${
                    publishSuccess 
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                      : isPublishing
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                  }`}
                >
                  {publishSuccess ? '✓ Published Successfully' : isPublishing ? 'Publishing Status...' : '🎓 Publish Degree Conferral'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
