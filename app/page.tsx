// app/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from './components/Header';
import GoToTop from './components/GoToTop';

export const metadata: Metadata = {
  title: 'Esderos EOTC Theological Seminary — Mahibere Kidusan North America',
  description:
    'Esderos EOTC Theological Seminary, a Seminary under Mahibere Kidusan North America Coordinating Center. Offering theological education and Geez language studies rooted in the Ethiopian Orthodox Tewahedo tradition.',
};

const NAV_LINKS = [
  { label: 'About Us', href: '/#about' },
  { label: 'Academics', href: '/#academics' },
  { label: 'Admissions', href: '/#admissions' },
  { label: 'Alumni', href: '/#alumni' },
  { label: 'Contact', href: '/#contact' },
];

const MK_LINKS = [
  { label: 'MK Main Center', href: 'http://eotcmk.org' },
  { label: 'MK US Center', href: 'https://us.eotcmk.org' },
  { label: 'MK Europe Center', href: 'http://eu.eotcmk.org' },
  { label: 'EOTCMK TV', href: 'http://eotc.tv' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-800">

      {/* ─── TOP BAR ─── */}
      <div className="bg-[#1e508d] text-white text-xs py-1.5 px-4 md:px-6 flex items-center justify-between gap-2">
        <span className="truncate">A Seminary under <a href="https://us.eotcmk.org" className="underline hover:text-blue-200 transition hidden sm:inline">Mahibere Kidusan North America</a><a href="https://us.eotcmk.org" className="underline hover:text-blue-200 transition sm:hidden">MKNA</a></span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <a href="https://www.facebook.com/mahiberekidusan.mkusa" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition hidden sm:inline">Facebook</a>
          <a href="https://www.youtube.com/EOTCMK" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition hidden sm:inline">YouTube</a>
          <a href="https://x.com/kidusanpr" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition">X / Twitter</a>
        </div>
      </div>

      {/* ─── HEADER ─── */}
      <Header />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden" style={{ backgroundImage: "url('/esdros%20seminary_Desktop.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#009fe5]/80 to-[#1e508d]/60 mix-blend-multiply" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-white text-xs font-semibold uppercase tracking-wide backdrop-blur-sm shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-sm" />
            <span className="hidden sm:inline">Applications Open — August 1 to September 1</span>
            <span className="sm:hidden">Applications Open</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
            Esderos EOTC<br />Theological Seminary
          </h1>
          <p className="max-w-xl mx-auto text-blue-50 text-base sm:text-lg leading-relaxed drop-shadow-sm font-medium">
            Training faithful scholars to teach and defend the ancient Orthodox faith in North America and beyond.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link href="/apply" id="hero-apply-cta" className="w-full sm:w-auto px-8 py-3 bg-[#c02424] text-white font-bold rounded hover:bg-red-700 transition shadow-lg text-sm text-center">
              Begin Your Application →
            </Link>
            <a href="#about" className="w-full sm:w-auto px-8 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded border border-white/40 hover:bg-white/30 transition shadow-lg text-sm text-center">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-14 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-6">
            <span className="text-[#c02424] text-sm font-bold uppercase tracking-widest">About Esderos EOTC Theological Seminary</span>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">Esderos EOTC Theological Seminary</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>Esderos Theological Seminary</strong> is a degree-granting institution under Mahibere Kidusan USA Center, serving the Ethiopian Orthodox Tewahedo Church. The seminary is dedicated to teaching and preserving the apostolic faith, dogma, canon, liturgical tradition, and history of the Church.
            </p>
            <p className="text-slate-600 leading-relaxed">
              The seminary follows traditional Orthodox teaching and is named in honor of <strong>Memhir Esderos</strong>, a respected Ethiopian Orthodox scholar.
            </p>
            <div className="bg-[#f0f7ff] border-l-4 border-[#009fe5] rounded p-5">
              <p className="text-slate-700 italic text-sm leading-relaxed">
                &ldquo;Its vision is to form clergy, scholars, and lay leaders who are spiritually grounded, academically prepared, and able to serve the Church with integrity and faithfulness.&rdquo;
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-[#f0f2f5] rounded-xl p-7 space-y-4">
              <h3 className="text-[#c02424] font-bold text-lg uppercase tracking-wide">Our Vision</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To form clergy, scholars, and lay leaders who are spiritually grounded, academically prepared, and able to serve the Church with integrity and faithfulness.
              </p>
            </div>
            <div className="bg-[#f0f2f5] rounded-xl p-7 space-y-3">
              <h3 className="text-[#c02424] font-bold text-lg uppercase tracking-wide">Our Mission</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dedicated to teaching and preserving the apostolic faith, dogma, canon, liturgical tradition, and history of the Ethiopian Orthodox Tewahedo Church.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ACADEMICS ─── */}
      <section id="academics" className="py-14 sm:py-24 bg-[#f0f2f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[#c02424] text-sm font-bold uppercase tracking-widest">Services / Programs</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Programs of Study</h2>
            <p className="text-slate-500">Esderos Theological Seminary offers a range of academic programs, including:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                track: 'THEOLOGY',
                title: 'Theology Track',
                icon: '✝',
                color: 'border-[#009fe5]',
                badge: 'bg-[#e6f5fc] text-[#007bb5]',
                subjects: [
                  'BA in Theology (2-Year Transition)',
                  'Diploma in Theology (3-Year Program)',
                  'Post graduate degree in Theology'
                ],
              },
              {
                track: 'GEEZ_LANGUAGE',
                title: 'Geez Language Track',
                icon: '𒀭',
                color: 'border-[#c02424]',
                badge: 'bg-red-50 text-red-700',
                subjects: [
                  'BA in Geez Language (2-Year Transition)',
                  'Diploma in Geez Language (3-Year Program)'
                ],
              },
            ].map((prog) => (
              <div key={prog.track} className={`bg-white rounded-xl border-t-4 ${prog.color} shadow-sm hover:shadow-md transition p-8 space-y-5`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{prog.icon}</span>
                  <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${prog.badge}`}>{prog.title}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {prog.subjects.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#009fe5] flex-shrink-0" />{s}
                    </li>
                  ))}
                </ul>
                <Link href={`/programs/${prog.track.toLowerCase().replace('_language', '')}`} className="inline-block text-sm font-semibold text-[#009fe5] hover:text-[#007bb5] transition">
                  View Program Details →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/academics/degree-programs" className="inline-block px-6 py-3 border border-[#009fe5] text-[#009fe5] rounded font-semibold hover:bg-[#009fe5] hover:text-white transition text-sm">
              View All Degree Programs & Syllabi →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ADMISSIONS ─── */}
      <section id="admissions" className="py-14 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-6">
            <span className="text-[#c02424] text-sm font-bold uppercase tracking-widest">Admissions</span>
            <h2 className="text-3xl font-extrabold text-slate-900">How to Apply</h2>
            <div className="space-y-5">
              {[
                { num: '01', title: 'Submit Your Application', desc: 'Complete the online application form with your personal information, program choice, and statement.' },
                { num: '02', title: 'Parish Reference', desc: 'Provide a reference letter from your parish church confirming your membership and character.' },
                { num: '03', title: 'Review Period', desc: 'Applications are reviewed annually from August 1st to September 1st.' },
                { num: '04', title: 'Enrollment', desc: 'Upon approval, receive your SIS Portal credentials and begin your studies.' },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#009fe5] text-white rounded flex items-center justify-center text-xs font-extrabold flex-shrink-0">{step.num}</div>
                  <div>
                    <p className="font-bold text-slate-900">{step.title}</p>
                    <p className="text-slate-500 text-sm mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/apply" id="admissions-apply-btn" className="inline-block px-7 py-3 bg-[#c02424] text-white font-bold rounded hover:bg-red-700 transition shadow text-sm">
              Start Application →
            </Link>
          </div>
          <div className="bg-[#f0f2f5] rounded-xl p-8 space-y-6">
            <h3 className="text-[#c02424] font-bold text-lg uppercase tracking-wide">Admission Requirements</h3>
            <ul className="space-y-4">
              {[
                { icon: '🎓', req: 'A high school diploma is the minimum admission requirement.' },
                { icon: '⛪', req: 'Applicants must submit a reference letter from their parish church.' },
                { icon: '📅', req: 'Applications are accepted from August 1st to September 1st each year.' },
                { icon: '💳', req: 'A registration fee is required. Payment can be made via the seminary payment portal.' },
              ].map((item) => (
                <li key={item.req} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {item.req}
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 pt-5 space-y-3">
              <a
                href="https://www.aplos.com/aws/give/MahibereKidusanCoordinatingCenterInNorthAmerica/EsderosEOTCSeminary"
                target="_blank" rel="noopener noreferrer"
                className="block text-center py-2.5 bg-[#009fe5] text-white rounded font-semibold hover:bg-[#007bb5] transition text-sm"
              >
                Pay Registration Fee →
              </a>
              <Link href="/apply" className="block text-center py-2.5 border border-[#c02424] text-[#c02424] rounded font-semibold hover:bg-red-50 transition text-sm">
                Submit Application →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PORTAL CTA ─── */}
      <section className="py-12 sm:py-16 bg-[#009fe5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-2xl font-extrabold text-white">Already Enrolled?</h2>
          <p className="text-blue-50">Access your courses, grades, and attendance records through the SIS Portal.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" id="portal-login-btn" className="px-8 py-3 bg-white text-[#009fe5] font-bold rounded hover:bg-blue-50 transition shadow text-sm">
              🔐 Access SIS Portal
            </Link>
            <Link href="/apply" className="px-8 py-3 bg-[#c02424] text-white font-bold rounded hover:bg-red-700 transition text-sm">
              Apply for Admission →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ALUMNI ─── */}
      <section id="alumni" className="py-14 sm:py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[#c02424] text-sm font-bold uppercase tracking-widest">Alumni Association</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Graduate Roster & Resources</h2>
            <p className="text-slate-500">
              Esderos EOTC Theological Seminary supports its alumni through robust professional, ministry-focused, and academic continuing education resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📄',
                title: 'Transcripts & Audits',
                desc: 'Alumni can securely request verified digital transcripts and academic audits for parish placements or advanced graduate studies.'
              },
              {
                icon: '📚',
                title: 'Continuing Education',
                desc: 'Audit new theology cohorts on Moodle, join monthly patristic research seminars, and attend guest webinars for free.'
              },
              {
                icon: '⛪',
                title: 'Parish Placement',
                desc: 'Connect directly with EOTC administrative nodes for Sunday school, ordained diaconate, and teaching placements.'
              }
            ].map((res) => (
              <div key={res.title} className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
                <div className="space-y-3">
                  <span className="text-3xl bg-white w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">{res.icon}</span>
                  <h3 className="font-bold text-slate-900 text-base">{res.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{res.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link href="/alumni" className="inline-flex items-center gap-2 px-8 py-3 bg-[#1e508d] text-white font-bold rounded-lg hover:bg-blue-800 transition shadow text-sm">
              Explore Alumni Resources & Portal →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-12 sm:py-20 bg-[#f0f2f5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-5">
            <span className="text-[#c02424] text-sm font-bold uppercase tracking-widest">Contact Us</span>
            <h2 className="text-2xl font-extrabold text-slate-900">Get in Touch</h2>
            {[
              { icon: '📍', label: 'Address', val: '2312 Arcola Ave, Silver Spring, MD 20902' },
              { icon: '📞', label: 'Phone', val: '240-899-5215 (Ext 101)' },
              { icon: '📧', label: 'Email', val: 'us.esderos.support@eotcmk.org' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{item.label}</p>
                  <p className="text-slate-800 font-medium">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900">MK Network</h3>
            {MK_LINKS.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-[#009fe5] hover:shadow-sm transition text-sm font-medium text-slate-700">
                {l.label} <span className="text-[#009fe5]">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: 'linear-gradient(to right, #1e508d, #338af3)' }} className="text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img
                src="https://esderos.eotcmk.org/seminary/pluginfile.php/1/theme_klass/logo/1651894977/logo.png"
                alt="Mahibere Kidusan"
                className="h-10 w-10 object-contain bg-white rounded-full p-1"
              />
              <span className="font-bold text-sm">Esderos EOTC Theological Seminary</span>
            </div>
            <p className="text-blue-100 text-xs leading-relaxed">A Seminary under Mahibere Kidusan North America Coordinating Center, serving the Ethiopian Orthodox Tewahedo Church.</p>
            <a href="https://www.aplos.com/aws/give/MahibereKidusanCoordinatingCenterInNorthAmerica/for2025GSEMployeermatch" target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-white text-[#1e508d] text-xs font-bold rounded hover:bg-blue-50 transition">
              Donate to MKNA
            </a>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-sm uppercase tracking-wide mb-3">Quick Links</p>
            {[...NAV_LINKS, { label: 'SIS Portal', href: '/login' }, { label: 'Apply Now', href: '/apply' }].map((l) => (
              <a key={l.label} href={l.href} className="block text-blue-100 text-sm hover:text-white transition">{l.label}</a>
            ))}
          </div>
          <div className="space-y-2">
            <p className="font-bold text-sm uppercase tracking-wide mb-3">Follow Us</p>
            {[
              { label: 'Facebook', href: 'https://www.facebook.com/mahiberekidusan.mkusa' },
              { label: 'YouTube', href: 'https://www.youtube.com/EOTCMK' },
              { label: 'X / Twitter', href: 'https://x.com/kidusanpr' },
              { label: 'TikTok', href: 'https://www.tiktok.com/@eotcmktv' },
              { label: 'Instagram', href: 'https://www.instagram.com/mk_english_media' },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="block text-blue-100 text-sm hover:text-white transition">{s.label}</a>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-blue-200">
          <p>© {new Date().getFullYear()} Mahibere Kidusan North America Coordinating Center. All rights reserved.</p>
          <p>Developed by MK IT</p>
        </div>
      </footer>
      <GoToTop />
    </div>
  );
}
