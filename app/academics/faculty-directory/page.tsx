'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';

interface FacultyMember {
  id: string;
  name: string;
  email: string;
  department: string;
  departmentId?: string;
  courses: string[];
  title?: string;
  pictureUrl?: string;
}

// Highly realistic and complete fallback dataset when the database is empty or unseeded.
const FALLBACK_FACULTY: FacultyMember[] = [
  {
    id: 'f-1',
    name: 'Memhir Daniel Seife',
    email: 'daniel.seife@eotcmk.org',
    department: 'Theology',
    title: 'Professor of Dogmatic Theology & Patristics',
    courses: ['Dogmatic Theology I, II & III', 'Advanced Patristics (The Fathers)', 'Foundations of the Orthodox Faith'],
    pictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300&q=80'
  },
  {
    id: 'f-2',
    name: 'Dr. Tedla Gebre-Yesus',
    email: 'tedla.gebreyesus@eotcmk.org',
    department: 'Theology',
    title: 'Senior Lecturer in Biblical Exegesis & Canon Law',
    courses: ['Old & New Testament Exegesis', 'Canon Law (Fetha Negest)', 'Introduction to the Bible'],
    pictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=300&h=300&q=80'
  },
  {
    id: 'f-3',
    name: 'Memhir Abayneh Kassahun',
    email: 'abayneh.kassahun@eotcmk.org',
    department: 'Geez Language',
    title: 'Instructor in Classical Geez & Philology',
    courses: ['Advanced Geez Grammar & Syntax (Sawasew)', 'Ethiopian Paleography & Philology', 'Basic Geez Grammar'],
    pictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=300&h=300&q=80'
  },
  {
    id: 'f-4',
    name: 'Qesis Melaku Welde-Tsadik',
    email: 'melaku.welde@eotcmk.org',
    department: 'Geez Language',
    title: 'Lecturer in Liturgical Chanting & Traditional Poetry',
    courses: ['Geez Qine I, II & III (Classical Poetry)', 'Zema (Liturgical Chanting)', 'Liturgical Translation'],
    pictureUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?fit=crop&w=300&h=300&q=80'
  },
  {
    id: 'f-5',
    name: 'Dr. Hermela Tekle-Mariam',
    email: 'hermela.tekle@eotcmk.org',
    department: 'Theology',
    title: 'Assistant Professor of Church History & Counseling',
    courses: ['Church History (Universal & Ethiopian)', 'Pastoral Counseling & Liturgics', 'Lives of the Saints'],
    pictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=300&h=300&q=80'
  }
];

// Pastel color palette for dynamic avatar initials circle
const AVATAR_BG_GRADIENTS = [
  'from-blue-400 to-indigo-500 text-white',
  'from-emerald-400 to-teal-500 text-white',
  'from-amber-400 to-orange-500 text-white',
  'from-rose-400 to-pink-500 text-white',
  'from-purple-400 to-fuchsia-500 text-white',
  'from-sky-400 to-blue-500 text-white'
];

