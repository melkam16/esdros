'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  title: string;
  code: string;
  credits: number;
  track: string;
  classId: string;
  class?: {
    name: string;
    department?: {
      name: string;
    };
  };
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  departmentId: string;
}

interface CourseAssignmentFormProps {
  courses: Course[];
}

interface CourseAssignment {
  id: string;
  courseTitle: string;
  courseCode: string;
  facultyName: string;
  faculty: Faculty;
  department: string;
  semester: string;
  room: string | null;
  capacity: number;
  currentEnrollment: number;
  enrollmentPercentage: number;
}

export default function CourseAssignmentForm({ courses }: CourseAssignmentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    facultyId: '',
    courseId: '',
    semester: `${new Date().getFullYear()}-${['Fall', 'Spring', 'Summer'][new Date().getMonth() > 8 ? 0 : new Date().getMonth() > 4 ? 1 : 2]}`,
    room: '',
    capacity: '40',
  });

  useEffect(() => {
    fetchFaculty();
    fetchAssignments();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await fetch('/api/admin/faculty/add');
      const data = await response.json();
      if (data.success) {
        setFaculty(
          data.data.map((f: any) => ({
            id: f.id,
            name: f.name,
            email: f.email,
            department: f.department,
            departmentId: f.departmentId,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/admin/faculty/assign-course');
      const data = await response.json();
      if (data.success) {
        setAssignments(data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.facultyId || !formData.courseId || !formData.semester) {
      setMessage({ type: 'error', text: 'Faculty, course, and semester are required' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/faculty/assign-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: formData.facultyId,
          courseId: formData.courseId,
          semester: formData.semester,
          room: formData.room || null,
          capacity: parseInt(formData.capacity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Course assigned successfully!' });
        setFormData({
          facultyId: '',
          courseId: '',
          semester: `${new Date().getFullYear()}-${['Fall', 'Spring', 'Summer'][new Date().getMonth() > 8 ? 0 : new Date().getMonth() > 4 ? 1 : 2]}`,
          room: '',
          capacity: '40',
        });
        await fetchAssignments();
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to assign course' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while assigning course' });
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssignment = async (sectionId: string) => {
    if (!confirm('Are you sure you want to remove this course assignment?')) return;

    try {
      const response = await fetch(`/api/admin/faculty/assign-course?sectionId=${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Assignment removed successfully' });
        await fetchAssignments();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to remove assignment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Course Assignment</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {isOpen ? 'Cancel' : '+ Assign Course to Faculty'}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Assign Course to Faculty</h3>

          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Faculty Member</label>
                <select
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a faculty member</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} - {f.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a course</option>
                  {/* Group courses by their affiliated department to enable cross-department assignment visibility */}
                  {Array.from(new Set(courses.map(c => c.class?.department?.name || 'Unassigned Department'))).map(deptName => (
                    <optgroup key={deptName} label={deptName}>
                      {courses.filter(c => (c.class?.department?.name || 'Unassigned Department') === deptName).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.title} ({c.credits} credits)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  placeholder="e.g., 2026-Fall"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Room (Optional)</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  placeholder="e.g., A101"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Class Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="40"
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Assigning Course...' : 'Assign Course'}
            </button>
          </form>
        </div>
      )}

      {/* Current Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Current Course Assignments</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Course</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Faculty</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Room</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Enrollment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No course assignments yet
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{assignment.courseCode}</p>
                        <p className="text-xs text-slate-500">{assignment.courseTitle}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{assignment.facultyName}</p>
                        <p className="text-xs text-slate-500">{assignment.department}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">{assignment.semester}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">{assignment.room || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${assignment.enrollmentPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-slate-700">
                          {assignment.currentEnrollment}/{assignment.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
