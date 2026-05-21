'use client';
import { useState } from 'react';

export default function TranscriptClient({ students }: { students: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const filteredStudents = students.filter(s => 
    `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    if (!selectedStudent) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/transcripts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent.id })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to send transcript email.');
      } else {
        setSentSuccess(true);
        setTimeout(() => setSentSuccess(false), 3000);
      }
    } catch {
      alert('A network error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
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
    <>
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
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {!selectedStudent ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
          <div className="p-6 border-b border-slate-200 space-y-4">
            <input
              type="text"
              placeholder="Search student by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Student ID</th>
                <th className="px-6 py-3">Program Track</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {student.user.firstName} {student.user.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{student.id}</td>
                  <td className="px-6 py-4 text-slate-600">{student.track}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition"
                    >
                      View Transcript
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between no-print">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition"
            >
              &larr; Back to List
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg shadow-lg hover:bg-slate-800 transition flex items-center gap-2"
              >
                🖨️ Print / Save PDF
              </button>
              <button 
                onClick={handleEmail}
                disabled={isSending}
                className={`px-6 py-2 font-bold rounded-lg shadow-lg transition flex items-center gap-2 ${
                  sentSuccess 
                    ? 'bg-emerald-500 text-white' 
                    : isSending 
                      ? 'bg-blue-300 text-white cursor-wait' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {sentSuccess ? '✓ Sent' : isSending ? 'Sending...' : '📧 Send to Email'}
              </button>
            </div>
          </div>

          <div id="printable-transcript" className="bg-white p-12 rounded-2xl shadow-xl border border-slate-200 max-w-4xl mx-auto">
            {/* Transcript Header */}
            <div className="border-b-4 border-slate-900 pb-8 mb-8 text-center">
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mb-2">Esdros Seminary</h1>
              <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Official Academic Transcript</h2>
            </div>
            
            {/* Student Info */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student Candidate</p>
                <p className="text-2xl font-black text-slate-800">{selectedStudent.user.firstName} {selectedStudent.user.lastName}</p>
                <p className="text-sm text-slate-500 mt-1">{selectedStudent.user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Profile</p>
                <p className="text-lg font-bold text-slate-800">ID: {selectedStudent.id.substring(0, 8).toUpperCase()}</p>
                <p className="text-sm font-bold text-blue-600 mt-1 uppercase">{selectedStudent.track} TRACK</p>
                <p className="text-sm text-slate-500 mt-1">Enrolled: {new Date(selectedStudent.enrollDate).toLocaleDateString()}</p>
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
                  {selectedStudent.enrollments.map((e: any) => {
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
                  {selectedStudent.enrollments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 italic">No academic records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* GPA Summary */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cumulative GPA</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{getGPA(selectedStudent.enrollments)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 italic max-w-xs">
                  This document is an official record of the academic achievements attained at Esdros Seminary.
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
        </div>
      )}
    </>
  );
}