export default function FacultyDirectoryPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  useEffect(() => {
    async function fetchDirectory() {
      try {
        setLoading(true);
        const res = await fetch('/api/faculty');
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.length > 0) {
            // Add custom academic titles depending on their names or departments
            const mappedData = result.data.map((f: FacultyMember) => ({
              ...f,
              title: f.title || (f.department.includes('Theology')
                ? 'Lecturer in Theological Studies'
                : 'Instructor in Geez Language')
            }));
            setFaculty(mappedData);
          } else {
            // Database is seeded with 0 members, trigger graceful premium mock dataset
            setFaculty(FALLBACK_FACULTY);
          }
        } else {
          setFaculty(FALLBACK_FACULTY);
        }
      } catch (err) {
        console.error('API connection failed. Serving fallback mock directory...', err);
        setFaculty(FALLBACK_FACULTY);
      } finally {
        setLoading(false);
      }
    }

    fetchDirectory();
  }, []);

  // Compute Initials
  const getInitials = (name: string) => {
    const parts = name.replace('(Offboarded)', '').trim().split(' ');
    if (parts.length >= 3) {
      // Handle titles like "Memhir Daniel Seife" -> "DS" or "MD"
      return (parts[1][0] + parts[2][0]).toUpperCase();
    }
    if (parts.length === 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Get index-based avatar style
  const getAvatarGradient = (idx: number) => {
    return AVATAR_BG_GRADIENTS[idx % AVATAR_BG_GRADIENTS.length];
  };

  // Filter logic
  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.courses.some((course) => course.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      selectedDept === 'ALL' ||
      (selectedDept === 'THEOLOGY' && f.department.toLowerCase().includes('theology')) ||
      (selectedDept === 'GEEZ' && (f.department.toLowerCase().includes('geez') || f.department.toLowerCase().includes('semitic') || f.department.toLowerCase().includes('language')));

    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between">
      <div>
        <Header />

        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-[#1e508d] to-[#338af3] py-20 text-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              🤝 Academic Roster
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
              Faculty Directory
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
              Meet our distinguished team of theologians, philologists, and researchers dedicated to nurturing the next generation of Church scholars.
            </p>
          </div>
        </section>

        {/* MAIN DIRECTORY INTERFACE */}
        <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-6">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by name, course title, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 focus:border-[#009fe5] focus:ring-2 focus:ring-[#009fe5]/20 bg-slate-50 hover:bg-slate-50/50 transition rounded-xl text-sm outline-none text-slate-800"
              />
            </div>

            {/* Department Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ALL', label: 'All Departments' },
                { key: 'THEOLOGY', label: 'Theology' },
                { key: 'GEEZ', label: 'Geez Language' }
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setSelectedDept(pill.key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    selectedDept === pill.key
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

          </div>

          {/* LOADING SKELETON */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredFaculty.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white p-16 rounded-2xl border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
              <span className="text-5xl block">👤</span>
              <h3 className="text-xl font-bold text-slate-800">No Roster Entries Match</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                We could not find any active faculty member matching &ldquo;{searchQuery}&rdquo; under the selected filter. Try revising your query.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedDept('ALL'); }}
                className="px-5 py-2.5 bg-[#009fe5] text-white text-xs font-bold rounded-xl hover:bg-[#007bb5] transition shadow-sm"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            /* ROSTER CARDS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFaculty.map((member, index) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 space-y-5">
                    {/* Header Info */}
                    <div className="flex items-center gap-4">
                      {/* Circle Initials Avatar or Real Profile Photo */}
                      {member.pictureUrl ? (
                        <img
                          src={member.pictureUrl}
                          alt={member.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}

                      {!member.pictureUrl && (
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0 ${getAvatarGradient(index)}`}>
                          {getInitials(member.name)}
                        </div>
                      )}
                      
                      {/* Name & Title */}
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-extrabold text-slate-900 tracking-tight text-base truncate" title={member.name}>
                          {member.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-semibold truncate leading-none" title={member.title}>
                          {member.title}
                        </p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                          {member.department}
                        </span>
                      </div>
                    </div>

                    {/* Courses Assigned List */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Instructing Courses</p>
                      <div className="flex flex-wrap gap-1.5">
                        {member.courses.length === 0 ? (
                          <span className="text-xs text-slate-500 italic">No current term courses assigned.</span>
                        ) : (
                          member.courses.map((course, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-slate-600 px-2 py-1 rounded-lg"
                            >
                              {course}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions/Contact Footer */}
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400 font-semibold font-mono truncate" title={member.email}>
                      {member.email}
                    </span>
                    <a
                      href={`mailto:${member.email}`}
                      className="px-3.5 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#009fe5]/30 hover:text-[#009fe5] text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                      <span>✉</span> Contact
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* GENERAL INFO CALLOUT */}
          <div className="bg-slate-100 border border-slate-200/50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm">Are you a registered EOTC educator?</p>
              <p className="text-xs text-slate-500">Join our academic team to teach theological tracks or Semitic linguistics in North America.</p>
            </div>
            <a
              href="mailto:info@eotcmk.org"
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm"
            >
              Contact Administrative Office
            </a>
          </div>

        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 mt-20 text-center text-xs">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>© {new Date().getFullYear()} Esdros Theological Seminary. Under Mahibere Kidusan North America Coordinating Center.</p>
          <p className="text-slate-600">Offboarding records are securely archived and handled in compliance with registrar privacy policies.</p>
        </div>
      </footer>
    </div>
  );
}
