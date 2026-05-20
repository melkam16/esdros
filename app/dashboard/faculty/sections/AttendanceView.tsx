'use client';
// app/dashboard/faculty/sections/AttendanceView.tsx
import { useState, useEffect, useCallback } from 'react';

interface Section {
  id: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  room: string | null;
  capacity: number;
  enrolledCount: number;
}

interface EnrolledStudent {
  studentId: string;
  studentName: string;
}

type AttendanceStatusValue = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export default function AttendanceView() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatusValue>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch this faculty's sections from the submit-grade portal (already used)
  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal')
      .then((r) => r.json())
      .then((d) => {
        const sects: Section[] = (d.sections || d.classes || []).map((s: any) => ({
          id: s.id,
          courseCode: s.course?.code || s.courseCode || '',
          courseTitle: s.course?.title || s.courseTitle || s.name || '',
          semester: s.semester || '',
          room: s.room || null,
          capacity: s.capacity || 0,
          enrolledCount: s._count?.enrollments || s.enrolledCount || 0,
        }));
        setSections(sects);
        if (sects.length > 0) setSelectedSection(sects[0].id);
      })
      .catch(() => {});
  }, []);

  // Fetch enrolled students when section changes
  const fetchStudents = useCallback(async (sectionId: string) => {
    if (!sectionId) return;
    setFetchingStudents(true);
    try {
      const res = await fetch(`/api/faculty/attendance?courseSectionId=${sectionId}&date=${date}`);
      const data = await res.json();

      // Also fetch the section's enrolled students list
      const sectRes = await fetch(`/api/faculty/submit-grade/portal?sectionId=${sectionId}`);
      const sectData = await sectRes.json();

      const enrolledStudents: EnrolledStudent[] = (sectData.students || []).map((s: any) => ({
        studentId: s.studentId || s.id,
        studentName: s.studentName || `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
      }));

      setStudents(enrolledStudents);

      // Pre-populate with existing records for this date
      const existingRecords: Record<string, AttendanceStatusValue> = {};
      const existingNotes: Record<string, string> = {};
      (data.data || []).forEach((r: any) => {
        existingRecords[r.studentId] = r.status;
        if (r.notes) existingNotes[r.studentId] = r.notes;
      });

      // Default unset students to PRESENT
      enrolledStudents.forEach((s) => {
        if (!existingRecords[s.studentId]) existingRecords[s.studentId] = 'PRESENT';
      });

      setRecords(existingRecords);
      setNotes(existingNotes);
    } catch {
      // no-op
    } finally {
      setFetchingStudents(false);
    }
  }, [date]);

  useEffect(() => {
    if (selectedSection) fetchStudents(selectedSection);
  }, [selectedSection, date, fetchStudents]);

  const setStatus = (studentId: string, status: AttendanceStatusValue) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatusValue) => {
    const bulk: Record<string, AttendanceStatusValue> = {};
    students.forEach((s) => (bulk[s.studentId] = status));
    setRecords(bulk);
  };

  const submitAttendance = async () => {
    if (!selectedSection || students.length === 0) return;
    setLoading(true);
    try {
      const attendanceRecords = students.map((s) => ({
        studentId: s.studentId,
        status: records[s.studentId] || 'PRESENT',
        notes: notes[s.studentId] || undefined,
      }));

      const res = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSectionId: selectedSection,
          date,
          records: attendanceRecords,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to save', 'error'); return; }
      showToast(data.message, 'success');
    } catch {
      showToast('Network error. Please retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedSect = sections.find((s) => s.id === selectedSection);
  const presentCount = Object.values(records).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(records).filter((s) => s === 'ABSENT').length;
  const excusedCount = Object.values(records).filter((s) => s === 'EXCUSED').length;

  const STATUS_STYLES: Record<AttendanceStatusValue, { active: string; inactive: string }> = {
    PRESENT: {
      active: 'bg-emerald-500 text-white shadow-sm',
      inactive: 'text-slate-400 hover:bg-slate-100',
    },
    ABSENT: {
      active: 'bg-red-500 text-white shadow-sm',
      inactive: 'text-slate-400 hover:bg-slate-100',
    },
    EXCUSED: {
      active: 'bg-amber-500 text-white shadow-sm',
      inactive: 'text-slate-400 hover:bg-slate-100',
    },
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Daily Attendance Roll-Call</h3>
          <p className="text-xs text-slate-400 mt-0.5">Mark student attendance for your course sections.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Course Section</label>
            <select
              id="attendance-section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {sections.length === 0 && <option>No sections assigned</option>}
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.courseCode} — {s.courseTitle} ({s.semester})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Date</label>
            <input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Summary pills */}
        {students.length > 0 && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-slate-500">Quick mark:</span>
            <button onClick={() => markAll('PRESENT')} className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full hover:bg-emerald-200 transition">All Present</button>
            <button onClick={() => markAll('ABSENT')} className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition">All Absent</button>
            <div className="ml-auto flex items-center gap-3 text-xs font-semibold">
              <span className="text-emerald-600">{presentCount} Present</span>
              <span className="text-red-600">{absentCount} Absent</span>
              <span className="text-amber-600">{excusedCount} Excused</span>
            </div>
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {fetchingStudents ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm italic">
            {selectedSection ? 'No approved enrollments for this section yet.' : 'Select a section to begin.'}
          </div>
        ) : (
          <>
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {selectedSect?.courseTitle} · {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
              </span>
              <span className="text-xs text-slate-400">{students.length} students</span>
            </div>
            <div className="divide-y divide-slate-100">
              {students.map((s, i) => {
                const status = records[s.studentId] || 'PRESENT';
                return (
                  <div key={s.studentId} className="px-6 py-3.5 flex items-center gap-4">
                    <span className="text-xs text-slate-400 w-5 text-right">{i + 1}.</span>
                    <p className="flex-1 text-sm font-semibold text-slate-900">{s.studentName}</p>
                    {/* Status toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                      {(['PRESENT', 'ABSENT', 'EXCUSED'] as AttendanceStatusValue[]).map((opt) => (
                        <button
                          key={opt}
                          id={`att-${s.studentId}-${opt}`}
                          onClick={() => setStatus(s.studentId, opt)}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${status === opt ? STATUS_STYLES[opt].active : STATUS_STYLES[opt].inactive}`}
                        >
                          {opt === 'PRESENT' ? 'P' : opt === 'ABSENT' ? 'A' : 'E'}
                        </button>
                      ))}
                    </div>
                    {/* Notes input */}
                    <input
                      placeholder="Note..."
                      value={notes[s.studentId] || ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [s.studentId]: e.target.value }))}
                      className="w-32 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-slate-600 placeholder-slate-300"
                    />
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                id="submit-attendance"
                onClick={submitAttendance}
                disabled={loading}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Saving...' : '✓ Commit Attendance'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}