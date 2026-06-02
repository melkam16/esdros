'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: any;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  department?: Department;
}

interface Enrollment {
  id: string;
  enrollmentStatus: string;
}

interface Student {
  id: string;
  userId: string;
  user: User;
  status: string; // ACTIVE, INACTIVE, ON_LEAVE, GRADUATED, etc.
  track: string; // THEOLOGY, GEEZ_LANGUAGE
  classId: string;
  class: Class;
  enrollDate: any;
  phone?: string | null;
  bio?: string | null;
  pictureUrl?: string | null;
  enrollments: Enrollment[];
}

interface StudentDirectoryClientProps {
  initialStudents: Student[];
  departments: Department[];
  classes: Class[];
}

export default function StudentDirectoryClient({
  initialStudents,
  departments,
  classes,
}: StudentDirectoryClientProps) {
  const router = useRouter();

  // Primary State
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  // Default to currently enrolled students ('ACTIVE') as requested, but allow viewing others
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');

  // Display State
  const [activeTab, setActiveTab] = useState<'CATEGORIZED' | 'LIST'>('CATEGORIZED');

  // Onboard Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    track: 'THEOLOGY',
    classId: '',
  });
  const [addError, setAddError] = useState<string | null>(null);

  // Edit/Update Student Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    status: 'ACTIVE',
    track: 'THEOLOGY',
    classId: '',
  });
  const [editError, setEditError] = useState<string | null>(null);

  // Fetch logged in admin clearance level
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuperAdmin) setIsSuperAdmin(true);
      })
      .catch((err) => console.error('Failed to resolve clearance level:', err));
  }, []);

  // Sync state if initial data changes
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Handle Dynamic Filtering
  const filteredStudents = students.filter((student) => {
    // 1. Search Query (Name, Email, Student ID)
    const fullName = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Track Filter
    const trackMatch = selectedTrack === 'ALL' || student.track === selectedTrack;

    // 3. Department Filter
    const deptMatch =
      selectedDepartment === 'ALL' ||
      student.class.departmentId === selectedDepartment;

    // 4. Class Cohort Filter
    const classMatch = selectedClass === 'ALL' || student.classId === selectedClass;

    // 5. Status Filter
    const statusMatch = selectedStatus === 'ALL' || student.status === selectedStatus;

    return searchMatch && trackMatch && deptMatch && classMatch && statusMatch;
  });

  // Calculate Metrics based on unfiltered/initial datasets for global context
  const totalActive = students.filter((s) => s.status === 'ACTIVE').length;
  const totalTheo = students.filter((s) => s.track === 'THEOLOGY').length;
  const totalGeez = students.filter((s) => s.track === 'GEEZ_LANGUAGE').length;

  // Onboarding submit handler
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setIsLoading(true);

    if (!newStudent.classId) {
      setAddError('Please assign a Class Cohort.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to onboard student.');
      }

      // Success
      setIsAddModalOpen(false);
      // Reset form
      setNewStudent({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        track: 'THEOLOGY',
        classId: '',
      });
      // Refresh page data natively using router
      router.refresh();
    } catch (err: any) {
      setAddError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal & populate form
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditForm({
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      phone: student.phone || '',
      bio: student.bio || '',
      status: student.status,
      track: student.track,
      classId: student.classId,
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  // Manual update submit handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setIsLoading(true);

    if (!editingStudent) return;

    try {
      const res = await fetch('/api/admin/students/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: editingStudent.id,
          ...editForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update student details.');
      }

      setIsEditModalOpen(false);
      setEditingStudent(null);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete student record (Super Admin only)
  const handleDeleteStudent = async (studentId: string, name: string) => {
    const confirmDelete = window.confirm(
      `⚠️ CRITICAL ACTION WARNING ⚠️\n\nAre you absolutely sure you want to permanently delete student "${name}" (ID: ${studentId})?\n\nThis will instantly remove their user account, credentials, enrollments, invoices, assessments, grades, and attendance logs. This action CANNOT be undone.`
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/students/delete?studentId=${studentId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete student.');
      }

      alert('Student record successfully removed.');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error occurred during deletion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── METRICS GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Enrolled</h3>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalActive}</p>
          </div>
          <span className="text-xs text-slate-500 mt-2">Active academic profiles</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Theology Track</h3>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">{totalTheo}</p>
          </div>
          <span className="text-xs text-slate-500 mt-2">Matriculated theological cohort</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Geez Language</h3>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">{totalGeez}</p>
          </div>
          <span className="text-xs text-slate-500 mt-2">Matriculated language cohort</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Filtered Directory</h3>
            <p className="text-3xl font-extrabold text-slate-700 mt-2">{filteredStudents.length}</p>
          </div>
          <span className="text-xs text-slate-500 mt-2">Matching query constraints</span>
        </div>
      </div>

      {/* ── DIRECTORY CONTROL DECK ─────────────────────────────── */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          {/* Display Mode Toggle */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit">
            <button
              onClick={() => setActiveTab('CATEGORIZED')}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === 'CATEGORIZED'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🏛️ Department & Class Accordion
            </button>
            <button
              onClick={() => setActiveTab('LIST')}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === 'LIST'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📋 Flat Registry List
            </button>
          </div>

          {/* Action trigger */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition"
          >
            <span>➕</span>
            <span>Manually Onboard Student</span>
          </button>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Search Input</label>
            <input
              type="text"
              placeholder="Search by student name, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Academic Track</label>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm"
            >
              <option value="ALL">All Tracks</option>
              <option value="THEOLOGY">Theology</option>
              <option value="GEEZ_LANGUAGE">Geez Language</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Registration Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active (Enrolled)</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="GRADUATED">Graduated</option>
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── RENDER MODES ───────────────────────────────────────── */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm text-slate-500">
          <p className="text-lg font-medium">No student records match your filters.</p>
          <p className="text-xs text-slate-400 mt-2">Adjust search terms or reset filters above.</p>
        </div>
      ) : activeTab === 'CATEGORIZED' ? (
        /* Accordion mode grouped by Department and then Class Year */
        <div className="space-y-6">
          {departments.map((dept) => {
            const deptClasses = classes.filter((c) => c.departmentId === dept.id);
            const hasStudentsInDept = deptClasses.some((cls) =>
              filteredStudents.some((s) => s.classId === cls.id)
            );

            if (!hasStudentsInDept) return null;

            return (
              <div key={dept.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
                  <div>
                    <h2 className="text-lg font-bold">{dept.name}</h2>
                    <p className="text-xs text-slate-400">Department Code: {dept.code}</p>
                  </div>
                  <span className="bg-blue-600 text-xs px-2.5 py-1 rounded font-bold">
                    {filteredStudents.filter((s) => s.class.departmentId === dept.id).length} Students
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  {deptClasses.map((cls) => {
                    const cohortStudents = filteredStudents.filter((s) => s.classId === cls.id);
                    if (cohortStudents.length === 0) return null;

                    return (
                      <details
                        key={cls.id}
                        className="group border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden shadow-sm transition-all"
                        open
                      >
                        <summary className="flex justify-between items-center p-4 bg-slate-100 hover:bg-slate-200/80 cursor-pointer font-bold text-slate-800 list-none select-none">
                          <span className="flex items-center gap-2">
                            <span>🏫</span>
                            <span>Cohort: {cls.name} ({cls.code})</span>
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                              {cohortStudents.length} Students
                            </span>
                            <span className="text-slate-400 group-open:rotate-90 transition-transform duration-200">▶</span>
                          </div>
                        </summary>

                        <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cohortStudents.map((student) => (
                            <div
                              key={student.id}
                              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-bold text-slate-900">
                                      {student.user.firstName} {student.user.lastName}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-semibold">{student.id}</p>
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                      student.status === 'ACTIVE'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : student.status === 'ON_LEAVE'
                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                        : 'bg-slate-100 border-slate-300 text-slate-600'
                                    }`}
                                  >
                                    {student.status}
                                  </span>
                                </div>

                                <div className="mt-3 space-y-1 text-xs text-slate-600">
                                  <p className="truncate">📧 {student.user.email}</p>
                                  {student.phone && <p>📞 {student.phone}</p>}
                                  <p className="mt-2 text-[10px] bg-blue-50 text-blue-800 w-fit px-1.5 py-0.5 rounded font-bold font-mono">
                                    {student.track.replace('_', ' ')}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2 border-t border-slate-200">
                                <button
                                  onClick={() => handleOpenEdit(student)}
                                  className="flex-1 text-center py-1.5 bg-white text-slate-800 hover:bg-slate-100 border border-slate-300 text-xs font-bold rounded-lg transition"
                                >
                                  ✏️ Edit
                                </button>
                                {isSuperAdmin ? (
                                  <button
                                    onClick={() => handleDeleteStudent(student.id, `${student.user.firstName} ${student.user.lastName}`)}
                                    className="px-2 text-center py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs rounded-lg transition"
                                    title="Delete Student Permanent"
                                  >
                                    🗑️
                                  </button>
                                ) : (
                                  <span className="w-8" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tabular Flat List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Cohort / Class</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Track</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">
                      {student.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {student.user.firstName} {student.user.lastName}
                      </p>
                      {student.phone && <p className="text-xs text-slate-500">{student.phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.user.email}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{student.class.name}</p>
                      <p className="text-xs text-slate-400">{student.class.department?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-100 font-mono text-slate-700 px-2 py-1 rounded">
                        {student.track}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          student.status === 'ACTIVE'
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                            : student.status === 'ON_LEAVE'
                            ? 'bg-amber-100 border-amber-200 text-amber-800'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg hover:bg-blue-100 transition"
                        >
                          ✏️ Edit
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteStudent(student.id, `${student.user.firstName} ${student.user.lastName}`)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUALLY ONBOARD STUDENT ─────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Manually Onboard New Student</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
                  ⚠️ {addError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g. Abel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g. Tesfaye"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  placeholder="abel@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Track</label>
                  <select
                    value={newStudent.track}
                    onChange={(e) => setNewStudent({ ...newStudent, track: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="THEOLOGY">Theology</option>
                    <option value="GEEZ_LANGUAGE">Geez Language</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Class Cohort</label>
                  <select
                    required
                    value={newStudent.classId}
                    onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="">Select Cohort...</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg text-sm shadow-md transition"
                >
                  {isLoading ? 'Onboarding...' : 'Onboard Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUALLY EDIT/UPDATE STUDENT ─────────────────── */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Manual Record Edit</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Modifying ID: {editingStudent.id}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
                  ⚠️ {editError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g. +1 555-0199"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Brief Biography (Optional)</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 h-16 resize-none"
                  placeholder="Profile bio notes..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                    <option value="GRADUATED">GRADUATED</option>
                    <option value="WITHDRAWN">WITHDRAWN</option>
                    <option value="DISMISSED">DISMISSED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Track</label>
                  <select
                    value={editForm.track}
                    onChange={(e) => setEditForm({ ...editForm, track: e.target.value })}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="THEOLOGY">THEOLOGY</option>
                    <option value="GEEZ_LANGUAGE">GEEZ_LANGUAGE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Cohort Class</label>
                  <select
                    value={editForm.classId}
                    onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg text-sm shadow-md transition"
                >
                  {isLoading ? 'Saving...' : 'Save Manual Overrides'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
