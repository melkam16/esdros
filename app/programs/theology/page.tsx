import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Theology Program | Esderos EOTC Theological Seminary',
  description: 'Explore the BA, Associate, and Certificate Theology programs offered at Esderos EOTC Theological Seminary.',
};

export default function TheologyProgramPage() {
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
              <p className="text-white font-bold text-sm leading-none">Esderos EOTC Theological Seminary</p>
              <p className="text-blue-100 text-xs leading-none mt-0.5">Mahibere Kidusan North America</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white text-sm font-medium hover:text-blue-100 transition">Back to Home</Link>
            <Link href="/apply?track=THEOLOGY" className="px-4 py-2 bg-[#c02424] text-white text-sm font-bold rounded hover:bg-red-700 transition shadow">Apply Now</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#1e508d] py-20 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-4">
          <span className="text-4xl">✝</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Theology Program</h1>
          <p className="text-blue-100 text-lg">Deepen your understanding of the Apostolic faith, dogma, canon, and history of the Ethiopian Orthodox Tewahedo Church.</p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-12">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-[#009fe5] pb-2 inline-block">Program Overview</h2>
            <p className="text-slate-600 leading-relaxed">
              The Theology track is designed to equip clergy, Sunday school teachers, and faithful lay members with a robust academic and spiritual foundation in the Ethiopian Orthodox Tewahedo tradition. Students will critically engage with scriptural exegesis, patristic writings, and the rich liturgical life of the Church.
            </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-[#009fe5] pb-2 inline-block">Levels of Study & Course Content</h2>

            {/* BA */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e508d] mb-2">Bachelor of Arts (BA) in Theology</h3>
              <p className="text-sm text-slate-500 mb-4">A comprehensive 4-year degree program requiring 120 credit hours.</p>
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Core Coursework:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                <li>• Dogmatic Theology I, II, & III</li>
                <li>• Advanced Patristics (The Fathers)</li>
                <li>• Church History (Universal & Ethiopian)</li>
                <li>• Old & New Testament Exegesis</li>
                <li>• Liturgical Theology & Practice</li>
                <li>• Canon Law (Fetha Negest)</li>
                <li>• Pastoral Counseling</li>
                <li>• Senior Capstone / Thesis</li>
              </ul>
            </div>

            {/* Associate */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e508d] mb-2">Associate Degree in Theology</h3>
              <p className="text-sm text-slate-500 mb-4">A 3-year fundamental program requiring 60 credit hours.</p>
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Core Coursework:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                <li>• Introduction to Orthodox Dogma</li>
                <li>• Survey of the Old Testament</li>
                <li>• Survey of the New Testament</li>
                <li>• History of the Ethiopian Church</li>
                <li>• Introduction to Liturgy</li>
                <li>• Christian Ethics</li>
              </ul>
            </div>

            {/* Certificate */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e508d] mb-2">Certificate in Theology</h3>
              <p className="text-sm text-slate-500 mb-4">A 1-year introductory program requiring 30 credit hours.</p>
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Core Coursework:</h4>
              <ul className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                <li>• Foundations of the Orthodox Faith</li>
                <li>• Introduction to the Bible</li>
                <li>• The Sacraments (Misterat)</li>
                <li>• Lives of the Saints (Synaxarium)</li>
              </ul>
            </div>

          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border-t-4 border-[#c02424] shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Ready to begin your journey?</h3>
            <p className="text-sm text-slate-600 mb-6">Applications for the Theology program are open from August 1 to September 1.</p>
            <Link href="/apply?track=THEOLOGY" className="block text-center px-4 py-3 bg-[#c02424] text-white font-bold rounded hover:bg-red-700 transition">
              Start Application
            </Link>
          </div>

          <div className="bg-[#f0f7ff] p-6 rounded-xl border border-[#009fe5]/20">
            <h3 className="font-bold text-[#1e508d] mb-2">Program Format</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-2"><span>💻</span> 100% Online Distance Learning</li>
              <li className="flex gap-2"><span>📚</span> Synchronous & Asynchronous classes</li>
              <li className="flex gap-2"><span>🌐</span> Courses taught primarily in Amharic with English supplements</li>
            </ul>
          </div>
        </div>
      </main>

    </div>
  );
}
