'use client';

import { useState } from 'react';
import Header from '../../components/Header';

interface CalendarEvent {
  date: string;
  title: string;
  category: 'REGISTRATION' | 'EXAMS' | 'BREAK' | 'MILESTONE';
  categoryLabel: string;
  desc: string;
}

interface TermData {
  name: string;
  description: string;
  events: CalendarEvent[];
}

const ACADEMIC_YEAR_DATA: Record<'FALL' | 'SPRING' | 'SUMMER', TermData> = {
  FALL: {
    name: 'Fall Semester 2026',
    description: 'Core semester of the academic calendar containing standard theological and language instruction cohorts.',
    events: [
      {
        date: 'August 1, 2026',
        title: 'Admissions Window Opens',
        category: 'REGISTRATION',
        categoryLabel: 'Registration & Admissions',
        desc: 'Online student application system begins accepting files for the upcoming academic cycle.'
      },
      {
        date: 'September 1, 2026',
        title: 'Admissions Deadline & Review Period Ends',
        category: 'REGISTRATION',
        categoryLabel: 'Registration & Admissions',
        desc: 'Last day to submit admission applications, personal statements, and parish reference letters.'
      },
      {
        date: 'September 8, 2026',
        title: 'Student Registration & Course Enrollment',
        category: 'REGISTRATION',
        categoryLabel: 'Enrollment Window',
        desc: 'Enrolled students select classes, register course sections, and clear billing invoices via SIS Portal.'
      },
      {
        date: 'September 15, 2026',
        title: 'First Day of Fall Classes',
        category: 'MILESTONE',
        categoryLabel: 'Academic Milestone',
        desc: 'Lectures commence. Synchronous video classrooms open. Syllabi review session starts.'
      },
      {
        date: 'September 22, 2026',
        title: 'Add/Drop Deadline',
        category: 'REGISTRATION',
        categoryLabel: 'Registration Policy',
        desc: 'Last day to add or drop course sections without academic or financial ledger penalties.'
      },
      {
        date: 'November 2, 2026 - November 8, 2026',
        title: 'Midterm Examination Period',
        category: 'EXAMS',
        categoryLabel: 'Assessments',
        desc: 'Midterm exam sheets unlocked in the SIS Portal. Live synchronous exam sessions administered.'
      },
      {
        date: 'November 26, 2026 - November 29, 2026',
        title: 'Thanksgiving & Autumn Recess',
        category: 'BREAK',
        categoryLabel: 'Holiday Break',
        desc: 'Seminary offices closed. Lectures suspended for Thanksgiving holiday.'
      },
      {
        date: 'December 14, 2026 - December 20, 2026',
        title: 'Final Examinations',
        category: 'EXAMS',
        categoryLabel: 'Assessments',
        desc: 'Term paper submissions due. Final online exam sessions completed.'
      },
      {
        date: 'December 21, 2026',
        title: 'Winter Vacation Commences',
        category: 'BREAK',
        categoryLabel: 'Holiday Break',
        desc: 'Lectures end. Grading period opens. Students proceed on winter holiday.'
      }
    ]
  },
  SPRING: {
    name: 'Spring Semester 2027',
    description: 'Second institutional instructional semester expanding on advanced grammatical levels and patristic thesis research.',
    events: [
      {
        date: 'January 4, 2027',
        title: 'Spring Registration & Enrollment Opens',
        category: 'REGISTRATION',
        categoryLabel: 'Enrollment Window',
        desc: 'Registration dashboard active. Tuition payments due for Spring semester cohorts.'
      },
      {
        date: 'January 12, 2027',
        title: 'First Day of Spring Classes',
        category: 'MILESTONE',
        categoryLabel: 'Academic Milestone',
        desc: 'Spring lectures commence across all Theology and Geez language modules.'
      },
      {
        date: 'January 19, 2027',
        title: 'Add/Drop Period Ends',
        category: 'REGISTRATION',
        categoryLabel: 'Registration Policy',
        desc: 'Final hour to drop course assignments or modify course selections.'
      },
      {
        date: 'March 1, 2027 - March 7, 2027',
        title: 'Midterm Examination Weeks',
        category: 'EXAMS',
        categoryLabel: 'Assessments',
        desc: 'Spring term midterms unlocked. Evaluative testing window active.'
      },
      {
        date: 'April 22, 2027 - April 30, 2027',
        title: 'Holy Week & Passion (Sihlet) Recess',
        category: 'BREAK',
        categoryLabel: 'Holiday Break',
        desc: 'No classes in session. Sacred Orthodox Holy Week, Crucifixion, and Easter (Tensaee) observance.'
      },
      {
        date: 'May 10, 2027 - May 16, 2027',
        title: 'Final Examinations Period',
        category: 'EXAMS',
        categoryLabel: 'Assessments',
        desc: 'Comprehensive final testing. Senior thesis oral defense week.'
      },
      {
        date: 'June 6, 2027',
        title: 'Seminary Commencement / Graduation Ceremony',
        category: 'MILESTONE',
        categoryLabel: 'Academic Milestone',
        desc: 'Official graduation ceremony conferring BA and Associate degrees to the Class of 2027.'
      }
    ]
  },
  SUMMER: {
    name: 'Summer Session 2027',
    description: 'Accelerated intensive modules focusing on linguistic immersion, special workshops, and seminars.',
    events: [
      {
        date: 'June 14, 2027',
        title: 'Summer Session Registration Opens',
        category: 'REGISTRATION',
        categoryLabel: 'Enrollment Window',
        desc: 'Registration starts for special summer Geez and Theology immersion seminars.'
      },
      {
        date: 'June 21, 2027',
        title: 'First Day of Intensive Summer Classes',
        category: 'MILESTONE',
        categoryLabel: 'Academic Milestone',
        desc: 'Intensive short courses begin (8-week duration).'
      },
      {
        date: 'July 12, 2027 - July 16, 2027',
        title: 'Summer Immersion Midterms',
        category: 'EXAMS',
        categoryLabel: 'Assessments',
        desc: 'Accelerated midterm checks and vocabulary evaluations.'
      },
      {
        date: 'August 13, 2027',
        title: 'Summer Session Final Exams & End',
        category: 'EXAMS',
        categoryLabel: 'Assessments',
        desc: 'Summer session grades locked and recorded. Summer instruction recess begins.'
      }
    ]
  }
};

