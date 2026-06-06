'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

interface CourseList {
  name: string;
  desc?: string;
}

interface DegreeLevel {
  title: string;
  credits: number;
  duration: string;
  description: string;
  courses: CourseList[];
}

interface TrackData {
  name: string;
  icon: string;
  description: string;
  badge: string;
  levels: DegreeLevel[];
}

const PROGRAM_TRACKS: Record<'THEOLOGY' | 'GEEZ', TrackData> = {
  THEOLOGY: {
    name: 'Theology Program Track',
    icon: '✝',
    description: 'Deepen your understanding of the Apostolic faith, dogma, canon, and history of the Ethiopian Orthodox Tewahedo Church. Learn to teach, defend, and preserve the ancient faith.',
    badge: 'bg-[#e6f5fc] text-[#007bb5] border-[#009fe5]/20',
    levels: [
      {
        title: 'Bachelor of Arts (BA) in Theology',
        credits: 60,
        duration: '2 Years (Transition)',
        description: 'A 2-year upgrade transition pathway designed for graduates of the 3-year Diploma in Theology. This program builds directly on the Diploma curriculum to complete a full Bachelor of Arts degree.',
        courses: [
          { name: 'Dogmatic Theology I, II & III', desc: 'Understanding the core dogmatic teachings, sacraments, and theological formulations of the Orthodox Church.' },
          { name: 'Advanced Patristics (The Fathers)', desc: 'Study of the patristic period and the key writings of the Church Fathers (Qedusan Abaw).' },
          { name: 'Church History (Universal & Ethiopian)', desc: 'From the Early Church to the unique historical journey and preservation of the Tewahedo faith in Ethiopia.' },
          { name: 'Old & New Testament Exegesis', desc: 'A verse-by-verse scriptural reading using both traditional and modern scholarly exegesis.' },
          { name: 'Liturgical Theology & Practice', desc: 'Exploring the rich liturgical traditions, symbolism, and seasonal orders of the liturgy.' },
          { name: 'Canon Law (Fetha Negest)', desc: 'The ecclesial rules, canon law formulations, and institutional governance structures of the EOTC.' },
          { name: 'Pastoral Counseling & Liturgics', desc: 'Practical aspects of serving local parish communities, counseling, and liturgical roles.' },
          { name: 'Senior Capstone / Thesis Research', desc: 'Independent scholarly thesis directed by a faculty advisor on an approved theological topic.' }
        ]
      },
      {
        title: 'Diploma in Theology',
        credits: 60,
        duration: '3 Years',
        description: 'A comprehensive 3-year program covering basic biblical study, theology, and ethical principles. Successful completion awards a Diploma, qualifying graduates to enter the 2-year BA transition program.',
        courses: [
          { name: 'Introduction to Orthodox Dogma', desc: 'A basic introduction to the mysteries (Misterat) and faith tenets.' },
          { name: 'Survey of the Old Testament', desc: 'Historical overview, division, and context of the books of the Old Covenant.' },
          { name: 'Survey of the New Testament', desc: 'Exploration of the Gospels, Acts of the Apostles, Epistles, and Revelation.' },
          { name: 'History of the Ethiopian Church', desc: 'A historical review of the establishment and growth of EOTC.' },
          { name: 'Introduction to Liturgy', desc: 'The structures, standard procedures, and components of the Divine Liturgy.' },
          { name: 'Christian Ethics & Apologetics', desc: 'Applying Orthodox ethics to modern questions and defending the faith.' }
        ]
      },
      {
        title: 'Certificate in Theology',
        credits: 30,
        duration: '1 Year',
        description: 'An introductory pathway providing a structured overview of EOTC doctrines and scripture studies.',
        courses: [
          { name: 'Foundations of the Orthodox Faith', desc: 'Basic pillars of EOTC dogma and the Creed (Tselote Haymanot).' },
          { name: 'Introduction to the Bible', desc: 'Understanding scriptural compilation, canons, and reading schedules.' },
          { name: 'The Sacraments (Misterat)', desc: 'An examination of the Seven Sacraments of the Orthodox Church.' },
          { name: 'Lives of the Saints (Synaxarium)', desc: 'Learning spiritual models of faith from EOTC’s historical saints.' }
        ]
      }
    ]
  },
  GEEZ: {
    name: 'Geez Language Program Track',
    icon: '𒀭',
    description: 'Master the classical Semitic language of Ethiopia. Unlock thousands of original liturgical compositions, historical manuscripts, patristic translations, and classical poetry (Qine).',
    badge: 'bg-red-50 text-red-700 border-red-200/50',
    levels: [
      {
        title: 'Bachelor of Arts (BA) in Geez Language',
        credits: 60,
        duration: '2 Years (Transition)',
        description: 'A 2-year upgrade transition pathway designed for graduates of the 3-year Diploma in Geez Language. This program builds directly on the Diploma curriculum to complete a full Bachelor of Arts degree.',
        courses: [
          { name: 'Advanced Geez Grammar & Syntax (Sawasew)', desc: 'Comprehensive study of nouns, verbs, prepositions, and structural rules (Sawasew).' },
          { name: 'Geez Qine I, II & III (Classical Poetry)', desc: 'Analyzing, composing, and translating classical Ethiopian theological poetry.' },
          { name: 'Manuscript Translation & Exegesis', desc: 'Direct reading and analysis of ancient parchment manuscripts (Brana).' },
          { name: 'The Book of Enoch & Pseudepigrapha', desc: 'Analyzing unique Semitic scriptures preserved only in the Geez language.' },
          { name: 'Zema (Liturgical Chanting & Notation)', desc: 'Studying Saint Yared’s sacred chanting modes (Ge’ez, Ezel, Araray).' },
          { name: 'Ethiopian Paleography & Philology', desc: 'The study of ancient scripts, scribal traditions, and linguistic development.' },
          { name: 'Historical Semitic Linguistics', desc: 'Comparative study of Geez with other Semitic languages (Hebrew, Arabic, Syriac).' },
          { name: 'Senior Capstone Translation Project', desc: 'A full-length translation and critical edition of an un-translated parchment work.' }
        ]
      },
      {
        title: 'Diploma in Geez Language',
        credits: 60,
        duration: '3 Years',
        description: 'A comprehensive 3-year program focusing on classical Semitic morphology, early translations, and poetry. Successful completion awards a Diploma, qualifying graduates to enter the 2-year BA transition program.',
        courses: [
          { name: 'Geez Morphology & Verb Conjugations', desc: 'Detailed tracking of root verbs, active/passive forms, and tense modifiers.' },
          { name: 'Reading the Synaxarium in Geez', desc: 'Translation of biographical summaries of holy saints directly from Geez.' },
          { name: 'Introduction to Geez Qine', desc: 'Understanding basic poetic meters (e.g. Gubae Kana, Ze-amlak).' },
          { name: 'Liturgical Translation (The Anaphora)', desc: 'Translating and parsing standard EOTC Eucharistic liturgies.' },
          { name: 'Intermediate Geez Vocabulary', desc: 'Systematic expansion of vocabulary clusters and common idioms.' },
          { name: 'Old Testament Readings in Geez', desc: 'Comparing Greek Septuagint translations with early Ethiopic scriptural texts.' }
        ]
      },
      {
        title: 'Certificate in Geez Language',
        credits: 30,
        duration: '1 Year',
        description: 'A robust introduction establishing solid phonetic reading, fundamental vocabulary, and simple grammar sentences.',
        courses: [
          { name: 'The Fidäl (Alphabet) and Phonetics', desc: 'Correct enunciation, writing, and vowel variations of the Ethiopic syllabary.' },
          { name: 'Basic Geez Grammar & Noun Structures', desc: 'Understanding gender, number, simple direct objects, and suffixes.' },
          { name: 'Introduction to Geez Vocabulary', desc: 'Daily verbs, core liturgical nouns, and greeting structures.' },
          { name: 'Reading the Psalms of David in Geez', desc: 'Translating the Psalter (Mezmur) to reinforce grammar rules.' }
        ]
      }
    ]
  }
};

