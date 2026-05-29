'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TranscriptClient({ students, classes = [], withdrawalRequests = [] }: { students: any[], classes?: any[], withdrawalRequests?: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'roster' | 'withdrawals'>('roster');

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.isSuperAdmin) {
          setIsSuperAdmin(true);
        }
      })
      .catch(err => console.error('Error fetching user metadata:', err));
  }, []);

  const [localWithdrawals, setLocalWithdrawals] = useState<any[]>(withdrawalRequests);

  const [isImportingActive, setIsImportingActive] = useState(false);
  const [excelActiveFile, setExcelActiveFile] = useState<File | null>(null);
  const [excelActiveParsedData, setExcelActiveParsedData] = useState<any[]>([]);
  const [isExcelActiveUploading, setIsExcelActiveUploading] = useState(false);

  // Manual Onboarding states
  const [isOnboardingManual, setIsOnboardingManual] = useState(false);
  const [isOnboardingSubmit, setIsOnboardingSubmit] = useState(false);
  const [onboardingMessage, setOnboardingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const generateTempPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
    let pass = 'Temp-';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const [manualStudentForm, setManualStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    track: 'THEOLOGY',
    classId: '',
    password: ''
  });

  // Automatically select a class matching the track and generate password when modal opens
  useEffect(() => {
    if (isOnboardingManual) {
      let filtered = classes.filter((c: any) => 
        manualStudentForm.track === 'THEOLOGY' 
          ? c.department?.code === 'THEO' || c.code.startsWith('TH')
          : c.department?.code === 'GEEZ' || c.code.startsWith('GZ')
      );
      if (filtered.length === 0) {
        filtered = classes;
      }
      setManualStudentForm(prev => ({
        ...prev,
        password: generateTempPassword(),
        classId: filtered[0]?.id || ''
      }));
    }
  }, [isOnboardingManual, classes]);

  // Adjust cohort class automatically if track changes in the form
  const handleTrackChange = (newTrack: string) => {
    let filtered = classes.filter((c: any) => 
      newTrack === 'THEOLOGY' 
        ? c.department?.code === 'THEO' || c.code.startsWith('TH')
        : c.department?.code === 'GEEZ' || c.code.startsWith('GZ')
    );
    if (filtered.length === 0) {
      filtered = classes;
    }
    setManualStudentForm(prev => ({
      ...prev,
      track: newTrack,
      classId: filtered[0]?.id || ''
    }));
  };

  const handleManualOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentForm.firstName.trim() || !manualStudentForm.lastName.trim() || !manualStudentForm.email.trim() || !manualStudentForm.classId || !manualStudentForm.password) {
      setOnboardingMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    
    setIsOnboardingSubmit(true);
    setOnboardingMessage(null);

    try {
      const res = await fetch('/api/admin/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: manualStudentForm.firstName.trim(),
          lastName: manualStudentForm.lastName.trim(),
          email: manualStudentForm.email.trim(),
          track: manualStudentForm.track,
          classId: manualStudentForm.classId,
          password: manualStudentForm.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setOnboardingMessage({ type: 'error', text: data.error || 'Failed to onboard student.' });
      } else {
        setOnboardingMessage({ type: 'success', text: 'Student onboarded successfully! Welcome email sent.' });
        // Clean form and wait a brief moment to close modal and refresh
        setTimeout(() => {
          setIsOnboardingManual(false);
          setManualStudentForm({
            firstName: '',
            lastName: '',
            email: '',
            track: 'THEOLOGY',
            classId: '',
            password: ''
          });
          setOnboardingMessage(null);
          router.refresh();
        }, 1500);
      }
    } catch {
      setOnboardingMessage({ type: 'error', text: 'Network error occurred. Please try again.' });
    } finally {
      setIsOnboardingSubmit(false);
    }
  };

  const downloadActiveExcelTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      
      const data = [
        {
          "First Name": "Amanuel",
          "Last Name": "Tsegaye",
          "Email": "amanuel.tsegaye@esderos.org",
          "Program Track": "THEOLOGY",
          "Class Cohort": "TH-Y1",
          "Course Code": "THEO101",
          "Course Title": "Introduction to Systematic Theology",
          "Credits": "3",
          "Course Status": "COMPLETED",
          "Grade": "95",
          "Letter Grade": "A+",
          "Semester": "Fall 2026"
        },
        {
          "First Name": "Amanuel",
          "Last Name": "Tsegaye",
          "Email": "amanuel.tsegaye@esderos.org",
          "Program Track": "THEOLOGY",
          "Class Cohort": "TH-Y1",
          "Course Code": "THEO102",
          "Course Title": "Patristic Theology",
          "Credits": "3",
          "Course Status": "ACTIVE",
          "Grade": "",
          "Letter Grade": "",
          "Semester": "Fall 2026"
        },
        {
          "First Name": "Selam",
          "Last Name": "Tekle",
          "Email": "selam.tekle@esderos.org",
          "Program Track": "GEEZ_LANGUAGE",
          "Class Cohort": "GEEZ-COHORT",
          "Course Code": "GEEZ101",
          "Course Title": "Introduction to Geez Grammar",
          "Credits": "3",
          "Course Status": "COMPLETED",
          "Grade": "90",
          "Letter Grade": "A-",
          "Semester": "Fall 2026"
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Active Students Template");
      
      const maxLens = [12, 12, 25, 15, 15, 12, 35, 8, 12, 8, 12, 12];
      worksheet["!cols"] = maxLens.map(w => ({ wch: w }));

      XLSX.writeFile(workbook, "active_student_import_template.xlsx");
    } catch (err) {
      console.error(err);
      alert("Failed to build Excel template dynamically.");
    }
  };

  const handleActiveExcelUpload = async (file: File) => {
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const data = e.target?.result;
        if (!data) return;
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        if (rawRows.length === 0) {
          alert("The uploaded spreadsheet is empty.");
          return;
        }

        const studentMap: { [key: string]: any } = {};
        
        rawRows.forEach((row, index) => {
          const getVal = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => keys.includes(k.trim().toLowerCase()));
            return foundKey ? String(row[foundKey]).trim() : '';
          };

          const firstName = getVal(['first name', 'firstname', 'name']);
          const lastName = getVal(['last name', 'lastname', 'surname']);
          const rawTrack = getVal(['program track', 'track', 'program']);
          const classCohort = getVal(['class cohort', 'cohort', 'class']);
          const email = getVal(['email', 'email address', 'mail']);
          const courseCode = getVal(['course code', 'coursecode', 'code']);
          const courseTitle = getVal(['course title', 'coursetitle', 'title']);
          const rawCredits = getVal(['credits', 'credit']);
          const courseStatus = getVal(['course status', 'status', 'type']).toUpperCase() || 'COMPLETED';
          const rawGrade = getVal(['grade', 'score', 'mark']);
          const letterGrade = getVal(['letter grade', 'lettergrade', 'grade (letter)', 'grade(letter)']) || '';
          const semester = getVal(['semester', 'term']) || 'Fall 2026';

          if (!firstName || !lastName) return;

          let track = 'THEOLOGY';
          if (rawTrack.toUpperCase().includes('GEEZ') || rawTrack.toUpperCase().includes('GZ')) {
            track = 'GEEZ_LANGUAGE';
          }

          const groupKey = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
          
          if (!studentMap[groupKey]) {
            studentMap[groupKey] = {
              firstName,
              lastName,
              track,
              classCohort,
              email: email || '',
              courses: [],
              isValid: true,
              validationErrors: []
            };
          }

          const student = studentMap[groupKey];

          if (rawTrack && rawTrack !== 'THEOLOGY' && rawTrack !== 'GEEZ_LANGUAGE') {
            student.validationErrors.push(`Row ${index + 2}: Non-standard track "${rawTrack}" (auto-mapped to ${track})`);
          }

          if (courseCode) {
            const credits = parseInt(rawCredits) || 3;
            const isCompleted = courseStatus === 'COMPLETED';
            const grade = rawGrade ? parseFloat(rawGrade) : null;
            
            if (isCompleted && rawGrade && (grade === null || isNaN(grade) || grade < 0 || grade > 100)) {
              student.isValid = false;
              student.validationErrors.push(`Row ${index + 2}: Invalid grade score "${rawGrade}" for ${courseCode} (must be 0-100)`);
            }

            student.courses.push({
              code: courseCode,
              title: courseTitle || `${courseCode} Course`,
              credits,
              status: courseStatus,
              grade: isCompleted && grade !== null && !isNaN(grade) ? grade : null,
              letterGrade: isCompleted && letterGrade ? letterGrade : null,
              semester
            });
          }
        });

        const parsedList = Object.values(studentMap);
        setExcelActiveParsedData(parsedList);
        setExcelActiveFile(file);
      };

      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      alert("Failed to parse the Excel file.");
    }
  };

  const submitActiveImport = async () => {
    if (excelActiveParsedData.length === 0) return;
    setIsExcelActiveUploading(true);
    try {
      const res = await fetch('/api/admin/active-students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: excelActiveParsedData })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to import students.');
      } else {
        alert(`Successfully imported ${data.count} active students and sent email invitations!`);
        setIsImportingActive(false);
        setExcelActiveFile(null);
        setExcelActiveParsedData([]);
        window.location.reload();
      }
    } catch {
      alert('Network error submitting import.');
    } finally {
      setIsExcelActiveUploading(false);
    }
  };

  const handleProcessWithdrawal = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    const confirmation = window.confirm(`Are you sure you want to ${action.toLowerCase()} this withdrawal request?`);
    if (!confirmation) return;

    try {
      const res = await fetch('/api/admin/withdrawal/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to process request.');
      } else {
        alert(data.message || 'Request processed successfully!');
        router.refresh();
      }
    } catch {
      alert('Network error processing request.');
    }
  };

  const handleUpdateStatus = async (studentId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/students/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update student status.');
      } else {
        alert('Student status updated successfully!');
        router.refresh();
      }
    } catch {
      alert('Network error updating student status.');
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    const doubleConfirm = window.confirm(`⚠️ WARNING: Permanent Student Purge Requested ⚠️\n\nAre you absolutely sure you want to permanently delete student "${name}"?\n\nThis action CANNOT be undone and will permanently delete:\n- Their student profile & user account\n- All of their course enrollments & sections history\n- All their grades & transcript records\n- All attendance history\n- All associated invoices and payments\n\nType OK to confirm.`);
    if (!doubleConfirm) return;

    setIsDeleting(studentId);
    try {
      const res = await fetch(`/api/admin/students/delete?studentId=${studentId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete student.');
      } else {
        alert(data.message || 'Student permanently deleted.');
        router.refresh();
      }
    } catch (err) {
      alert('Network error deleting student.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Extract unique enrollment years dynamically
  const uniqueYears = Array.from(
    new Set(students.map(s => new Date(s.enrollDate).getFullYear()))
  ).sort((a, b) => b - a);

  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    
    const matchesYear = yearFilter === 'ALL' || new Date(s.enrollDate).getFullYear().toString() === yearFilter;
    
    return matchesSearch && matchesStatus && matchesYear;
  });

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
        #printable-transcript {
          position: relative;
          overflow: hidden;
        }
        .transcript-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 350px;
          height: 350px;
          opacity: 0.05;
          background-image: url('https://esderos.eotcmk.org/seminary/pluginfile.php/1/theme_klass/logo/1651894977/logo.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          pointer-events: none;
          z-index: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
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
          .transcript-watermark {
            opacity: 0.06 !important;
            display: block !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {!selectedStudent && (
        <div className="flex gap-4 mb-6 border-b border-slate-200 pb-px print:hidden">
          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${
              activeTab === 'roster'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🎓 Student Transcripts & Statuses
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'withdrawals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🚫 Pending Student Withdrawals
            {localWithdrawals.filter((w: any) => w.status === 'PENDING').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {localWithdrawals.filter((w: any) => w.status === 'PENDING').length}
              </span>
            )}
          </button>
        </div>
      )}

      {!selectedStudent ? (
        activeTab === 'roster' ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search student by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm text-slate-800 focus:outline-none"
                />
              </div>
              
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="ALL">🎓 All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="GRADUATED">Graduated (Alumni)</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                  <option value="DISMISSED">Dismissed</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="ALL">📅 All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsImportingActive(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/10 shrink-0"
                >
                  📥 Import Active Students
                </button>

                <button
                  type="button"
                  onClick={() => setIsOnboardingManual(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/10 shrink-0"
                >
                  ＋ Add Student
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Student ID</th>
                    <th className="px-6 py-3">Program Track</th>
                    <th className="px-6 py-3">Roster Status</th>
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
                      <td className="px-6 py-4">
                        <select
                          value={student.status}
                          onChange={(e) => handleUpdateStatus(student.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            student.status === 'GRADUATED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            student.status === 'WITHDRAWN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            student.status === 'DISMISSED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="GRADUATED">GRADUATED</option>
                          <option value="WITHDRAWN">WITHDRAWN</option>
                          <option value="DISMISSED">DISMISSED</option>
                          <option value="ON_LEAVE">ON LEAVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2 whitespace-nowrap">
                          <button 
                            onClick={() => setSelectedStudent(student)}
                            className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition whitespace-nowrap"
                          >
                            View Transcript
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteStudent(student.id, `${student.user.firstName} ${student.user.lastName}`)}
                              disabled={isDeleting === student.id}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                            >
                              {isDeleting === student.id ? 'Deleting...' : 'Delete Student'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium italic">
                        No students found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 print:hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Pending Withdrawal Requests</h3>
            {localWithdrawals.filter((w: any) => w.status === 'PENDING').length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-medium italic bg-slate-50 rounded-xl border border-slate-100">
                🎉 No pending withdrawal requests under review!
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Reason</th>
                      <th className="px-6 py-3">Submitted At</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localWithdrawals.filter((w: any) => w.status === 'PENDING').map((req: any) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {req.student.user.firstName} {req.student.user.lastName}
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{req.studentId}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-sm" style={{ wordBreak: 'break-word' }}>
                          {req.reason}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {new Date(req.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleProcessWithdrawal(req.id, 'APPROVE')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleProcessWithdrawal(req.id, 'REJECT')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg transition"
                          >
                            ✗ Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Resolved Requests */}
            {localWithdrawals.filter((w: any) => w.status !== 'PENDING').length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-md font-bold text-slate-700 mb-4 uppercase tracking-wider">Processed Requests History</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Reason</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Processed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {localWithdrawals.filter((w: any) => w.status !== 'PENDING').map((req: any) => (
                        <tr key={req.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {req.student.user.firstName} {req.student.user.lastName}
                          </td>
                          <td className="px-6 py-4 text-slate-500 max-w-sm truncate" title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest uppercase ${
                              req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(req.updatedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
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

          <div id="printable-transcript" className="bg-white p-12 rounded-2xl shadow-xl border border-slate-200 max-w-4xl mx-auto relative overflow-hidden">
            {/* Background Watermark Logo */}
            <div className="transcript-watermark" aria-hidden="true"></div>

            {/* Transcript Header */}
            <div className="border-b-4 border-slate-900 pb-8 mb-8 text-center relative z-10 flex flex-col items-center justify-center">
              <img 
                src="https://esderos.eotcmk.org/seminary/pluginfile.php/1/theme_klass/logo/1651894977/logo.png"
                alt="Esderos EOTC Theological Seminary Logo"
                className="h-20 w-20 object-contain mb-4 filter drop-shadow-sm"
              />
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mb-2">Esderos EOTC Theological Seminary</h1>
              <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Official Academic Transcript</h2>
            </div>
            
            {/* Student Info */}
            <div className="grid grid-cols-2 gap-8 mb-12 relative z-10">
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
            <div className="mb-12 relative z-10">
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
                        <td className="py-3 text-center font-bold text-slate-900">{e.letterGrade || getLetter(e.grade)}</td>
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
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-between items-center relative z-10">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cumulative GPA</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{getGPA(selectedStudent.enrollments)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 italic max-w-xs">
                  This document is an official record of the academic achievements attained at Esderos EOTC Theological Seminary.
                </p>
              </div>
            </div>
            
            {/* Signature Area */}
            <div className="mt-24 pt-8 border-t border-slate-200 flex justify-between items-end relative z-10">
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

      {/* Active Students Excel Import Modal */}
      {isImportingActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Import Active Students & Records</h3>
                <p className="text-sm text-slate-500">Upload an Excel/CSV file to batch-import active students with completed and attending courses.</p>
              </div>
              <button 
                onClick={() => {
                  setIsImportingActive(false);
                  setExcelActiveFile(null);
                  setExcelActiveParsedData([]);
                }} 
                className="text-slate-400 hover:text-rose-500 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              {/* Instructions and Download Template */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="md:col-span-2">
                  <h4 className="font-bold text-slate-800 text-sm">Spreadsheet Layout & Guidelines:</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Download our official template. You can list multiple rows for the same student to map multiple course enrollments.
                    Use the <b>Course Status</b> column as <b>COMPLETED</b> (with grade/letter grade) or <b>ACTIVE</b> (representing attending current term courses, grade is not required!).
                    Upon successful import, students receive automated portal invitation emails to sign up.
                  </p>
                </div>
                <div className="text-right">
                  <button 
                    onClick={downloadActiveExcelTemplate}
                    className="w-full md:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2"
                  >
                    📥 Download Excel Template
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              {!excelActiveFile ? (
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition cursor-pointer">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleActiveExcelUpload(file);
                    }}
                    accept=".xlsx,.xls,.csv"
                  />
                  <div className="text-5xl mb-3">📊</div>
                  <p className="text-sm font-bold text-slate-700">Drag & drop your active student spreadsheet here</p>
                  <p className="text-xs text-slate-500 mt-1">Accepts Excel (.xlsx, .xls) and standard CSV files</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Selection Header */}
                  <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="text-sm font-bold text-emerald-800">Successfully Loaded: {excelActiveFile.name}</p>
                        <p className="text-xs text-emerald-600">Parsed {excelActiveParsedData.length} unique active student profiles</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setExcelActiveFile(null);
                        setExcelActiveParsedData([]);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 rounded-lg text-xs font-bold transition"
                    >
                      Clear File
                    </button>
                  </div>

                  {/* Preview Grid */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm">Batch Ingestion Preview Grid:</h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Student Name</th>
                            <th className="px-4 py-3">Track / Cohort</th>
                            <th className="px-4 py-3">Email Address</th>
                            <th className="px-4 py-3">Courses Loaded</th>
                            <th className="px-4 py-3">Data integrity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {excelActiveParsedData.map((st, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-bold text-slate-800">{st.firstName} {st.lastName}</td>
                              <td className="px-4 py-3 text-slate-600">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded mr-1.5 uppercase font-mono tracking-tight text-[10px]">
                                  {st.track.replace('_', ' ')}
                                </span>
                                <span className="text-slate-500 font-medium">({st.classCohort || 'Default'})</span>
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono">{st.email || <span className="italic text-slate-400">Auto-generated</span>}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-max text-[10px]">
                                    {st.courses.length} courses
                                  </span>
                                  <div className="text-[10px] text-slate-500 space-y-0.5 max-w-[200px] truncate">
                                    {st.courses.map((c: any, ci: number) => (
                                      <p key={ci}>
                                        {c.code} ({c.status})
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {st.isValid && st.validationErrors.length === 0 ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-bold text-[10px] uppercase">✓ Ready</span>
                                ) : (
                                  <div className="space-y-1">
                                    {!st.isValid && <span className="inline-block text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold text-[10px] uppercase">⚠ Error</span>}
                                    {st.validationErrors.map((err: string, k: number) => (
                                      <p key={k} className="text-[10px] text-amber-600 font-medium">{err}</p>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsImportingActive(false);
                  setExcelActiveFile(null);
                  setExcelActiveParsedData([]);
                }}
                disabled={isExcelActiveUploading}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button 
                onClick={submitActiveImport}
                disabled={isExcelActiveUploading || excelActiveParsedData.length === 0 || excelActiveParsedData.some(s => !s.isValid)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isExcelActiveUploading ? 'Executing Batch Import...' : '⚡ Import Students & Send Invites'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Student Onboarding Modal */}
      {isOnboardingManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Onboard Student Candidate</h3>
                <p className="text-sm text-slate-500">Add a new student candidate manually and email their temporary login credentials.</p>
              </div>
              <button 
                onClick={() => {
                  setIsOnboardingManual(false);
                  setOnboardingMessage(null);
                }} 
                className="text-slate-400 hover:text-rose-500 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleManualOnboard} className="flex flex-col">
              <div className="p-6 space-y-4">
                {onboardingMessage && (
                  <div className={`p-4 rounded-xl text-sm font-semibold border ${
                    onboardingMessage.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {onboardingMessage.type === 'success' ? '✓ ' : '⚠ '}
                    {onboardingMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">First Name *</label>
                    <input 
                      type="text" 
                      required
                      value={manualStudentForm.firstName}
                      onChange={e => setManualStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="e.g. Melkam"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-sm text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Last Name *</label>
                    <input 
                      type="text" 
                      required
                      value={manualStudentForm.lastName}
                      onChange={e => setManualStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="e.g. Seminary"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-sm text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={manualStudentForm.email}
                    onChange={e => setManualStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. student@esderos.org"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Program Track *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
                      <input 
                        type="radio" 
                        name="manual-track" 
                        checked={manualStudentForm.track === 'THEOLOGY'}
                        onChange={() => handleTrackChange('THEOLOGY')}
                        className="text-emerald-600 focus:ring-emerald-500" 
                      />
                      Theology
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700">
                      <input 
                        type="radio" 
                        name="manual-track" 
                        checked={manualStudentForm.track === 'GEEZ_LANGUAGE'}
                        onChange={() => handleTrackChange('GEEZ_LANGUAGE')}
                        className="text-emerald-600 focus:ring-emerald-500" 
                      />
                      Geez Language
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Cohort Class Assignment *</label>
                  <select
                    value={manualStudentForm.classId}
                    onChange={e => setManualStudentForm(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-sm text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {(() => {
                      let filtered = classes.filter((c: any) => 
                        manualStudentForm.track === 'THEOLOGY' 
                          ? c.department?.code === 'THEO' || c.code.startsWith('TH')
                          : c.department?.code === 'GEEZ' || c.code.startsWith('GZ')
                      );
                      if (filtered.length === 0) {
                        filtered = classes;
                      }
                      return filtered.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ));
                    })()}
                    {classes.length === 0 && (
                      <option value="">— No matching classes found —</option>
                    )}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Temporary Password *</label>
                    <button
                      type="button"
                      onClick={() => setManualStudentForm(prev => ({ ...prev, password: generateTempPassword() }))}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      ⚡ Regenerate
                    </button>
                  </div>
                  <input 
                    type="text" 
                    required
                    value={manualStudentForm.password}
                    onChange={e => setManualStudentForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Temporary password"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-sm text-slate-800 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This password will be immediately hashed upon save, and dispatched via welcome email invitation.</p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsOnboardingManual(false);
                    setOnboardingMessage(null);
                  }}
                  disabled={isOnboardingSubmit}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isOnboardingSubmit || !manualStudentForm.classId}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isOnboardingSubmit ? 'Adding Student...' : '⚡ Onboard Student & Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
