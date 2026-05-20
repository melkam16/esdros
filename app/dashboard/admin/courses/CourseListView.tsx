'use client';

import { useState } from 'react';

interface Course {
  id: string;
  title: string;
  code: string;
  credits: number;
  track: string;
  sections: Section[];
}

interface Section {
  id: string;
  semester: string;
  room: string | null;
  capacity: number;
  enrollments: any[];
  faculty: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface CourseListViewProps {
  courses: Course[];
}

export default function CourseListView({ courses }: CourseListViewProps) {
  const [filterTrack, setFilterTrack] = useState<string | 'ALL'>('ALL');
  const [filterSemester, setFilterSemester] = useState<string | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all unique semesters
  const uniqueSemesters = Array.from(new Set(
    courses.flatMap(c => c.sections.map(s => s.semester))
  )).filter(Boolean);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = filterTrack === 'ALL' || course.track === filterTrack;
    
    const matchesSemester = filterSemester === 'ALL' || 
                            course.sections.some(s => s.semester === filterSemester);

    return matchesSearch && matchesTrack && matchesSemester;
  });

  const [gradingScaleModalCourse, setGradingScaleModalCourse] = useState<Course | null>(null);
  const [gradingScale, setGradingScale] = useState<Record<string, number>>({
    'A+': 97, 'A': 93, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80, 'C+': 77, 'C': 73, 'C-': 70, 'D': 60
  });

  const openGradingModal = async (course: Course) => {
    setGradingScaleModalCourse(course);
    try {
      const res = await fetch('/api/admin/grading-scale');
      const data = await res.json();
      if (data[course.id]) {
        setGradingScale(data[course.id]);
      } else {
        setGradingScale({ 'A+': 97, 'A': 93, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80, 'C+': 77, 'C': 73, 'C-': 70, 'D': 60 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveGradingScale = async () => {
    if (!gradingScaleModalCourse) return;
    try {
      await fetch('/api/admin/grading-scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: gradingScaleModalCourse.id, scale: gradingScale })
      });
      setGradingScaleModalCourse(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Course Catalog</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
            {courses.length} Courses
          </span>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value as string)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Tracks</option>
            <option value="THEOLOGY">Theology</option>
            <option value="GEEZ_LANGUAGE">Geez Language</option>
          </select>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value as string)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Semesters</option>
            {uniqueSemesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <p>
            {searchTerm || filterTrack !== 'ALL'
              ? 'No courses match your criteria'
              : 'No courses found'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Course</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Track</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Sections</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Faculty Assigned</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Total Enrollment</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCourses.map((course) => {
                const totalEnrollment = course.sections.reduce(
                  (acc, s) => acc + s.enrollments.length,
                  0
                );

                return (
                  <tr key={course.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{course.code}</p>
                        <p className="text-xs text-slate-500">{course.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.track === 'THEOLOGY'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {course.track === 'THEOLOGY' ? 'Theology' : 'Geez Language'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{course.credits}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {course.sections.length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {course.sections.length === 0 ? (
                          <p className="text-sm text-slate-500 italic">Not assigned</p>
                        ) : (
                          <div className="space-y-1">
                            {course.sections.map((section) => (
                              <div key={section.id} className="text-xs">
                                <p className="text-slate-700">
                                  {section.faculty.user.firstName} {section.faculty.user.lastName}
                                </p>
                                <p className="text-slate-500">{section.semester}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                course.sections.length > 0
                                  ? Math.min(
                                      (totalEnrollment /
                                        (course.sections.reduce((acc, s) => acc + s.capacity, 0) || 1)) *
                                        100,
                                      100
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-slate-700 w-12">
                          {totalEnrollment}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => openGradingModal(course)}
                        className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded hover:bg-amber-100 transition border border-amber-200"
                      >
                        Grading Scale
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Grading Scale Modal */}
      {gradingScaleModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Grading Scale Config</h3>
            <p className="text-sm text-slate-500 mb-6">Set minimum score thresholds for {gradingScaleModalCourse.title} ({gradingScaleModalCourse.code}).</p>
            
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'].map(grade => (
                <div key={grade} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-black text-slate-700 w-8">{grade}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">&ge;</span>
                    <input 
                      type="number" 
                      value={gradingScale[grade]}
                      onChange={(e) => setGradingScale({...gradingScale, [grade]: parseFloat(e.target.value) || 0})}
                      className="w-16 px-2 py-1 text-sm border border-slate-300 rounded font-bold text-slate-800 text-center"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setGradingScaleModalCourse(null)}
                className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={saveGradingScale}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition"
              >
                Save Scale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
