// app/dashboard/admin/courses/import-grades/GradeImporterClient.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudentInfo {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface EnrollmentInfo {
  id: string;
  student: StudentInfo;
}

interface CourseSectionInfo {
  id: string;
  semester: string;
  room: string | null;
  course: {
    code: string;
    title: string;
    credits: number;
  };
  faculty?: {
    user: {
      firstName: string;
      lastName: string;
    };
  } | null;
  enrollments: EnrollmentInfo[];
}

interface ParsedGrade {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  mark: number;
  letter: string;
  isValid: boolean;
  error?: string;
}

export default function GradeImporterClient({ initialSections }: { initialSections: CourseSectionInfo[] }) {
  const router = useRouter();
  const [sections] = useState<CourseSectionInfo[]>(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [parsedGrades, setParsedGrades] = useState<ParsedGrade[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // Dynamic letter resolving mapping helper
  const getLetter = (score: number) => {
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

  const handleExportTemplate = () => {
    if (!selectedSection) return;

    // Prefill headers matching faculty exported spreadsheets
    const headers = ['Enrollment ID', 'Student ID', 'Student Name', 'Course Code', 'Course Title', 'Final Score (0-100)'];
    
    // Auto populate student lines
    const rows = selectedSection.enrollments.map((e) => [
      e.id,
      e.student.id,
      `"${e.student.user.firstName} ${e.student.user.lastName}"`,
      selectedSection.course.code,
      `"${selectedSection.course.title}"`,
      '', // Blank column for inputting score
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Grading_Template_${selectedSection.course.code.replace(/\s+/g, '_')}_${selectedSection.semester.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setIsSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
      if (lines.length < 2) {
        setErrorMsg('Invalid spreadsheet. File is empty or missing data lines.');
        return;
      }

      // Check header indexes
      const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
      const enrollmentIdx = headers.indexOf('Enrollment ID');
      const studentIdIdx = headers.indexOf('Student ID');
      const studentNameIdx = headers.indexOf('Student Name');
      const scoreIdx = headers.indexOf('Final Score (0-100)');

      if (enrollmentIdx === -1 || scoreIdx === -1) {
        setErrorMsg('Invalid CSV layout. Spreadsheet must contain "Enrollment ID" and "Final Score (0-100)" columns.');
        return;
      }

      const gradesList: ParsedGrade[] = [];

      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (columns.length < 2) continue;

        const enrollmentId = columns[enrollmentIdx];
        const studentId = studentIdIdx !== -1 ? columns[studentIdIdx] : '';
        const studentName = studentNameIdx !== -1 ? columns[studentNameIdx] : 'Unknown Student';
        const rawScore = columns[scoreIdx];

        if (!enrollmentId) continue;

        // Perform score validations
        const mark = parseFloat(rawScore);
        const isValid = !isNaN(mark) && mark >= 0 && mark <= 100;
        const letter = isValid ? getLetter(mark) : 'F';

        gradesList.push({
          enrollmentId,
          studentId,
          studentName,
          mark: isValid ? mark : 0,
          letter,
          isValid,
          error: !isValid
            ? isNaN(mark)
              ? 'Final Score is not a valid number.'
              : 'Score boundary breach. Grade must be between 0 and 100.'
            : undefined,
        });
      }

      setParsedGrades(gradesList);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input element
  };

  const handleBulkSubmit = async () => {
    if (parsedGrades.length === 0 || parsedGrades.some((g) => !g.isValid)) {
      alert('Cannot commit grades. Please resolve all invalid score flags first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setIsSuccess(false);

    try {
      const res = await fetch('/api/admin/academics/import-grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSectionId,
          grades: parsedGrades.map((g) => ({
            enrollmentId: g.enrollmentId,
            mark: g.mark,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit grade imports.');
      }

      setIsSuccess(true);
      setParsedGrades([]);
      setSelectedSectionId('');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected database error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Header Display Card */}
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-xl shadow-slate-100 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="relative z-10 space-y-2">
          <Link href="/dashboard/admin/courses" className="text-indigo-600 hover:text-indigo-800 font-extrabold text-xs flex items-center gap-1">
            &larr; Return to Course Console
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">LMS Grade Importer</h1>
          <p className="text-sm font-semibold text-slate-500 max-w-2xl">
            Secure administrative console to bulk load semester evaluation points from spreadsheets on behalf of faculty instructors.
          </p>
        </div>

        <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20 text-white flex-shrink-0">
          📊
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Step 1: Configuration & Action Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xl shadow-slate-100/50 space-y-6 h-fit relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
              Importer Settings
            </h3>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Step 1</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Select Target Course Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                setParsedGrades([]);
                setErrorMsg(null);
                setIsSuccess(false);
              }}
              className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs bg-slate-50 font-extrabold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition"
            >
              <option value="">-- Choose Assigned Course Section --</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.course.code} - {s.course.title} ({s.faculty ? `${s.faculty.user.firstName} ${s.faculty.user.lastName}` : 'Unassigned'}) [{s.semester}]
                </option>
              ))}
            </select>
          </div>

          {selectedSection ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 animate-fadeIn text-xs">
              <h4 className="font-extrabold text-slate-700 border-b border-slate-200/60 pb-1.5 uppercase tracking-wider text-[10px]"> Roster Dossier Summary</h4>
              <p className="text-slate-600 flex items-center justify-between">
                <span>📚 <b>Course:</b></span>
                <span className="font-bold text-slate-800">{selectedSection.course.title}</span>
              </p>
              <p className="text-slate-600 flex items-center justify-between">
                <span>👨‍🏫 <b>Instructor:</b></span>
                <span className="font-bold text-slate-800">{selectedSection.faculty ? `${selectedSection.faculty.user.firstName} ${selectedSection.faculty.user.lastName}` : 'Unassigned'}</span>
              </p>
              <p className="text-slate-600 flex items-center justify-between">
                <span>📅 <b>Semester:</b></span>
                <span className="font-bold text-slate-800">{selectedSection.semester}</span>
              </p>
              <p className="text-slate-600 flex items-center justify-between">
                <span>👥 <b>Active Enrolled:</b></span>
                <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full text-[10px]">{selectedSection.enrollments.length} Students</span>
              </p>
            </div>
          ) : (
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 text-center font-medium">
              Please choose a course section from the dropdown list to initiate grading actions.
            </div>
          )}

          {selectedSection && selectedSection.enrollments.length === 0 && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 text-xs text-center font-bold">
              No active students are currently enrolled in this course section.
            </div>
          )}

          {selectedSection && selectedSection.enrollments.length > 0 && (
            <div className="space-y-3 pt-2">
              <button
                onClick={handleExportTemplate}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                📥 1. Export Pre-Filled Template
              </button>

              <label className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-100 transition flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer">
                📤 2. Upload Graded Spreadsheet
                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Step 2: Spreadsheet Preview Grid */}
        <div className="lg:col-span-2 space-y-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-bold animate-pulse">
              ⚠️ {errorMsg}
            </div>
          )}

          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-3xl p-8 text-center space-y-3 shadow-lg shadow-emerald-100 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto shadow shadow-emerald-400/30">✓</div>
              <h3 className="text-lg font-black text-slate-900">Grades Successfully Persisted</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Roster grades have been written to the ledger database and audited under security logs.
              </p>
            </div>
          )}

          {parsedGrades.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 shadow-xl shadow-slate-100/50 flex flex-col justify-center items-center space-y-4">
              <span className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">📋</span>
              <div>
                <h3 className="text-base font-extrabold text-slate-700">Roster Ledger Matrix</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                  Once a graded Excel spreadsheet is uploaded, imported marks and resolved letter grades will be rendered here for verification.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/50 overflow-hidden animate-fadeIn">
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Preview Excel Import Rows</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Please review imported values and dynamic letters before saving.</p>
                </div>
                <button
                  onClick={handleBulkSubmit}
                  disabled={isProcessing || parsedGrades.some((g) => !g.isValid)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-black rounded-xl text-xs shadow-md shadow-slate-950/20 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Saving Roster...' : '💾 Bulk Save Imported Grades'}
                </button>
              </div>

              <div className="overflow-x-auto max-h-[460px] divide-y divide-slate-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Student Name</th>
                      <th className="p-4 text-center">Score (0-100)</th>
                      <th className="p-4 text-center">Calculated Letter</th>
                      <th className="p-4 text-center">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-semibold">
                    {parsedGrades.map((g) => (
                      <tr key={g.enrollmentId} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                          <p className="font-extrabold text-slate-900">{g.studentName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {g.studentId.substring(0, 8).toUpperCase()}</p>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-700">
                          {g.isValid ? `${g.mark.toFixed(1)}%` : '--'}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded font-black text-[10px] ${
                            g.letter.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                            g.letter.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                            g.letter.startsWith('C') ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {g.letter}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {g.isValid ? (
                            <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ready
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center justify-center gap-1" title={g.error}>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> ⚠️ Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
