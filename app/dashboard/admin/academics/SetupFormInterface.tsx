'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EntityProps {
  departments: any[];
  classes: any[];
}

export default function SetupFormInterface({ departments, classes }: EntityProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form Field Tracking Context Vectors
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');

  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectCredits, setSubjectCredits] = useState('3');
  const [targetClassId, setTargetClassId] = useState('');
  const [subjectTrack, setSubjectTrack] = useState('THEOLOGY'); // State tracking for Prisma field constraint

  // Edit State Tracking
  const [editDeptId, setEditDeptId] = useState<string | null>(null);
  const [editClassId, setEditClassId] = useState<string | null>(null);
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);

  // Dynamic Excel Template Generator (dynamic client-side XLSX generation)
  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      
      const departmentsData = [
        { "Code": "THEO", "Name": "Department of Theology", "Description": "Advanced Orthodox Theology and Seminary Studies" },
        { "Code": "GEEZ", "Name": "Department of Geez Language", "Description": "Traditional Geez Grammar, Syntax, and Poetry Studies" }
      ];
      
      const classesData = [
        { "Code": "TH-Y1", "Name": "Theology Cohort Year 1", "DepartmentCode": "THEO" },
        { "Code": "TH-Y2", "Name": "Theology Cohort Year 2", "DepartmentCode": "THEO" },
        { "Code": "GZ-Y1", "Name": "Geez Language Year 1", "DepartmentCode": "GEEZ" }
      ];
      
      const coursesData = [
        { "Code": "TH-101", "Title": "Dogmatic Theology I", "Description": "Introduction to Orthodox dogmatic theological principles", "Credits": 3, "Track": "THEOLOGY", "ClassCode": "TH-Y1" },
        { "Code": "TH-102", "Title": "Dogmatic Theology II", "Description": "Continuation of dogmatic theological studies", "Credits": 3, "Track": "THEOLOGY", "ClassCode": "TH-Y1" },
        { "Code": "GZ-101", "Title": "Geez Grammar I", "Description": "Introduction to traditional Geez language grammar rules", "Credits": 3, "Track": "GEEZ_LANGUAGE", "ClassCode": "GZ-Y1" }
      ];
      
      const workbook = XLSX.utils.book_new();
      
      const deptWorksheet = XLSX.utils.json_to_sheet(departmentsData);
      XLSX.utils.book_append_sheet(workbook, deptWorksheet, "Departments");
      
      const classWorksheet = XLSX.utils.json_to_sheet(classesData);
      XLSX.utils.book_append_sheet(workbook, classWorksheet, "Classes");
      
      const courseWorksheet = XLSX.utils.json_to_sheet(coursesData);
      XLSX.utils.book_append_sheet(workbook, courseWorksheet, "Courses");
      
      XLSX.writeFile(workbook, "academic_structure_template.xlsx");
    } catch (err: any) {
      alert(`Failed to export template: ${err.message}`);
    }
  };

  // Client-Side Excel Spreadsheet Parser & API poster
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          const departmentsSheet = workbook.Sheets['Departments'];
          const classesSheet = workbook.Sheets['Classes'];
          const coursesSheet = workbook.Sheets['Courses'];
          
          if (!departmentsSheet && !classesSheet && !coursesSheet) {
            alert("Invalid Template Format: Spreadsheet must contain tabs named 'Departments', 'Classes', or 'Courses'.");
            setLoading(false);
            return;
          }
          
          const departments = departmentsSheet ? XLSX.utils.sheet_to_json(departmentsSheet) : [];
          const classes = classesSheet ? XLSX.utils.sheet_to_json(classesSheet) : [];
          const courses = coursesSheet ? XLSX.utils.sheet_to_json(coursesSheet) : [];
          
          const response = await fetch('/api/admin/academics/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ departments, classes, courses })
          });
          
          const result = await response.json();
          
          if (result.success) {
            alert(`Excel Import Success!\n\nSuccessfully matched and imported:\n• ${result.departmentsCount} Departments\n• ${result.classesCount} Class Cohorts\n• ${result.coursesCount} Subjects / Courses.`);
            router.refresh();
          } else {
            alert(`Import Failed: ${result.error}`);
          }
        } catch (error: any) {
          alert(`Error parsing Excel workbook data: ${error.message}`);
        } finally {
          setLoading(false);
          e.target.value = '';
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      alert(`Library initialization error: ${err.message}`);
      setLoading(false);
    }
  };

  // Client-Side Excel Course-Only Spreadsheet Parser
  const handleImportCoursesOnly = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Try to resolve sheet: 'Courses' or first sheet
          const sheetName = workbook.SheetNames.includes('Courses') 
            ? 'Courses' 
            : workbook.SheetNames[0];
          
          const coursesSheet = workbook.Sheets[sheetName];
          if (!coursesSheet) {
            alert("Could not locate any valid courses worksheet inside spreadsheet.");
            setLoading(false);
            return;
          }
          
          const parsedCourses = XLSX.utils.sheet_to_json(coursesSheet);
          
          if (parsedCourses.length === 0) {
            alert("No course rows found in the selected sheet.");
            setLoading(false);
            return;
          }

          // Validate presence of key column structures
          const firstRow: any = parsedCourses[0];
          const codeKey = Object.keys(firstRow).find(k => k.toLowerCase() === 'code');
          const titleKey = Object.keys(firstRow).find(k => k.toLowerCase() === 'title');
          const classCodeKey = Object.keys(firstRow).find(k => k.toLowerCase() === 'classcode');
          
          if (!codeKey || !titleKey || !classCodeKey) {
            alert("Invalid Format: Spreadsheet must contain column headers for 'Code', 'Title', and 'ClassCode'.");
            setLoading(false);
            return;
          }

          // Standardize column structures
          const coursesPayload = parsedCourses.map((row: any) => ({
            Code: row[codeKey],
            Title: row[titleKey],
            Description: row[Object.keys(firstRow).find(k => k.toLowerCase() === 'description') || ''] || '',
            Credits: parseInt(row[Object.keys(firstRow).find(k => k.toLowerCase() === 'credits') || '']) || 3,
            Track: row[Object.keys(firstRow).find(k => k.toLowerCase() === 'track') || ''] || 'THEOLOGY',
            ClassCode: row[classCodeKey]
          }));
          
          const response = await fetch('/api/admin/academics/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ departments: [], classes: [], courses: coursesPayload })
          });
          
          const result = await response.json();
          
          if (result.success) {
            alert(`Excel Courses Import Success!\n\nSuccessfully matched and imported ${result.coursesCount} Courses.`);
            router.refresh();
          } else {
            alert(`Import Failed: ${result.error}`);
          }
        } catch (error: any) {
          alert(`Error parsing Excel courses data: ${error.message}`);
        } finally {
          setLoading(false);
          e.target.value = '';
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      alert(`Library initialization error: ${err.message}`);
      setLoading(false);
    }
  };

  // Unified Action Processing Pipeline (POST)
  const executePost = async (action: string, payload: object) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/academic-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: payload })
      });
      
      if (res.ok) {
        // Clear forms on success depending on creation type
        if (action === 'CREATE_DEPARTMENT') { setDeptName(''); setDeptCode(''); }
        if (action === 'CREATE_CLASS') { setClassName(''); setClassCode(''); setTargetDeptId(''); }
        if (action === 'CREATE_SUBJECT') { setSubjectTitle(''); setSubjectCode(''); setTargetClassId(''); }
        if (action === 'UPDATE_NODE') {
          const type = (payload as any).updateType;
          if (type === 'department') { setDeptName(''); setDeptCode(''); setEditDeptId(null); }
          if (type === 'class') { setClassName(''); setClassCode(''); setTargetDeptId(''); setEditClassId(null); }
          if (type === 'course') { setSubjectTitle(''); setSubjectCode(''); setTargetClassId(''); setEditSubjectId(null); }
        }
      } else {
        const errorData = await res.json();
        alert(`Operation Failed: ${errorData.error || 'Server rejected request.'}${errorData.details ? `\n\nDetails: ${errorData.details}` : ''}`);
      }
    } catch (err) {
      console.error("Failed to commit database transaction:", err);
      alert("Critical communication failure while contacting the application backend.");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  // Safe Deletion Handler routing directly through the reliable POST pipeline
  const executeDelete = async (id: string, type: 'department' | 'class' | 'course') => {
    const isConfirmed = confirm(
      `Are you sure you want to delete this ${type}? Warning: All child records nested beneath this node will cascade delete out permanently.`
    );
    if (!isConfirmed) return;

    // Direct action request over the working /api/admin/academic-setup route
    await executePost('DELETE_NODE', { id, type });
  };

  return (
    <div className="space-y-6">
      {/* Excel Structural Bulk Importer Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 rounded-xl border border-slate-700 shadow-md text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-xl">📊</span> Bulk Academic Structure Importer
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Download the multi-sheet Excel template, fill out your departments, programmatic class cohorts, and subjects, and upload here.
            </p>
          </div>
          <button 
            type="button"
            disabled={loading}
            onClick={handleDownloadTemplate}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold border border-white/20 transition flex items-center gap-1.5 w-fit cursor-pointer"
          >
            <span>📥</span> Download Excel Template
          </button>
        </div>

        <div className="border-2 border-dashed border-white/20 hover:border-blue-400 bg-white/5 rounded-lg p-4 transition text-center relative flex flex-col items-center justify-center">
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            disabled={loading}
            onChange={handleImportExcel}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <span className="text-3xl block">📤</span>
            <p className="text-sm font-semibold text-white">Click or drag your completed academic structure Excel file here</p>
            <p className="text-[10px] text-slate-400">Accepts Excel (.xlsx, .xls) worksheets containing 'Departments', 'Classes', and 'Courses' tabs</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-xs text-blue-300 font-semibold bg-white/5 p-2 rounded-lg border border-blue-500/20 justify-center">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Processing structural worksheets & applying ACID transaction...</span>
          </div>
        )}
      </div>

      {/* Block 1: Departments */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-md font-bold text-slate-900 border-b pb-2">Step 1: Department Generation Console</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Department Name (e.g., Theology)" className="p-2 border rounded text-sm w-full" value={deptName} onChange={e => setDeptName(e.target.value)} />
          <input type="text" placeholder="Code (e.g., THEO)" className="p-2 border rounded text-sm w-full" value={deptCode} onChange={e => setDeptCode(e.target.value)} />
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            disabled={loading || !deptName || !deptCode} 
            onClick={() => {
              if (editDeptId) {
                executePost('UPDATE_NODE', { updateId: editDeptId, updateType: 'department', updateData: { name: deptName, code: deptCode } });
              } else {
                executePost('CREATE_DEPARTMENT', { name: deptName, code: deptCode });
              }
            }} 
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {editDeptId ? 'Update Department' : 'Commit Department Entry'}
          </button>
          {editDeptId && (
            <button onClick={() => { setEditDeptId(null); setDeptName(''); setDeptCode(''); }} className="px-4 py-2 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200 transition">
              Cancel Edit
            </button>
          )}
        </div>

        {/* Inline Live Structural Ledger for Departments */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Configured Departments Blueprint</p>
          <div className="max-h-40 overflow-y-auto border rounded-lg divide-y divide-slate-100 bg-slate-50/50">
            {departments.map(d => (
              <div key={d.id} className="p-3 flex justify-between items-center text-sm bg-white">
                <span className="font-medium text-slate-700">{d.name} <span className="text-xs font-mono text-slate-400">({d.code})</span></span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditDeptId(d.id); setDeptName(d.name); setDeptCode(d.code); document.getElementById('structure')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition border border-blue-100 disabled:opacity-50">
                    Edit
                  </button>
                  <button disabled={loading} onClick={() => executeDelete(d.id, 'department')} className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition border border-rose-100 disabled:opacity-50">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {departments.length === 0 && <p className="p-3 text-xs italic text-slate-400">No departments found.</p>}
          </div>
        </div>
      </div>

      {/* Block 2: Classes */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-md font-bold text-slate-900 border-b pb-2">Step 2: Class Program Provisioner</h3>
        <div className="grid grid-cols-3 gap-4">
          <input type="text" placeholder="Class Label (e.g., Year 1 Degree)" className="p-2 border rounded text-sm w-full" value={className} onChange={e => setClassName(e.target.value)} />
          <input type="text" placeholder="Class Code (e.g., TH-D1)" className="p-2 border rounded text-sm w-full" value={classCode} onChange={e => setClassCode(e.target.value)} />
          <select className="p-2 border rounded text-sm w-full bg-white" value={targetDeptId} onChange={e => setTargetDeptId(e.target.value)}>
            <option value="">Select Department Cluster...</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            disabled={loading || !className || !classCode || !targetDeptId} 
            onClick={() => {
              if (editClassId) {
                executePost('UPDATE_NODE', { updateId: editClassId, updateType: 'class', updateData: { name: className, code: classCode, departmentId: targetDeptId } });
              } else {
                executePost('CREATE_CLASS', { name: className, code: classCode, departmentId: targetDeptId });
              }
            }} 
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {editClassId ? 'Update Class Mapping' : 'Build Class Assignment Mapping'}
          </button>
          {editClassId && (
            <button onClick={() => { setEditClassId(null); setClassName(''); setClassCode(''); setTargetDeptId(''); }} className="px-4 py-2 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200 transition">
              Cancel Edit
            </button>
          )}
        </div>

        {/* Inline Live Structural Ledger for Classes */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Class Group Mappings</p>
          <div className="max-h-40 overflow-y-auto border rounded-lg divide-y divide-slate-100 bg-slate-50/50">
            {classes.map(c => (
              <div key={c.id} className="p-3 flex justify-between items-center text-sm bg-white">
                <div>
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className="text-xs bg-slate-100 border text-slate-600 px-1.5 py-0.5 rounded ml-2 font-mono">{c.code}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditClassId(c.id); setClassName(c.name); setClassCode(c.code); setTargetDeptId(c.departmentId); document.getElementById('structure')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition border border-blue-100 disabled:opacity-50">
                    Edit
                  </button>
                  <button disabled={loading} onClick={() => executeDelete(c.id, 'class')} className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition border border-rose-100 disabled:opacity-50">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {classes.length === 0 && <p className="p-3 text-xs italic text-slate-400">No structural program classes assigned.</p>}
          </div>
        </div>
      </div>

      {/* Block 3: Subjects / Courses */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-2">
          <h3 className="text-md font-bold text-slate-900">Step 3: Subject & Course Connector</h3>
          <div className="relative inline-flex items-center justify-center px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition cursor-pointer self-start sm:self-center">
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              disabled={loading}
              onChange={handleImportCoursesOnly}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span>📊 Bulk Import Courses (Spreadsheet)</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          <input type="text" placeholder="Title (e.g., Geez Syntax)" className="p-2 border rounded text-sm w-full" value={subjectTitle} onChange={e => setSubjectTitle(e.target.value)} />
          <input type="text" placeholder="Code (e.g., GZ102)" className="p-2 border rounded text-sm w-full" value={subjectCode} onChange={e => setSubjectCode(e.target.value)} />
          <input type="number" placeholder="Credits" className="p-2 border rounded text-sm w-full" value={subjectCredits} onChange={e => setSubjectCredits(e.target.value)} />
          
          {/* Track Field Dropdown Input */}
          <select className="p-2 border rounded text-sm w-full bg-white" value={subjectTrack} onChange={e => setSubjectTrack(e.target.value)}>
            <option value="THEOLOGY">Theology Track</option>
            <option value="GEEZ_LANGUAGE">Geez Language Track</option>
          </select>

          <select className="p-2 border rounded text-sm w-full bg-white" value={targetClassId} onChange={e => setTargetClassId(e.target.value)}>
            <option value="">Select Target Class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            disabled={loading || !subjectTitle || !subjectCode || !targetClassId} 
            onClick={() => {
              const payloadData = { 
                title: subjectTitle, 
                code: subjectCode, 
                credits: parseInt(subjectCredits), 
                classId: targetClassId,
                track: subjectTrack 
              };
              if (editSubjectId) {
                executePost('UPDATE_NODE', { updateId: editSubjectId, updateType: 'course', updateData: payloadData });
              } else {
                executePost('CREATE_SUBJECT', payloadData);
              }
            }} 
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {editSubjectId ? 'Update Subject Entry' : 'Establish System Subject Entry'}
          </button>
          {editSubjectId && (
            <button onClick={() => { setEditSubjectId(null); setSubjectTitle(''); setSubjectCode(''); setTargetClassId(''); setSubjectCredits('3'); setSubjectTrack('THEOLOGY'); }} className="px-4 py-2 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200 transition">
              Cancel Edit
            </button>
          )}
        </div>

        {/* Inline Deep Inspection List for Subjects/Courses */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Catalogued Subjects Base (Course Targets)</p>
          <div className="max-h-45 overflow-y-auto border rounded-lg divide-y divide-slate-100 bg-slate-50/50">
            {classes.flatMap(c => c.subjects || []).map((sub: any) => (
              <div key={sub.id} className="p-3 flex justify-between items-center text-sm bg-white">
                <div>
                  <span className="font-medium text-slate-800">{sub.title}</span>
                  <span className="text-xs font-mono text-slate-400 ml-2">[{sub.code}]</span>
                  <span className="text-[10px] bg-slate-50 text-slate-500 border rounded ml-2 px-1.5 py-0.5 uppercase font-mono font-semibold">
                    {sub.track || 'THEOLOGY'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditSubjectId(sub.id); setSubjectTitle(sub.title); setSubjectCode(sub.code); setSubjectCredits(sub.credits.toString()); setSubjectTrack(sub.track || 'THEOLOGY'); setTargetClassId(sub.classId); document.getElementById('structure')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition border border-blue-100 disabled:opacity-50">
                    Edit
                  </button>
                  <button disabled={loading} onClick={() => executeDelete(sub.id, 'course')} className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition border border-rose-100 disabled:opacity-50">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {classes.flatMap(c => c.subjects || []).length === 0 && (
              <p className="p-3 text-xs italic text-slate-400">No subject rows parsed in current memory context layout tree.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}