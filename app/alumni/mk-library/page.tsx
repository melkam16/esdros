'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

interface BookItem {
  id: string;
  title: string;
  ethiopianTitle?: string;
  author: string;
  category: 'PATRISTICS' | 'GEEZ_STUDIES' | 'DOGMATICS' | 'CHURCH_HISTORY';
  description: string;
  pages: number;
  year: string;
  fileSize: string;
}

export default function MkLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const LIBRARY_BOOKS: BookItem[] = [
    {
      id: '1',
      title: 'Introduction to Geez Verbs and Syntax',
      ethiopianTitle: 'መቅድመ ግዕዝ ወሰውስው',
      author: 'Mahibere Kidusan Philological Commission',
      category: 'GEEZ_STUDIES',
      description: 'A comprehensive pedagogical guide to classical Geez grammar, active-passive verbal parsing, and grammatical paradigms utilized in liturgy.',
      pages: 184,
      year: '2024',
      fileSize: '4.2 MB'
    },
    {
      id: '2',
      title: 'The Exegesis of Saint Yared Liturgical Hymns',
      ethiopianTitle: 'ትርጓሜ ማኅሌተ ያሬድ',
      author: 'EOTC Orthodox Patristics Board',
      category: 'PATRISTICS',
      description: 'Historical and dogmatic analysis of Saint Yared musical notations (Degua, Tsome Degua) and their deep biblical and patristic foundations.',
      pages: 312,
      year: '2023',
      fileSize: '8.7 MB'
    },
    {
      id: '3',
      title: 'Dogmatic Theology of the Ethiopian Orthodox Tewahedo Church',
      ethiopianTitle: 'ትምህርተ መለኮት ወዶግማ',
      author: 'Deans Council of Esderos Seminary',
      category: 'DOGMATICS',
      description: 'A structural handbook reviewing the Five Pillars of Mystery (Amdha Mestir), Christological formulas of Cyril of Alexandria, and EOTC dogmatic history.',
      pages: 245,
      year: '2025',
      fileSize: '5.1 MB'
    },
    {
      id: '4',
      title: 'A History of EOTC Monasteries and Manuscripts in Northern Ethiopia',
      ethiopianTitle: 'ታሪከ ገዳማት ወክብረ መጻሕፍት',
      author: 'MK Academic Preservation Commission',
      category: 'CHURCH_HISTORY',
      description: 'An architectural and scribal survey detailing the preservation of medieval parchment codices, library vaults, and monastic rules.',
      pages: 410,
      year: '2022',
      fileSize: '12.4 MB'
    },
    {
      id: '5',
      title: 'Patristic Hermeneutics: The Seven Pillars of Exegesis',
      ethiopianTitle: 'ትርጓሜ አበው ወምሰናያት',
      author: 'Seminary Classical Exegesis Department',
      category: 'PATRISTICS',
      description: 'Analyzing traditional Ethiopian biblical commentary chains (Andemta) compared against Eastern Orthodox patristic hermeneutical models.',
      pages: 196,
      year: '2024',
      fileSize: '3.8 MB'
    },
    {
      id: '6',
      title: 'Geez Manuscript Paleography Guide',
      ethiopianTitle: 'ስነ ጽሕፈት ግዕዝ',
      author: 'Mahibere Kidusan Archival Department',
      category: 'GEEZ_STUDIES',
      description: 'A study manual for reading ancient ink scripts on sheepskins, detailing dating markers, punctuation marks, and structural scribal marginalia.',
      pages: 156,
      year: '2023',
      fileSize: '6.9 MB'
    }
  ];

  const filteredBooks = LIBRARY_BOOKS.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.ethiopianTitle && book.ethiopianTitle.includes(searchQuery)) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = activeCategory === 'ALL' || book.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between">
      <div>
        <Header />

        {/* HERO HEADER */}
        <section className="bg-gradient-to-br from-[#123e72] to-[#1e5a9c] py-20 text-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 space-y-4">
            <Link
              href="/alumni"
              className="inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-white font-bold transition mb-2"
            >
              ← Back to Alumni Portal
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
              Mahibere Kidusan Publication Library
            </h1>
            <p className="text-blue-100 text-base leading-relaxed max-w-2xl mx-auto font-medium">
              Access curated EOTC academic journals, Geez language manuals, patristic exegeses, and doctrinal research resources compiled by Mahibere Kidusan North America.
            </p>
          </div>
        </section>

        {/* MAIN BODY */}
        <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
          
          {/* SEARCH & FILTERS CONTROLS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/40 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Category selection */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {[
                { id: 'ALL', name: 'All Archival Guides' },
                { id: 'PATRISTICS', name: 'Patristics' },
                { id: 'GEEZ_STUDIES', name: 'Geez Language Studies' },
                { id: 'DOGMATICS', name: 'Dogmatics & Theology' },
                { id: 'CHURCH_HISTORY', name: 'Church History' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search manuscripts, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-medium transition"
              />
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
            </div>

          </div>

          {/* PUBLICATIONS CATALOG GRID */}
          {filteredBooks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 font-medium text-sm shadow-sm">
              ⚠️ No publications found matching your search parameters. Please try a different category or query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBooks.map(book => (
                <div
                  key={book.id}
                  className="bg-white rounded-3xl border border-slate-200/80 hover:border-blue-500/30 hover:shadow-xl transition-all duration-350 flex flex-col justify-between overflow-hidden group shadow-md shadow-slate-100/40"
                >
                  <div className="p-6 md:p-8 space-y-5">
                    
                    {/* Badge / Category */}
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase bg-slate-50 border border-slate-100 tracking-wider text-slate-500">
                        {book.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold tracking-widest">{book.fileSize}</span>
                    </div>

                    <div className="space-y-2">
                      {book.ethiopianTitle && (
                        <h4 className="text-xl font-extrabold text-blue-900 font-serif leading-none tracking-wide group-hover:text-blue-600 transition-colors">
                          {book.ethiopianTitle}
                        </h4>
                      )}
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        By {book.author}
                      </p>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-500 font-medium pt-2 border-t border-slate-100">
                      {book.description}
                    </p>

                  </div>

                  {/* CTA / Download Footer */}
                  <div className="px-6 md:px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      📖 {book.pages} Pages • {book.year}
                    </span>
                    <button
                      onClick={() => alert(`Initiating secure academic download for: ${book.title}. Provided free of charge for Esderos Seminary graduates.`)}
                      className="px-4 py-2 bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 text-[10px] font-extrabold uppercase rounded-xl transition duration-200 tracking-wider shadow-sm flex items-center gap-1.5"
                    >
                      📥 Download PDF
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 mt-20 text-center text-xs">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>© {new Date().getFullYear()} Esderos EOTC Theological Seminary. Under Mahibere Kidusan North America Coordinating Center.</p>
          <p className="text-slate-600">Publications are copyrighted and distributed under educational fair-use registry exemptions.</p>
        </div>
      </footer>
    </div>
  );
}
