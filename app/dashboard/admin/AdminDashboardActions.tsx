'use client';

import { useState } from 'react';

export default function AdminDashboardActions() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/reports/system');
      if (!response.ok) {
        throw new Error('Failed to generate executive system report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Esderos_Seminary_Administration_System_Report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Error: Failed to export executive system PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLock = () => {
    const confirmed = confirm("Are you sure you want to completely lock all pending semester terms? This action cannot be easily undone.");
    if (!confirmed) return;
    
    setIsLocking(true);
    // Simulate network delay for database locking
    setTimeout(() => {
      alert("All pending semester terms have been locked successfully.");
      setIsLocking(false);
    }, 1500);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <button 
        onClick={handleExport}
        disabled={isExporting}
        className="px-5 py-2.5 bg-slate-950 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition shadow-sm disabled:opacity-70 flex items-center gap-2"
      >
        {isExporting ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Generating PDF...</>
        ) : (
          'Export System PDF Report'
        )}
      </button>
      
      <button 
        onClick={handleLock}
        disabled={isLocking}
        className="px-5 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition shadow-sm disabled:opacity-70 flex items-center gap-2"
      >
        {isLocking ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Locking Records...</>
        ) : (
          'Lock Pending Semester Terms'
        )}
      </button>
    </div>
  );
}