export default function DegreeProgramsPage() {
  const [activeTrack, setActiveTrack] = useState<'THEOLOGY' | 'GEEZ'>('THEOLOGY');
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    'THEOLOGY-0': true, // Keep first degree level expanded by default
  });

  const toggleLevel = (key: string) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const track = PROGRAM_TRACKS[activeTrack];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between">
      <div>
        <Header />

        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-[#1e508d] to-[#338af3] py-20 text-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              🎓 Academic Catalog
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
              Degree & Credential Programs
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
              Explore our structured academic curricula rooted in the ancient, apostolic traditions of the Ethiopian Orthodox Tewahedo Church.
            </p>
          </div>
        </section>

        {/* MAIN LAYOUT */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          
          {/* TRACK SELECTOR TABS */}
          <div className="flex justify-center p-1.5 bg-slate-200/60 backdrop-blur-sm rounded-2xl max-w-lg mx-auto mb-16 shadow-sm border border-slate-300/40">
            <button
              onClick={() => setActiveTrack('THEOLOGY')}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
                activeTrack === 'THEOLOGY'
                  ? 'bg-white text-[#1e508d] shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
              }`}
            >
              <span className="text-lg">✝</span>
              Theology Programs
            </button>
            <button
              onClick={() => setActiveTrack('GEEZ')}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
                activeTrack === 'GEEZ'
                  ? 'bg-white text-[#1e508d] shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
              }`}
            >
              <span className="text-lg">𒀭</span>
              Geez Language
            </button>
          </div>

          {/* DYNAMIC TRACK LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* LEFT / CENTER: TRACK DETAIL & COLLAPSIBLE LEVELS */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* TRACK INTRODUCTION CARD */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{track.icon}</span>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase border tracking-wider ${track.badge}`}>
                      {track.name}
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed text-base">{track.description}</p>
              </div>

              {/* DEGREE CREDENTIAL LISTINGS */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 tracking-wide">Available Credential Tracks</h3>
                
                {track.levels.map((level, index) => {
                  const itemKey = `${activeTrack}-${index}`;
                  const isExpanded = expandedLevels[itemKey];

                  return (
                    <div
                      key={level.title}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      {/* HEADER SUMMARY SECTION */}
                      <button
                        onClick={() => toggleLevel(itemKey)}
                        className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50/50 transition-colors focus:outline-none"
                      >
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold text-slate-900 tracking-tight">{level.title}</h4>
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            <span className="flex items-center gap-1">⏱ {level.duration}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="flex items-center gap-1">📚 {level.credits} Credit Hours</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                          <svg
                            className={`w-6 h-6 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* EXPANDABLE BODY: COURSE ROSTERS */}
                      <div
                        className={`transition-all duration-300 ease-in-out border-t border-slate-100 ${
                          isExpanded ? 'max-h-[1500px] opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'
                        }`}
                      >
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                          {level.description}
                        </p>

                        <h5 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Core Curriculum Overview</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {level.courses.map((course, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-200 space-y-1"
                            >
                              <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#009fe5]" />
                                {course.name}
                              </p>
                              {course.desc && <p className="text-xs text-slate-500 pl-3.5 leading-relaxed">{course.desc}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* RIGHT SIDEBAR: REQUIREMENTS & ADMISSIONS */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* REQUIREMENT CARD */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>📝</span> Entry Prerequisites
                </h4>
                <ul className="space-y-4">
                  {[
                    { icon: '🎓', req: 'A high school diploma is required for the Diploma program, and a completed Diploma is required for the BA transition program.' },
                    { icon: '⛪', req: 'Submit a canonical reference letter from your parish priest.' },
                    { icon: '🌍', req: 'Fluent or conversational Amharic (as secondary language) is recommended.' },
                    { icon: '💻', req: 'A stable computer and high-speed internet connection for distance classrooms.' }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-600">
                      <span className="text-lg flex-shrink-0 bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100">{item.icon}</span>
                      <span className="pt-0.5">{item.req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FORMAT INFO */}
              <div className="bg-[#f0f7ff] p-6 rounded-2xl border border-[#009fe5]/15 space-y-4">
                <h4 className="font-bold text-[#1e508d] flex items-center gap-2 text-sm">
                  <span>💻</span> Educational Framework
                </h4>
                <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-sky-500 font-bold">✓</span> 
                    <strong>100% Online Delivery:</strong> Accessible anywhere across the USA, Canada, and Europe.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sky-500 font-bold">✓</span> 
                    <strong>Synchronous Classrooms:</strong> Weekly online interactive video classes with professors.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sky-500 font-bold">✓</span> 
                    <strong>Asynchronous Assets:</strong> Download readings and view recorded lectures via the online SIS portal.
                  </li>
                </ul>
              </div>

              {/* CALL TO ACTION CARD */}
              <div className="bg-gradient-to-br from-[#c02424] to-[#e04040] p-6 rounded-2xl text-white shadow-md text-center space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-50 pointer-events-none" />
                <h4 className="font-extrabold text-lg">Ready to Apply?</h4>
                <p className="text-xs text-red-50 leading-relaxed">
                  Join our upcoming academic cycle. The admissions window is open annually from August 1 to September 1.
                </p>
                <div className="space-y-2 pt-2">
                  <Link
                    href={`/apply?track=${activeTrack === 'THEOLOGY' ? 'THEOLOGY' : 'GEEZ_LANGUAGE'}`}
                    className="block w-full py-3 bg-white text-[#c02424] font-extrabold rounded-xl hover:bg-slate-50 transition active:scale-95 text-xs shadow-md"
                  >
                    Start Admission Form →
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition text-xs"
                  >
                    Access Student SIS Portal
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 mt-20 text-center text-xs">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>© {new Date().getFullYear()} Esderos EOTC Theological Seminary. Under Mahibere Kidusan North America Coordinating Center.</p>
          <p className="text-slate-600">All program credits and titles are regulated according to the seminary’s academic standards.</p>
        </div>
      </footer>
    </div>
  );
}
