'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

export default function AlumniPage() {
  // Alumni search states
  const [searchFirst, setSearchFirst] = useState('');
  const [searchLast, setSearchLast] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Modal states
  const [activeModal, setActiveModal] = useState<'NONE' | 'TRANSCRIPT' | 'CONTINUOUS_ED'>('NONE');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal form states
  const [modalName, setModalName] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalDetails, setModalDetails] = useState('');

  // Sidebar registry form state
  const [registryName, setRegistryName] = useState('');
  const [registryEmail, setRegistryEmail] = useState('');
  const [registryYear, setRegistryYear] = useState('2025');
  const [registryTrack, setRegistryTrack] = useState('THEOLOGY');
  const [registryMessage, setRegistryMessage] = useState('');
  const [registrySubmitted, setRegistrySubmitted] = useState(false);

  // Handle Registry Form Submit
  const handleRegistrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registryName || !registryEmail) {
      alert('Please provide your name and email.');
      return;
    }
    setRegistrySubmitted(true);
  };

  // Handle Alumni Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchFirst.trim() && !searchLast.trim()) {
      alert('Please enter at least a first name or a last name to search.');
      return;
    }

    setSearchLoading(true);
    setSearchPerformed(true);
    try {
      const res = await fetch(`/api/alumni/search?firstName=${encodeURIComponent(searchFirst.trim())}&lastName=${encodeURIComponent(searchLast.trim())}`);
      const result = await res.json();
      if (result.success) {
        setSearchResults(result.data || []);
      } else {
        alert(result.error || 'Failed to search registry.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to search services.');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchFirst('');
    setSearchLast('');
    setSearchResults([]);
    setSearchPerformed(false);
  };

  // Handle Modal Submission (Transcript or Continuous Ed requests)
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim() || !modalEmail.trim()) {
      setRequestMessage({ type: 'error', text: 'Name and Email are required fields.' });
      return;
    }

    setSubmittingRequest(true);
    setRequestMessage(null);
    try {
      const res = await fetch('/api/alumni/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeModal,
          name: modalName,
          email: modalEmail,
          phone: modalPhone,
          details: modalDetails
        })
      });

      const result = await res.json();
      if (result.success) {
        setRequestMessage({ type: 'success', text: 'Your request has been filed successfully with the registrar office!' });
        // Clear fields
        setModalName('');
        setModalEmail('');
        setModalPhone('');
        setModalDetails('');
        setTimeout(() => {
          setActiveModal('NONE');
          setRequestMessage(null);
        }, 3000);
      } else {
        setRequestMessage({ type: 'error', text: result.error || 'Failed to register your request.' });
      }
    } catch (err) {
      console.error(err);
      setRequestMessage({ type: 'error', text: 'Error connecting to database servers.' });
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between">
      <div>
        <Header />

        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-[#1e508d] to-[#338af3] py-20 text-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              🎓 Graduating Network
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
              Esderos EOTC Theological Seminary Alumni Portal
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
              Welcome back, scholars. Stay connected to the seminary community, verify credentials, request transcripts, and access lifelong learning resources.
            </p>
          </div>
        </section>

        {/* MAIN PORTAL BODY */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-12">

          {/* DYNAMIC GRADUATE SEARCH PANEL */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/40 p-8 max-w-5xl mx-auto space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="text-2xl">🔍</span> Public Graduate Verification Console
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Search active registry records to verify degree conferrals, graduation cohorts, and track majors.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase rounded-full border border-emerald-200 tracking-wider">
                ✓ Live Registrar Audits
              </span>
            </div>

            <form onSubmit={handleSearch} className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amanuel"
                  value={searchFirst}
                  onChange={(e) => setSearchFirst(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tsegaye"
                  value={searchLast}
                  onChange={(e) => setSearchLast(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition text-xs shadow-md shadow-blue-500/10 active:translate-y-0.5"
                >
                  {searchLoading ? 'Searching...' : 'Search Registry'}
                </button>
                {searchPerformed && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl transition text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* Search Results Display */}
            {searchPerformed && (
              <div className="relative z-10 animate-in fade-in slide-in-from-top-2 duration-300">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 font-medium text-xs">
                    ⚠️ No verified graduate record found matching &ldquo;{searchFirst} {searchLast}&rdquo;. Please verify spellings or contact the registrar.
                  </div>
                ) : (
                  <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-inner bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">First Name</th>
                          <th className="p-4">Last Name</th>
                          <th className="p-4">Graduation Year</th>
                          <th className="p-4">Program Track</th>
                          <th className="p-4 text-right">Registry Clearance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {searchResults.map((grad, idx) => (
                          <tr key={grad.id || idx} className="hover:bg-slate-50/50 transition">
                            <td className="p-4 text-slate-900 font-bold">{grad.firstName}</td>
                            <td className="p-4 text-slate-900 font-bold">{grad.lastName}</td>
                            <td className="p-4">{grad.yearOfGraduation}</td>
                            <td className="p-4">{grad.program}</td>
                            <td className="p-4 text-right">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wide">
                                ● VERIFIED GRADUATE
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LOWER GRID: RESOURCES & SIDEBAR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            
            {/* RESOURCES GRID (LEFT & CENTER) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Available Alumni Resources</h3>
                <p className="text-slate-500 text-sm">As a graduate of Esderos EOTC Theological Seminary, you retain lifetime access to these core services.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Transcript Request Resource */}
                <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">📄</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-100 tracking-wide">
                        Registrar Access
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 tracking-tight text-base">Digital Transcripts & Audits</h4>
                      <p className="text-xs leading-relaxed text-slate-500 font-medium">Request official digital copies of your academic transcripts and grading audits for parish transfers or advanced graduate applications.</p>
                    </div>

                    <ul className="space-y-1.5 pt-3 border-t border-slate-100">
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#009fe5] shrink-0" />
                        Secure PDF verification link
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#009fe5] shrink-0" />
                        Direct registrar signature matching
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#009fe5] shrink-0" />
                        Standard processing in 3-5 business days
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setActiveModal('TRANSCRIPT');
                        setRequestMessage(null);
                      }}
                      className="text-xs font-bold text-[#009fe5] hover:text-[#007bb5] transition-colors"
                    >
                      Request Transcript →
                    </button>
                  </div>
                </div>

                {/* Continuing Theological Education Resource */}
                <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">📚</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 tracking-wide">
                        Lifelong Learning
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 tracking-tight text-base">Continuing Theological Education</h4>
                      <p className="text-xs leading-relaxed text-slate-500 font-medium">Audit new seminary courses, access guest webinars, and participate in theological workshops to continue your academic growth.</p>
                    </div>

                    <ul className="space-y-1.5 pt-3 border-t border-slate-100">
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        Special alumni SIS portal login credentials
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        Select audit seats in new theology cohorts
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        Monthly patristic research webinars
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setActiveModal('CONTINUOUS_ED');
                        setRequestMessage(null);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Explore Course Audits →
                    </button>
                  </div>
                </div>

                {/* Placements Resource */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">⛪</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-100 tracking-wide">
                        Ministry Service
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 tracking-tight text-base">Parish Placement & Network</h4>
                      <p className="text-xs leading-relaxed text-slate-500 font-medium">Connect with EOTC parish administrations across North America for registry service, Sunday school teaching, or choir mentorship roles.</p>
                    </div>

                    <ul className="space-y-1.5 pt-3 border-t border-slate-100">
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        Exclusive clergy and lay placements directory
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        Recommendation letters from Seminary Deans
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        Coordinating with Mahibere Kidusan centers
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => alert('Placements are coordinated by MK North America. Accessing job rosters requires verified alumni credentials.')}
                      className="text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      View Job Directory →
                    </button>
                  </div>
                </div>

                {/* MK Publication Library Resource */}
                <div className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">📜</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 tracking-wide">
                        Academic Research
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 tracking-tight text-base">MK Publications Library</h4>
                      <p className="text-xs leading-relaxed text-slate-500 font-medium">Access massive theological databases, Geez translations, patristic critiques, and digital editions of Mahibere Kidusan research papers.</p>
                    </div>

                    <ul className="space-y-1.5 pt-3 border-t border-slate-100">
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        2,000+ digital manuscripts database
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Advanced Geez philological concordances
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Free digital subscriptions to EOTC MK magazines
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <Link
                      href="/alumni/mk-library"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors inline-block"
                    >
                      Open Digital Archives →
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            {/* ALUMNI REGISTRY FORM (RIGHT SIDEBAR) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* REGISTRY FORM */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 text-sm">
                  <span>📋</span> Join the Alumni Registry
                </h4>
                {registrySubmitted ? (
                  <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-100 text-center space-y-3">
                    <span className="text-3xl block">✓</span>
                    <p className="font-bold text-sm">Registration Submitted!</p>
                    <p className="text-xs text-emerald-600">We have recorded your details on the alumni roster. Our records officer will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegistrySubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Daniel Seife"
                        value={registryName}
                        onChange={(e) => setRegistryName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#009fe5] focus:ring-2 focus:ring-[#009fe5]/20 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. daniel@domain.com"
                        value={registryEmail}
                        onChange={(e) => setRegistryEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#009fe5] focus:ring-2 focus:ring-[#009fe5]/20 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Graduation Year</label>
                        <select
                          value={registryYear}
                          onChange={(e) => setRegistryYear(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#009fe5] font-medium"
                        >
                          {['2022', '2023', '2024', '2025', '2026'].map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Program Track</label>
                        <select
                          value={registryTrack}
                          onChange={(e) => setRegistryTrack(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#009fe5] font-medium"
                        >
                          <option value="THEOLOGY">Theology</option>
                          <option value="GEEZ_LANGUAGE">Geez Language</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Message / Parish Center</label>
                      <textarea
                        placeholder="Specify your current parish location or notes..."
                        value={registryMessage}
                        onChange={(e) => setRegistryMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#009fe5] font-medium resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#009fe5] hover:bg-[#007bb5] text-white font-extrabold rounded-xl transition duration-200 text-xs shadow-md"
                    >
                      Join Registry
                    </button>
                  </form>
                )}
              </div>

              {/* DONATIONS CALLOUT */}
              <div className="bg-gradient-to-br from-[#c02424] to-[#e04040] p-6 rounded-2xl text-white shadow-md text-center space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-50 pointer-events-none" />
                <h4 className="font-extrabold text-base">Support Esderos EOTC Theological Seminary</h4>
                <p className="text-xs text-red-50 leading-relaxed">
                  Empower the next cycle of scholars by donating to the Mahibere Kidusan Coordinating Center matching fund.
                </p>
                <a
                  href="https://www.aplos.com/aws/give/MahibereKidusanCoordinatingCenterInNorthAmerica/EsderosEOTCSeminary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 bg-white text-[#c02424] font-extrabold rounded-xl hover:bg-slate-50 transition text-xs shadow-sm"
                >
                  Donate via Aplos →
                </a>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 mt-20 text-center text-xs">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>© {new Date().getFullYear()} Esderos EOTC Theological Seminary. Under Mahibere Kidusan North America Coordinating Center.</p>
          <p className="text-slate-600">Alumni registries are audited regularly and cleared in registrar archives.</p>
        </div>
      </footer>

      {/* ──────────────── MODAL DRAWERS ──────────────── */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setActiveModal('NONE')} />
          
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal('NONE')}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              ✕
            </button>

            <div>
              <span className="text-4xl">
                {activeModal === 'TRANSCRIPT' ? '📜' : '📚'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {activeModal === 'TRANSCRIPT' ? 'Official Transcript Request' : 'Continuous Education Roster Request'}
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                {activeModal === 'TRANSCRIPT'
                  ? 'Submit your information to file an official digital transcript verification with the seminary registrar office.'
                  : 'Enroll in the Continuous Theological Education program to audit new course modules and join webinars.'}
              </p>
            </div>

            {requestMessage && (
              <div className={`p-4 rounded-xl border text-xs font-semibold ${
                requestMessage.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {requestMessage.text}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daniel Seife"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. daniel@domain.com"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400">Contact Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (XXX) XXX-XXXX"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                  {activeModal === 'TRANSCRIPT' ? 'Graduation Cohort & Purpose' : 'Preferred Courses to Audit'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={
                    activeModal === 'TRANSCRIPT'
                      ? 'e.g. Class of 2025 (Theology). Requesting for parish placement registry.'
                      : 'e.g. Patristic Studies, Geez Syntax, Dogmatics. Background: Class of 2024.'
                  }
                  value={modalDetails}
                  onChange={(e) => setModalDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('NONE')}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-500/10"
                >
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
