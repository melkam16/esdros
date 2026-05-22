'use client';

import { useState } from 'react';
import Header from '../components/Header';

interface AlumniResource {
  title: string;
  icon: string;
  badge: string;
  description: string;
  details: string[];
  ctaText: string;
  ctaAction: () => void;
}

export default function AlumniPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gradYear: '2025',
    track: 'THEOLOGY',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please provide your name and email.');
      return;
    }
    setIsSubmitted(true);
  };

  const RESOURCES: AlumniResource[] = [
    {
      title: 'Digital Transcripts & Audits',
      icon: '📄',
      badge: 'Registrar Access',
      description: 'Request official digital copies of your academic transcripts and grading audits for parish transfers or advanced graduate applications.',
      details: [
        'Secure PDF verification link',
        'Direct registrar signature matching',
        'Standard processing in 3-5 business days'
      ],
      ctaText: 'Request Transcript',
      ctaAction: () => alert('Redirecting to the digital transcript portal. Transcripts are audited on secure class rosters.')
    },
    {
      title: 'Continuing Theological Education',
      icon: '📚',
      badge: 'Lifelong Learning',
      description: 'Audit new seminary courses, access guest webinars, and participate in theological workshops to continue your academic growth.',
      details: [
        'Special alumni SIS portal login credentials',
        'Select audit seats in new theology cohorts',
        'Monthly patristic research webinars'
      ],
      ctaText: 'Explore Course Audits',
      ctaAction: () => alert('Continuing Education roster is active on the SIS portal. Accessing courses is free for graduating classes.')
    },
    {
      title: 'Parish Placement & Network',
      icon: '⛪',
      badge: 'Ministry Service',
      description: 'Connect with EOTC parish administrations across North America for ordained registry service, Sunday school teaching, or choir mentorship roles.',
      details: [
        'Exclusive clergy and lay placements directory',
        'Letters of recommendation from Seminary Deans',
        'Coordinating with Mahibere Kidusan parish centers'
      ],
      ctaText: 'View Job Directory',
      ctaAction: () => alert('Placements are coordinate by MK North America. Accessing job rosters requires verified alumni credentials.')
    },
    {
      title: 'MK Publications Library',
      icon: '📜',
      badge: 'Academic Research',
      description: 'Access massive theological databases, Geez translations, patristic critiques, and digital editions of Mahibere Kidusan research papers.',
      details: [
        '2,000+ digital manuscripts database',
        'Advanced Geez philological concordances',
        'Free digital subscriptions to EOTC MK magazines'
      ],
      ctaText: 'Open Digital Archives',
      ctaAction: () => alert('Opening MK Theological Library. This contains Geez manuscript exegeses and EOTC research databases.')
    }
  ];

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
              Esdros Theological Seminary Alumni Portal
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
              Welcome back, scholars. Stay connected to the seminary community, request credentials, and access lifelong EOTC learning resources.
            </p>
          </div>
        </section>

        {/* MAIN PORTAL BODY */}
        <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* RESOURCES GRID (LEFT & CENTER) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Available Alumni Resources</h3>
              <p className="text-slate-500 text-sm">As a graduate of Esdros Theological Seminary, you retain lifetime access to these core services.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RESOURCES.map((res, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#009fe5]/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">{res.icon}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-100 tracking-wide">
                        {res.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 tracking-tight text-base">{res.title}</h4>
                      <p className="text-xs leading-relaxed text-slate-500 font-medium">{res.description}</p>
                    </div>

                    <ul className="space-y-1.5 pt-3 border-t border-slate-100">
                      {res.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#009fe5] shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={res.ctaAction}
                      className="text-xs font-bold text-[#009fe5] hover:text-[#007bb5] transition-colors"
                    >
                      {res.ctaText} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ALUMNI REGISTRY FORM (RIGHT SIDEBAR) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* REGISTRY FORM */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 text-sm">
                <span>📋</span> Join the Alumni Registry
              </h4>
              {isSubmitted ? (
                <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-100 text-center space-y-3">
                  <span className="text-3xl block">✓</span>
                  <p className="font-bold text-sm">Registration Submitted!</p>
                  <p className="text-xs text-emerald-600">We have recorded your details on the alumni roster. Our records officer will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daniel Seife"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#009fe5] focus:ring-2 focus:ring-[#009fe5]/20 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. daniel@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#009fe5] focus:ring-2 focus:ring-[#009fe5]/20 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Graduation Year</label>
                      <select
                        value={formData.gradYear}
                        onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
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
                        value={formData.track}
                        onChange={(e) => setFormData({ ...formData, track: e.target.value })}
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
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
              <h4 className="font-extrabold text-base">Support Esdros Theological Seminary</h4>
              <p className="text-xs text-red-50 leading-relaxed">
                Empower the next cycle of scholars by donating to the Mahibere Kidusan Coordinating Center matching fund.
              </p>
              <a
                href="https://www.aplos.com/aws/give/MahibereKidusanCoordinatingCenterInNorthAmerica/EsdrosEOTCSeminary"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 bg-white text-[#c02424] font-extrabold rounded-xl hover:bg-slate-50 transition text-xs shadow-sm"
              >
                Donate via Aplos →
              </a>
            </div>

          </div>

        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 mt-20 text-center text-xs">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>© {new Date().getFullYear()} Esdros Theological Seminary. Under Mahibere Kidusan North America Coordinating Center.</p>
          <p className="text-slate-600">Alumni registries are audited regularly and cleared in registrar archives.</p>
        </div>
      </footer>
    </div>
  );
}
