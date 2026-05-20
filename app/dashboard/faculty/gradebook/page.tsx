'use client';
import { useState, useEffect } from 'react';
import SidebarNavigation from '../../../components/SidebarNavigation';

const PREDEFINED_COLUMNS = ['Quiz', 'Midterm', 'Final', 'Assignment', 'Project'];

export default function GradebookPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseMapping, setCourseMapping] = useState<Record<string, string>>({});
  const [gradingScales, setGradingScales] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);

  // Gradebook Columns State
  const defaultColumns = [
    { name: 'Quiz', weight: 20 },
    { name: 'Midterm', weight: 30 },
    { name: 'Final', weight: 50 },
  ];
  
  const [allCourseColumns, setAllCourseColumns] = useState<Record<string, {name: string, weight: number}[]>>({});
  const [isManagingColumns, setIsManagingColumns] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get active columns for the selected course
  const columns = selectedCourse && allCourseColumns[selectedCourse] ? allCourseColumns[selectedCourse] : defaultColumns;

  // Grades State
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>({});
  const [isGradesInitialized, setIsGradesInitialized] = useState(false);

  // Load saved columns and grades on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCols = localStorage.getItem('esdros_gradebook_columns_map');
      if (savedCols) {
        try { setAllCourseColumns(JSON.parse(savedCols)); } catch (e) { console.error("Failed to parse saved columns", e); }
      }
      setIsInitialized(true);

      const savedGrades = localStorage.getItem('esdros_gradebook_values');
      if (savedGrades) {
        try { setGrades(JSON.parse(savedGrades)); } catch(e) { console.error("Failed to parse saved grades", e); }
      }
      setIsGradesInitialized(true);
    }
  }, []);

  // Save columns to local storage whenever they change AFTER initialization
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('esdros_gradebook_columns_map', JSON.stringify(allCourseColumns));
    }
  }, [allCourseColumns, isInitialized]);

  // Save grades to local storage
  useEffect(() => {
    if (isGradesInitialized && typeof window !== 'undefined') {
      localStorage.setItem('esdros_gradebook_values', JSON.stringify(grades));
    }
  }, [grades, isGradesInitialized]);

  useEffect(() => {
    fetch('/api/faculty/submit-grade/portal?section=Gradebook')
      .then(res => res.json())
      .then(d => {
        const studentList = d.students || [];
        setStudents(studentList);
        const uniqueCourses = Array.from(new Set(studentList.map((s: any) => s.courseName))).filter(Boolean) as string[];
        setCourses(uniqueCourses);
        if (uniqueCourses.length > 0) {
          setSelectedCourse(uniqueCourses[0]);
        }
        
        const mapping: Record<string, string> = {};
        if (d.courses) {
          d.courses.forEach((c: any) => {
            mapping[c.title] = c.id;
          });
        }
        setCourseMapping(mapping);
        
        // Fetch Admin configured grading scales
        fetch('/api/admin/grading-scale')
          .then(res => res.json())
          .then(scales => setGradingScales(scales))
          .catch(e => console.error("Failed to load grading scales", e));
        
        // Initialize existing grades from DB into state if not already in localStorage
        setGrades(prev => {
          const newGrades = { ...prev };
          studentList.forEach((s: any) => {
            if (s.grade && !newGrades[s.enrollmentId]) {
              // If we have a DB grade but no local data, we just distribute it so Total equals the DB grade roughly
              // Or better yet, we just let calculateTotal handle it. We won't spoof local grades.
            }
          });
          return newGrades;
        });

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load gradebook:', err);
        setLoading(false);
      });
  }, []);

  const filteredStudents = selectedCourse
    ? students.filter(s => s.courseName === selectedCourse)
    : [];

  const totalWeight = columns.reduce((acc, col) => acc + col.weight, 0);

  const updateCourseColumns = (newCols: {name: string, weight: number}[]) => {
    setAllCourseColumns(prev => ({ ...prev, [selectedCourse]: newCols }));
  };

  const handleAddColumn = (colName: string) => {
    if (columns.find(c => c.name === colName)) return;
    updateCourseColumns([...columns, { name: colName, weight: 0 }]);
  };

  const handleRemoveColumn = (colName: string) => {
    updateCourseColumns(columns.filter(c => c.name !== colName));
  };

  const handleUpdateWeight = (colName: string, newWeight: string) => {
    const val = parseInt(newWeight) || 0;
    updateCourseColumns(columns.map(c => c.name === colName ? { ...c, weight: val } : c));
  };

  const handleGradeChange = (enrollmentId: string, colName: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [enrollmentId]: {
        ...(prev[enrollmentId] || {}),
        [colName]: value
      }
    }));
  };

  const calculateTotal = (enrollmentId: string, dbGrade: number | null) => {
    const studentGrades = grades[enrollmentId];
    if (!studentGrades && dbGrade !== null) {
      return dbGrade.toFixed(1); // fallback to db if no local changes
    }
    
    let total = 0;
    columns.forEach(col => {
      const val = parseFloat(studentGrades?.[col.name] || '0');
      if (!isNaN(val)) {
        total += val;
      }
    });
    return total.toFixed(1);
  };

  const getLetter = (scoreStr: string) => {
    const score = parseFloat(scoreStr);
    if (isNaN(score) || score === 0) return '-';
    
    // Fallback to default scale
    let scale: Record<string, number> = {
      'A+': 97, 'A': 93, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80, 'C+': 77, 'C': 73, 'C-': 70, 'D': 60
    };

    // Use admin-configured scale for this specific course if available
    const courseId = courseMapping[selectedCourse];
    if (courseId && gradingScales[courseId]) {
      scale = gradingScales[courseId];
    }

    // Sort grades by threshold descending to find the highest matching letter
    const sortedGrades = Object.entries(scale).sort((a, b) => b[1] - a[1]);
    for (const [letter, threshold] of sortedGrades) {
      if (score >= threshold) return letter;
    }
    
    return 'F';
  };

  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const handleSave = async (enrollmentId: string, total: string) => {
    setSavingId(enrollmentId);
    try {
      const numericTotal = parseFloat(total) || 0;
      await fetch('/api/faculty/submit-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, mark: numericTotal })
      });
      setSavedSuccessId(enrollmentId);
      setTimeout(() => setSavedSuccessId(null), 2000);
    } catch(e) {
      console.error(e);
    }
    setSavingId(null);
  };

  return (
    <div className="pl-64 min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-200">
      <SidebarNavigation role="FACULTY" />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden flex items-center gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center text-5xl shadow-lg shadow-amber-500/30 text-white flex-shrink-0">
            📈
          </div>
          
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Evaluations Ledger Matrix</h1>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
              Input and track cumulative course grading checkpoints. Configure column structures and manage weights.
            </p>
          </div>
          
          <div className="relative z-10 hidden md:flex items-center gap-4">
            <button 
              onClick={() => setIsManagingColumns(!isManagingColumns)}
              className={`px-6 py-3 font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 border ${
                isManagingColumns 
                  ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-100' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              ⚙️ Manage Columns
            </button>
            <button className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
              Publish All Grades
            </button>
          </div>
        </div>

        {isManagingColumns && (
          <div className="bg-white rounded-3xl p-8 border border-amber-100 shadow-xl shadow-amber-500/10 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-slate-800">Gradebook Structure Configuration</h2>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${totalWeight > 100 ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : totalWeight === 100 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                Total Weight: {totalWeight}% {totalWeight > 100 && '(Exceeds 100%)'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Active Columns</h3>
                <div className="space-y-3">
                  {columns.map(col => (
                    <div key={col.name} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-700">{col.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={col.weight} 
                            onChange={(e) => handleUpdateWeight(col.name, e.target.value)}
                            className="w-16 px-2 py-1 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                          />
                          <span className="text-slate-500 text-sm font-medium">%</span>
                        </div>
                        <button onClick={() => handleRemoveColumn(col.name)} className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Available Predefined Columns</h3>
                <div className="flex flex-wrap gap-3">
                  {PREDEFINED_COLUMNS.filter(pc => !columns.find(c => c.name === pc)).map(pc => (
                    <button 
                      key={pc}
                      onClick={() => handleAddColumn(pc)}
                      className="px-4 py-2 bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 rounded-xl text-sm font-bold text-slate-600 transition-colors flex items-center gap-2"
                    >
                      + {pc}
                    </button>
                  ))}
                  {PREDEFINED_COLUMNS.filter(pc => !columns.find(c => c.name === pc)).length === 0 && (
                    <p className="text-sm text-slate-400 italic p-2">All predefined columns are active.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="text-5xl mb-4 opacity-50">📋</div>
            <h3 className="text-xl font-bold text-slate-700">No Students Found</h3>
            <p className="text-slate-500 mt-2">There are currently no students enrolled in the selected criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="px-8 py-6 bg-slate-50/80 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h2 className="text-lg font-extrabold text-slate-800">Student Roster Grading</h2>
              
              <div className="flex items-center gap-4">
                <select 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {courses.length === 0 && <option value="">No Courses Assigned</option>}
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-500">
                  {filteredStudents.length} Students
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="p-6">Student Candidate</th>
                    {columns.map(col => (
                      <th key={col.name} className="p-6 text-center">
                        {col.name} <span className="block text-[10px] opacity-70 mt-0.5">({col.weight}%)</span>
                      </th>
                    ))}
                    <th className="p-6 text-center bg-slate-50 border-l border-slate-200">Total Score</th>
                    <th className="p-6 text-center bg-slate-50">Final Grade</th>
                    <th className="p-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((s: any) => {
                    const total = calculateTotal(s.enrollmentId, s.grade);
                    const letter = getLetter(total);
                    return (
                      <tr key={s.id + s.courseCode} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500">
                              {s.name ? s.name.charAt(0) : 'S'}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{s.name || 'Unknown Student'}</p>
                              <p className="text-xs text-slate-400 mt-0.5">ID: {s.id.substring(0, 8)} | {s.courseCode}</p>
                            </div>
                          </div>
                        </td>
                        {columns.map(col => (
                          <td key={col.name} className="p-6">
                            <input 
                              type="number" 
                              value={grades[s.enrollmentId]?.[col.name] || ''}
                              onChange={(e) => handleGradeChange(s.enrollmentId, col.name, e.target.value)}
                              className="w-20 p-2 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all mx-auto block bg-white" 
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td className="p-6 text-center bg-slate-50/50 border-l border-slate-100">
                          <span className={`font-mono font-bold ${parseFloat(total) > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {parseFloat(total) > 0 ? total : '--'}%
                          </span>
                        </td>
                        <td className="p-6 text-center bg-slate-50/50">
                          <span className={`inline-block px-3 py-1 rounded-lg font-black text-sm ${
                            letter === 'A+' || letter === 'A' ? 'bg-emerald-100 text-emerald-700' :
                            letter.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                            letter.startsWith('C') ? 'bg-amber-100 text-amber-700' :
                            letter.startsWith('D') || letter === 'F' ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {letter}
                          </span>
                        </td>
                        <td className="p-6 text-center">
                          <button 
                            onClick={() => handleSave(s.enrollmentId, total)}
                            disabled={savingId === s.enrollmentId}
                            className={`px-4 py-1.5 font-bold text-xs rounded-lg transition-colors shadow-sm ${
                              savedSuccessId === s.enrollmentId 
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                : savingId === s.enrollmentId
                                  ? 'bg-slate-200 text-slate-500 cursor-wait'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-amber-300 hover:text-amber-600'
                            }`}
                          >
                            {savedSuccessId === s.enrollmentId ? '✓ Saved' : savingId === s.enrollmentId ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
