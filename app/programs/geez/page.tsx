import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Geez Language Program | Esdros Theological Seminary',
  description: 'Explore the BA, Associate, and Certificate Geez Language programs offered at Esdros Theological Seminary.',
};

export default function GeezProgramPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#009fe5] shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://esderos.eotcmk.org/seminary/pluginfile.php/1/theme_klass/logo/1651894977/logo.png"
              alt="Mahibere Kidusan Logo"
              className="h-12 w-12 object-contain drop-shadow"
            />
            <div className="leading-tight">
              <p className="text-white font-bold text-sm leading-none">Esdros Theological Seminary</p>
              <p className="text-blue-100 text-xs leading-none mt-0.5">Mahibere Kidusan North America</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white text-sm font-medium hover:text-blue-100 transition">Back to Home</Link>
            <Link href="/apply?track=GEEZ_LANGUAGE" className="px-4 py-2 bg-[#c02424] text-white text-sm font-bold rounded hover:bg-red-700 transition shadow">Apply Now</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#1e508d] py-20 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-4">
          <span className="text-4xl text-amber-400 drop-shadow">𒀭</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Geez Language Program</h1>
          <p className="text-blue-100 text-lg">Master the ancient liturgical language of the Ethiopian Orthodox Tewahedo Church. Unlock original manuscripts, theology, and traditional poetry (Qine).</p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-12">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-[#009fe5] pb-2 inline-block">Program Overview</h2>
            <p className="text-slate-600 leading-relaxed">
              The Geez Language track is an intensive academic journey into the classical Semitic language of Ethiopia. It is designed for students, clergy, and researchers who wish to fluently read, translate, and analyze ancient Orthodox manuscripts, liturgies, and sacred poetry.
            </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-[#009fe5] pb-2 inline-block">Levels of Study & Course Content</h2>

            {/* BA */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e508d] mb-2">Bachelor of Arts (BA) in Geez Language</h3>
              <p className="text-sm text-slate-500 mb-4">A comprehensive 4-year degree program requiring 120 credit hours.</p>
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Core Coursework:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                <li>• Advanced Geez Grammar & Syntax (Sawasew)</li>
                <li>• Geez Qine I, II, & III (Classical Poetry)</li>
                <li>• Manuscript Translation & Exegesis (Tergum)</li>
                <li>• The Book of Enoch in Geez</li>
                <li>• Zema (Liturgical Chanting & Notation)</li>
                <li>• Ethiopian Paleography & Philology</li>
                <li>• Historical Linguistics</li>
                <li>• Senior Capstone Translation Project</li>
              </ul>
            </div>

            {/* Associate */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e508d] mb-2">Associate Degree in Geez</h3>
              <p className="text-sm text-slate-500 mb-4">A 3-year fundamental program requiring 60 credit hours.</p>
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Core Coursework:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                <li>• Geez Morphology & Verb Conjugations</li>
                <li>• Reading the Synaxarium in Geez</li>
                <li>• Introduction to Geez Qine</li>
                <li>• Liturgical Translation (The Anaphora)</li>
                <li>• Intermediate Geez Vocabulary</li>
                <li>• Old Testament Readings in Geez</li>
              </ul>
            </div>

            {/* Certificate */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e508d] mb-2">Certificate in Geez Language</h3>
              <p className="text-sm text-slate-500 mb-4">A 1-year introductory program requiring 30 credit hours.</p>
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Core Coursework:</h4>
              <ul className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                <li>• The Fidäl (Alphabet) and Phonetics</li>
                <li>• Basic Geez Grammar & Noun Structures</li>
                <li>• Introduction to Geez Vocabulary</li>
                <li>• Reading the Psalms of David in Geez</li>
              </ul>
            </div>

          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border-t-4 border-[#c02424] shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Ready to begin your journey?</h3>
            <p className="text-sm text-slate-600 mb-6">Applications for the Geez Language program are open from August 1 to September 1.</p>
            <Link href="/apply?track=GEEZ_LANGUAGE" className="block text-center px-4 py-3 bg-[#c02424] text-white font-bold rounded hover:bg-red-700 transition">
              Start Application
            </Link>
          </div>

          <div className="bg-[#f0f7ff] p-6 rounded-xl border border-[#009fe5]/20">
            <h3 className="font-bold text-[#1e508d] mb-2">Program Format</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-2"><span>💻</span> 100% Online Distance Learning</li>
              <li className="flex gap-2"><span>📚</span> Synchronous & Asynchronous classes</li>
              <li className="flex gap-2"><span>🗣️</span> Live phonetic and chanting practice sessions</li>
            </ul>
          </div>
        </div>
      </main>

    </div>
  );
}
