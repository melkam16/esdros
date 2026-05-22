'use client';
import { useState } from 'react';

export default function AlumniClient({ initialAlumni }: { initialAlumni: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [selectedAlumnus, setSelectedAlumnus] = useState<any | null>(null);
  
  // New state to allow dynamic updates after migration
  const [alumniList, setAlumniList] = useState<any[]>(initialAlumni);
  
  // Form State
  const [mForm, setMForm] = useState({ firstName: '', lastName: '', graduationYear: '', track: 'THEOLOGY' });
  const [mFile, setMFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAlumni = alumniList.filter(a => 
    `${a.user.firstName} ${a.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const getLetter = (score: number | null) => {
    if (score === null || isNaN(score)) return 'N/A';
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGPA = (enrollments: any[]) => {
    let totalPoints = 0;
    let totalCredits = 0;
    enrollments.forEach(e => {
      const credits = e.courseSection.course.credits || 3;
      const score = e.grade;
      if (score !== null) {
        let gp = 0.0;
        if (score >= 93) gp = 4.0;
        else if (score >= 90) gp = 3.7;
        else if (score >= 87) gp = 3.3;
        else if (score >= 83) gp = 3.0;
        else if (score >= 80) gp = 2.7;
        else if (score >= 77) gp = 2.3;
        else if (score >= 73) gp = 2.0;
        else if (score >= 70) gp = 1.7;
        else if (score >= 60) gp = 1.0;
        
        totalPoints += (gp * credits);
        totalCredits += credits;
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-transcript, #printable-transcript * {
            visibility: visible;
          }
          #printable-transcript {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Stats & Actions Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Verified Alumni</h3>
            <p className="text-3xl font-bold text-slate-900">{alumniList.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl">🎓</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Digitized Transcripts</h3>
            <p className="text-3xl font-bold text-slate-900">{alumniList.filter(a => a.enrollments.length > 0).length}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl">📄</div>
        </div>

        <button 
          onClick={() => setIsMigrating(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white p-6 rounded-2xl border border-slate-800 shadow-lg transition flex flex-col justify-center items-center text-center group"
        >
          <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📂</span>
          <span className="font-bold text-sm">Digitize Legacy Record</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search alumni by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Alumni Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Program Track</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Data Integrity</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlumni.map(alumnus => (
                <tr key={alumnus.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {alumnus.user.firstName} {alumnus.user.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{alumnus.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{alumnus.track.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold uppercase">
                      {alumnus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {alumnus.enrollments.length > 0 ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">✓ Digitized</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">⚠ Requires Import</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedAlumnus(alumnus)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
                    >
                      View Dossier
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAlumni.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">No alumni records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Migration Wizard Modal */}
      {isMigrating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Legacy Record Digitization Wizard</h3>
                <p className="text-sm text-slate-500">Migrate a graduated student from the manual paper system into the digital database.</p>
              </div>
              <button onClick={() => setIsMigrating(false)} className="text-slate-400 hover:text-rose-500 text-2xl font-bold">&times;</button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={mForm.firstName}
                    onChange={e => setMForm({...mForm, firstName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g. John" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={mForm.lastName}
                    onChange={e => setMForm({...mForm, lastName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g. Doe" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Graduation Year</label>
                  <input 
                    type="text" 
                    value={mForm.graduationYear}
                    onChange={e => setMForm({...mForm, graduationYear: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g. 2019" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Program Track</label>
                  <select 
                    value={mForm.track}
                    onChange={e => setMForm({...mForm, track: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="THEOLOGY">THEOLOGY</option>
                    <option value="GEEZ_LANGUAGE">GEEZ_LANGUAGE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Manual Transcript Upload (PDF Scan)</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => setMFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.png"
                  />
                  <div className="text-4xl mb-2">📄</div>
                  {mFile ? (
                    <p className="text-sm font-bold text-emerald-600">Selected: {mFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-700">Click to upload or drag paper transcript scan here</p>
                      <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 items-start">
                <div className="text-blue-500 text-xl">ℹ️</div>
                <p className="text-sm text-blue-800">
                  <strong>Notice:</strong> Submitting this form will securely create an Alumni profile. The uploaded paper transcript will be attached to their digital dossier, allowing them to instantly access their records via the Student Portal.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsMigrating(false)}
                disabled={isSubmitting}
                className="px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-white transition"
              >
                Cancel
              </button>
              <button 
                disabled={isSubmitting || !mForm.firstName || !mForm.lastName}
                className={`px-6 py-2 font-bold rounded-lg shadow transition ${
                  isSubmitting ? 'bg-slate-400 text-white cursor-wait' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const fd = new FormData();
                    fd.append('firstName', mForm.firstName);
                    fd.append('lastName', mForm.lastName);
                    fd.append('graduationYear', mForm.graduationYear);
                    fd.append('track', mForm.track);
                    if (mFile) fd.append('file', mFile);

                    const res = await fetch('/api/admin/alumni/migrate', { method: 'POST', body: fd });
                    const result = await res.json();
                    
                    if (result.success) {
                      setAlumniList(prev => [result.data, ...prev]);
                      setIsMigrating(false);
                      setMForm({ firstName: '', lastName: '', graduationYear: '', track: 'THEOLOGY' });
                      setMFile(null);
                    } else {
                      alert(result.error || "Migration failed.");
                    }
                  } catch (e) {
                    console.error(e);
                    alert("Network error processing migration.");
                  }
                  setIsSubmitting(false);
                }}
              >
                {isSubmitting ? 'Processing...' : 'Execute Migration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alumnus View Modal */}
      {selectedAlumnus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black">{selectedAlumnus.user.firstName} {selectedAlumnus.user.lastName}</h3>
                <p className="text-slate-400 font-mono text-sm mt-1">{selectedAlumnus.id.substring(0, 8).toUpperCase()}</p>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 bg-white/10 rounded-md text-xs font-bold text-blue-300 backdrop-blur-sm border border-white/10 uppercase">
                    {selectedAlumnus.track.replace('_', ' ')}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 rounded-md text-xs font-bold text-blue-300 backdrop-blur-sm border border-blue-500/30 uppercase">
                    ALUMNI
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedAlumnus(null)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-2xl shadow-sm">📜</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Digital Academic Transcript</h4>
                    <p className="text-xs text-slate-500">{selectedAlumnus.enrollments.length} verified course records</p>
                  </div>
                </div>
                {selectedAlumnus.enrollments.length > 0 ? (
                  <button 
                    onClick={handlePrint} 
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    🖨️ Download PDF
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded">No digital records</span>
                )}
              </div>

              <div className={`flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 ${!selectedAlumnus.legacyFilePath ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-2xl shadow-sm ${!selectedAlumnus.legacyFilePath ? 'opacity-50' : ''}`}>📄</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Legacy Paper Scan</h4>
                    <p className="text-xs text-slate-500">
                      {selectedAlumnus.legacyFilePath ? 'Archived physical transcript attached' : 'No physical scan attached to this dossier'}
                    </p>
                  </div>
                </div>
                {selectedAlumnus.legacyFilePath ? (
                  <a 
                    href={selectedAlumnus.legacyFilePath} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    View File
                  </a>
                ) : (
                  <button className="px-4 py-2 bg-slate-200 text-slate-500 font-bold text-xs rounded-lg cursor-not-allowed">
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Transcript for Printing */}
      {selectedAlumnus && (
        <div id="printable-transcript" className="hidden bg-white p-12 rounded-2xl shadow-xl border border-slate-200 max-w-4xl mx-auto">
          {/* Transcript Header */}
          <div className="border-b-4 border-slate-900 pb-8 mb-8 text-center">
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mb-2">Esdros Theological Seminary</h1>
            <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Official Academic Transcript</h2>
          </div>
          
          {/* Student Info */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alumnus Name</p>
              <p className="text-2xl font-black text-slate-800">{selectedAlumnus.user.firstName} {selectedAlumnus.user.lastName}</p>
              <p className="text-sm text-slate-500 mt-1">{selectedAlumnus.user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Profile</p>
              <p className="text-lg font-bold text-slate-800">ID: {selectedAlumnus.id.substring(0, 8).toUpperCase()}</p>
              <p className="text-sm font-bold text-blue-600 mt-1 uppercase">{selectedAlumnus.track.replace('_', ' ')} TRACK</p>
              <p className="text-sm font-bold text-slate-500 mt-1">Conferred: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Academic Record */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Academic Record</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2">Course Code</th>
                  <th className="py-2">Course Title</th>
                  <th className="py-2 text-center">Credits</th>
                  <th className="py-2 text-center">Grade</th>
                  <th className="py-2 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedAlumnus.enrollments.map((e: any) => {
                  const credits = e.courseSection.course.credits || 3;
                  return (
                    <tr key={e.id}>
                      <td className="py-3 font-mono font-bold text-slate-700">{e.courseSection.course.code}</td>
                      <td className="py-3 text-slate-800">{e.courseSection.course.title}</td>
                      <td className="py-3 text-center text-slate-600">{credits}</td>
                      <td className="py-3 text-center font-bold text-slate-900">{getLetter(e.grade)}</td>
                      <td className="py-3 text-right text-slate-600">{e.grade !== null ? e.grade.toFixed(1) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* GPA Summary */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Final Cumulative GPA</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{getGPA(selectedAlumnus.enrollments)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 italic max-w-xs">
                This document is an official record of the academic degree conferred by Esdros Theological Seminary.
              </p>
            </div>
          </div>
          
          {/* Signature Area */}
          <div className="mt-24 pt-8 border-t border-slate-200 flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-500">Date Issued: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-400 mb-2"></div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registrar Signature</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