const CATEGORY_STYLES: Record<CalendarEvent['category'], string> = {
  REGISTRATION: 'bg-blue-50 text-blue-700 border-blue-200/50',
  EXAMS: 'bg-amber-50 text-amber-700 border-amber-200/50',
  BREAK: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  MILESTONE: 'bg-purple-50 text-purple-700 border-purple-200/50'
};

export default function AcademicCalendarPage() {
  const [activeTerm, setActiveTerm] = useState<'FALL' | 'SPRING' | 'SUMMER'>('FALL');

  const term = ACADEMIC_YEAR_DATA[activeTerm];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between">
      <div>
        <Header />

        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-[#1e508d] to-[#338af3] py-20 text-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6 space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              📅 Institutional Schedule
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
              Academic Calendar
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
              Plan your studies and track important administrative, academic, and holiday schedules for the 2026-2027 academic year.
            </p>
          </div>
        </section>

        {/* MAIN BODY LAYOUT */}
        <main className="max-w-7xl mx-auto px-6 py-12">

          {/* TERM NAVIGATION TABS */}
          <div className="flex flex-wrap justify-center p-1.5 bg-slate-200/60 backdrop-blur-sm rounded-2xl max-w-xl mx-auto mb-16 shadow-sm border border-slate-300/40">
            {Object.keys(ACADEMIC_YEAR_DATA).map((termKey) => {
              const termData = ACADEMIC_YEAR_DATA[termKey as 'FALL' | 'SPRING' | 'SUMMER'];
              const isSelected = activeTerm === termKey;
              return (
                <button
                  key={termKey}
                  onClick={() => setActiveTerm(termKey as 'FALL' | 'SPRING' | 'SUMMER')}
                  className={`flex-1 min-w-[120px] py-3 px-5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    isSelected
                      ? 'bg-white text-[#1e508d] shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
                  }`}
                >
                  {termData.name.split(' ')[0]} Term
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* TIMELINE LISTING */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* CURRENT TERM TITLE & SUMMARY */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{term.name} Timeline</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{term.description}</p>
              </div>

              {/* TIMELINE RENDER */}
              <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8">
                {term.events.map((event, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle Dot Marker */}
                    <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center group-hover:border-[#009fe5] transition-colors duration-300 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-[#009fe5] transition-colors duration-300" />
                    </div>

                    {/* Timeline Event Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-500">{event.date}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${CATEGORY_STYLES[event.category]}`}>
                          {event.categoryLabel}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#009fe5] transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-600 font-medium">
                        {event.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* SIDEBAR: CRITICAL HIGHLIGHTS & TOOLBAR */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* IMPORTANT DATES SUMMARY */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <span>🚨</span> Critical Deadlines
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Fall Admissions End', date: 'Sept 1, 2026', badge: 'August Cycle' },
                    { label: 'First Day of Classes', date: 'Sept 15, 2026', badge: 'Fall Cycle' },
                    { label: 'Spring Enrollments', date: 'Jan 4, 2027', badge: 'Winter Cycle' },
                    { label: 'Commencement 2027', date: 'June 6, 2027', badge: 'Conferral' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-slate-400">
                        <span>{item.badge}</span>
                        <span className="text-amber-600 font-bold">Important</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-xs text-[#1e508d] font-semibold">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOWNLOAD MOCK ACTION */}
              <div className="bg-[#f0f7ff] p-6 rounded-2xl border border-[#009fe5]/15 text-center space-y-4">
                <h4 className="font-bold text-[#1e508d] text-sm">
                  📆 Calendar Integration
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Keep Esderos EOTC Theological Seminary deadlines in sync with your personal device schedule.
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => alert('Academic calendar file downloaded successfully (Mock ICS format).')}
                    className="w-full py-2.5 bg-white text-[#1e508d] font-bold rounded-xl border border-[#009fe5]/20 hover:bg-[#e0efff] hover:border-[#009fe5]/40 transition text-xs shadow-sm"
                  >
                    📥 Download PDF Calendar
                  </button>
                  <button
                    onClick={() => alert('Synced to Google Calendar successfully.')}
                    className="w-full py-2.5 bg-[#009fe5] text-white font-bold rounded-xl hover:bg-[#007bb5] transition text-xs"
                  >
                    ➕ Sync to Google Calendar
                  </button>
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
          <p className="text-slate-600">The seminary reserves the right to adjust academic schedules depending on parish calendar alterations.</p>
        </div>
      </footer>
    </div>
  );
}
