'use client';

import { useState } from 'react';

export default function AdminDashboardActions() {
  const [isLocking, setIsLocking] = useState(false);

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
