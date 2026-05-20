'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type SectionType = 
  | 'Dashboard' | 'My Courses' | 'Attendance' | 'Gradebook' 
  | 'Students' | 'Academic Advising' | 'Schedule' | 'Messages' 
  | 'Reports' | 'Profile & Settings';

interface SidebarNavigationProps {
  activeSection: SectionType;
  setActiveSection: (section: SectionType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function SidebarNavigation({ 
  activeSection, 
  setActiveSection, 
  isOpen, 
  setIsOpen 
}: SidebarNavigationProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems: { name: SectionType; icon: string }[] = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'My Courses', icon: '📚' },
    { name: 'Attendance', icon: '📅' },
    { name: 'Gradebook', icon: '📝' },
    { name: 'Students', icon: '🎓' },
    { name: 'Academic Advising', icon: '🤝' },
    { name: 'Schedule', icon: '⏰' },
    { name: 'Messages', icon: '💬' },
    { name: 'Reports', icon: '📈' },
    { name: 'Profile & Settings', icon: '⚙️' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear token from client-side
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
        <span className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-2">
          <span className="text-indigo-400 font-mono">⚡</span> Faculty Hub
        </span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setActiveSection(item.name);
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
              activeSection === item.name 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      {/* Faculty Profile Card & Logout */}
      <div className="p-4 space-y-3 border-t border-slate-800 bg-slate-950/20">
        {/* Faculty Profile Display */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs uppercase">
            👨‍🏫
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-xs leading-tight truncate">Prof. Abba</p>
            <p className="text-[10px] text-slate-400 truncate">Theology Dept</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full text-xs font-bold text-red-400 hover:text-red-300 disabled:opacity-50 py-2 rounded border border-red-900/50 hover:bg-red-950/30 transition text-center"
        >
          {isLoggingOut ? '⏳ Logging out...' : '🚪 Logout'}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 bg-slate-900 text-slate-200 border-r border-slate-800 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Pop-over Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative flex flex-col w-full max-w-xs bg-slate-900 text-slate-200 h-full">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button onClick={() => setIsOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white text-white text-xl">
                ×
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}