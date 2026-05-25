'use client';
import { useState, useEffect } from 'react';
import SidebarNavigation from '../../../components/SidebarNavigation';

export default function AttendancePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'EXCUSED'; notes: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'RECORD' | 'LEDGER'>('RECORD');

  // Summary state
  const [summaryRecords, setSummaryRecords] = useState<any[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=Attendance')
      .then(res => res.json())
      .then(d => {
        const sectionsList = d.sections || [];
        setSections(sectionsList);
        if (sectionsList.length > 0) {
          setSelectedSectionId(sectionsList[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load attendance:', err);
        setLoading(false);
      });
  }, []);

  const fetchSummary = (sectionId: string) => {
    if (!sectionId) return;
    setLoadingSummary(true);
    fetch(`/api/faculty/attendance?courseSectionId=${sectionId}`)
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setSummaryRecords(d.data || []);
        } else {
          console.error("Failed to load logs:", d.error);
        }
        setLoadingSummary(false);
      })
      .catch(err => {
        console.error("Error loading logs:", err);
        setLoadingSummary(false);
      });
  };

  useEffect(() => {
    if (selectedSectionId) {
      fetchSummary(selectedSectionId);
    }
  }, [selectedSectionId]);

  useEffect(() => {
    const activeSection = sections.find(s => s.id === selectedSectionId);
    if (activeSection) {
      const records: Record<string, { status: 'PRESENT' | 'ABSENT' | 'EXCUSED'; notes: string }> = {};
      activeSection.enrollments.forEach((e: any) => {
        records[e.student.id] = { status: 'PRESENT', notes: '' };
      });
      setAttendanceRecords(records);
    }
  }, [selectedSectionId, sections]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        status
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'PRESENT' }),
        notes
      }
    }));
  };

  const handleSubmitSession = async () => {
    if (!selectedSectionId) return;
    setSubmitting(true);

    const activeSection = sections.find(s => s.id === selectedSectionId);
    if (!activeSection) return;

    const recordsArray = activeSection.enrollments.map((e: any) => {
      const rec = attendanceRecords[e.student.id] || { status: 'PRESENT', notes: '' };
      return {
        studentId: e.student.id,
        status: rec.status,
        notes: rec.notes
      };
    });

    try {
      const res = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSectionId: selectedSectionId,
          date: selectedDate,
          records: recordsArray
        })
      });

      const d = await res.json();
      if (d.success) {
        showToast(`Successfully recorded attendance for ${recordsArray.length} student(s)!`, 'success');
        fetchSummary(selectedSectionId);
      } else {
        showToast(d.error || 'Failed to submit attendance.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while saving attendance.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute student stats
  const activeSection = sections.find(s => s.id === selectedSectionId);
  const studentStatsList = activeSection?.enrollments.map((e: any) => {
    const sId = e.student.id;
    const studentRecords = summaryRecords.filter((r: any) => r.studentId === sId);
    
    const total = studentRecords.length;
    const present = studentRecords.filter((r: any) => r.status === 'PRESENT').length;
    const absent = studentRecords.filter((r: any) => r.status === 'ABSENT').length;
    const excused = studentRecords.filter((r: any) => r.status === 'EXCUSED').length;
    
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;
    
    return {
      studentId: sId,
      name: `${e.student.user.firstName} ${e.student.user.lastName}`,
      total,
      present,
      absent,
      excused,
      rate
    };
  }) || [];

  return (
    <div className="pl-0 lg:pl-64 pt-14 lg:pt-0 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200">
      <SidebarNavigation role="FACULTY" />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}
      
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-red-500 rounded-3xl flex items-center justify-center text-5xl shadow-lg shadow-rose-500/30 text-white flex-shrink-0">
              📅
            </div>
            
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Tracking module</h1>
              <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl font-sans leading-relaxed">
                Rapidly record daily classroom presence, track absences, and visualize student attendance summaries.
              </p>
            </div>
          </div>
          
          {activeTab === 'RECORD' && selectedSectionId && (
            <div className="relative z-10">
              <button 
                onClick={handleSubmitSession}
                disabled={submitting}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Session Record'}
              </button>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-6">
          <button 
            onClick={() => setActiveTab('RECORD')}
            className={`pb-4 text-sm font-extrabold transition-all border-b-2 ${
              activeTab === 'RECORD' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            📝 Record Daily Attendance
          </button>
          <button 
            onClick={() => setActiveTab('LEDGER')}
            className={`pb-4 text-sm font-extrabold transition-all border-b-2 ${
              activeTab === 'LEDGER' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            📊 Attendance Summary Ledger
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="text-5xl mb-4 opacity-50">📋</div>
            <h3 className="text-xl font-bold text-slate-700">No Courses Assigned</h3>
            <p className="text-slate-500 mt-2">You currently have no course sections assigned for attendance tracking.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="px-8 py-6 bg-slate-50/80 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  {activeTab === 'RECORD' ? "Today's Class Roster" : "Roster Ledger Summary"}
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {activeTab === 'RECORD' && (
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                )}
                <select 
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.course.code} - {s.course.title} ({s.semester})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeTab === 'RECORD' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-xs">
                      <th className="p-6">Student Roster Identity</th>
                      <th className="p-6 text-center">Status Toggle Check</th>
                      <th className="p-6">Attendance Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeSection?.enrollments.map((e: any) => {
                      const studentId = e.student.id;
                      const record = attendanceRecords[studentId] || { status: 'PRESENT', notes: '' };
                      return (
                        <tr key={studentId} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500">
                                {e.student.user.firstName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">
                                  {e.student.user.firstName} {e.student.user.lastName}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                  ID: {studentId} | {activeSection.course.code}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-center gap-3">
                              <button 
                                onClick={() => handleStatusChange(studentId, 'PRESENT')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  record.status === 'PRESENT'
                                    ? 'bg-emerald-550 border-emerald-250 text-white bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/20'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                Present
                              </button>
                              <button 
                                onClick={() => handleStatusChange(studentId, 'ABSENT')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  record.status === 'ABSENT'
                                    ? 'bg-rose-550 border-rose-250 text-white bg-rose-500 border-rose-500 shadow-sm shadow-rose-500/20'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                Absent
                              </button>
                              <button 
                                onClick={() => handleStatusChange(studentId, 'EXCUSED')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  record.status === 'EXCUSED'
                                    ? 'bg-amber-550 border-amber-250 text-white bg-amber-500 border-amber-500 shadow-sm shadow-amber-500/20'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                Excused
                              </button>
                            </div>
                          </td>
                          <td className="p-6">
                            <input 
                              type="text"
                              value={record.notes}
                              onChange={(e) => handleNotesChange(studentId, e.target.value)}
                              placeholder="Reason if absent/excused..."
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-rose-500/50 outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {loadingSummary ? (
                  <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
                  </div>
                ) : studentStatsList.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-medium italic">
                    No students currently enrolled in this section.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-xs">
                        <th className="p-6">Student Candidate</th>
                        <th className="p-6 text-center">Sessions Logged</th>
                        <th className="p-6 text-center">Present</th>
                        <th className="p-6 text-center">Absent</th>
                        <th className="p-6 text-center">Excused</th>
                        <th className="p-6">Presence Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {studentStatsList.map((stats: any) => (
                        <tr key={stats.studentId} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-6">
                            <p className="font-extrabold text-slate-900">{stats.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {stats.studentId}</p>
                          </td>
                          <td className="p-6 text-center font-bold text-slate-700">{stats.total} Sessions</td>
                          <td className="p-6 text-center">
                            <span className="inline-block px-2.5 py-1 bg-emerald-550 text-white bg-emerald-500 font-bold text-xs rounded-lg">
                              {stats.present}
                            </span>
                          </td>
                          <td className="p-6 text-center">
                            <span className="inline-block px-2.5 py-1 bg-rose-550 text-white bg-rose-500 font-bold text-xs rounded-lg">
                              {stats.absent}
                            </span>
                          </td>
                          <td className="p-6 text-center">
                            <span className="inline-block px-2.5 py-1 bg-amber-550 text-white bg-amber-500 font-bold text-xs rounded-lg">
                              {stats.excused}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-slate-900 w-10 text-right">{stats.rate}%</span>
                              <div className="flex-1 min-w-[80px] bg-slate-100 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${stats.rate >= 90 ? 'bg-emerald-500' : stats.rate >= 75 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                                  style={{ width: `${stats.rate}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
