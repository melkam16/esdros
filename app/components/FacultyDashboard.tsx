'use client';
import { useState } from 'react';

interface CourseSubject {
  id: string;
  title: string;
  code: string;
  track: string;
}

interface MockStudent {
  id: string;
  name: string;
  email: string;
  attendanceRate: number;
  currentGrade: string;
}

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState('TH-D1');
  const [activeTab, setActiveTab] = useState<'roster' | 'gradebook' | 'attendance'>('roster');
  
  // Simulated operational state context matching your academic structures
  const activeClasses = [
    { id: 'c1', code: 'TH-D1', name: 'Year 1 Degree - Theology' },
    { id: 'c2', code: 'GZ-A2', name: 'Advanced Geez Language Cohort' }
  ];

  const assignedSubjects: CourseSubject[] = [
    { id: 's1', title: 'Geez Syntax & Morphology', code: 'GZ102', track: 'GEEZ_LANGUAGE' },
    { id: 's2', title: 'Dogmatic Theology Basics', code: 'TH201', track: 'THEOLOGY' }
  ];

  const studentsList: MockStudent[] = [
    { id: 'st1', name: 'Dawit Mekonnen', email: 'dawit@academy.edu', attendanceRate: 96, currentGrade: 'A-' },
    { id: 'st2', name: 'Eleni Tesfaye', email: 'eleni@academy.edu', attendanceRate: 92, currentGrade: 'B+' },
    { id: 'st3', name: 'Yared Alemu', email: 'yared@academy.edu', attendanceRate: 88, currentGrade: 'B-' },
    { id: 'st4', name: 'Martha Yohannes', email: 'martha@academy.edu', attendanceRate: 100, currentGrade: 'A+' }
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Control Header Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Instructor Workspace Terminal</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage course grade vectors, attendance logs, and curriculum tracks.</p>
        </div>
        
        {/* Quick Cohort Select Dropdown Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Group:</span>
          <select 
            className="p-2 border rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {activeClasses.map(c => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Metric Mini-Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Assigned Classes</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{activeClasses.length} Programs</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Active Roster Count</span>
          <span className="text-2xl font-black text-indigo-600 block mt-1">{studentsList.length} Registered</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Cohort Average Attendance</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">94.0%</span>
        </div>
      </div>

      {/* Main Workspace Workspace Module Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Interface Tabs */}
        <div className="bg-slate-50 border-b flex px-2 pt-2 gap-1">
          <button 
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
              activeTab === 'roster' ? 'bg-white text-slate-900 border-t border-x border-slate-200/80 shadow-sm' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            📋 Student Roster
          </button>
          <button 
            onClick={() => setActiveTab('gradebook')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
              activeTab === 'gradebook' ? 'bg-white text-slate-900 border-t border-x border-slate-200/80 shadow-sm' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            📝 Continuous Gradebook
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
              activeTab === 'attendance' ? 'bg-white text-slate-900 border-t border-x border-slate-200/80 shadow-sm' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            📅 Attendance Tracker
          </button>
        </div>

        {/* Dynamic Workspace Content Routing Rendering Blocks */}
        <div className="p-6">
          {/* Module 1: Student Roster View */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Enrolled Students Pool ({selectedClass})</h3>
                <button className="text-[11px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition">Export Roster Sheets</button>
              </div>
              <div className="border rounded-lg overflow-hidden divide-y bg-slate-50/30">
                {studentsList.map((student) => (
                  <div key={student.id} className="p-4 flex items-center justify-between bg-white text-sm">
                    <div>
                      <p className="font-bold text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{student.email}</p>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Attendance Rate</span>
                        <span className="font-bold text-slate-700">{student.attendanceRate}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Standings</span>
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 border border-indigo-100 rounded text-xs">{student.currentGrade}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 2: Continuous Assessment Gradebook Matrix Sheet */}
          {activeTab === 'gradebook' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Evaluations Ledger Matrix</h3>
                  <p className="text-[11px] text-slate-400">Directly sync midterms, finals, or homework points to the tracking ledger.</p>
                </div>
                <div className="flex gap-2">
                  <select className="p-1.5 border rounded text-xs bg-white text-slate-600 font-medium">
                    {assignedSubjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.title}</option>)}
                  </select>
                  <button className="text-[11px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition">+ Add Evaluation Column</button>
                </div>
              </div>

              {/* Spread-grid Gradebook Panel Layout */}
              <div className="border rounded-lg overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3 font-semibold">Student Name</th>
                      <th className="p-3 font-semibold">Quiz 1 (10 pts)</th>
                      <th className="p-3 font-semibold">Midterm (40 pts)</th>
                      <th className="p-3 font-semibold">Final Project (50 pts)</th>
                      <th className="p-3 font-semibold text-center">Calculated Aggregate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium text-slate-700">
                    {studentsList.map((student, index) => (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{student.name}</td>
                        <td className="p-3"><input type="number" defaultValue={index === 0 ? 9 : 8} className="w-16 p-1 border rounded font-mono text-center" /></td>
                        <td className="p-3"><input type="number" defaultValue={index % 2 === 0 ? 36 : 32} className="w-16 p-1 border rounded font-mono text-center" /></td>
                        <td className="p-3"><input type="number" defaultValue={index === 3 ? 48 : 42} className="w-16 p-1 border rounded font-mono text-center" /></td>
                        <td className="p-3 text-center"><span className="font-mono font-bold text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{student.currentGrade}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end pt-2">
                <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-800 transition shadow-sm">Save Transaction Changes</button>
              </div>
            </div>
          )}

          {/* Module 3: Attendance Roll-Call Session Sheets */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Daily Session Roll-Call Ledger</h3>
                  <p className="text-[11px] text-slate-400">Date Context: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded">Session Open</span>
              </div>

              <div className="border rounded-lg overflow-hidden divide-y">
                {studentsList.map((student) => (
                  <div key={student.id} className="p-3.5 flex items-center justify-between bg-white text-xs font-medium">
                    <span className="font-bold text-slate-800 text-sm">{student.name}</span>
                    
                    {/* Toggle Group Selection Matrix */}
                    <div className="flex border rounded-lg overflow-hidden bg-slate-100 p-0.5 gap-0.5">
                      <button className="px-3 py-1 rounded-md text-[11px] font-black uppercase bg-emerald-500 text-white shadow-sm transition">Present</button>
                      <button className="px-3 py-1 rounded-md text-[11px] font-bold uppercase text-slate-400 hover:text-slate-600 transition">Absent</button>
                      <button className="px-3 py-1 rounded-md text-[11px] font-bold uppercase text-slate-400 hover:text-slate-600 transition">Excused</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}