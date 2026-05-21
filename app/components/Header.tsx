'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'About Us', href: '/#about' },
  { label: 'Academics', href: '/#academics' },
  { label: 'Admissions', href: '/#admissions' },
  { label: 'Alumni', href: '/alumni' },
  { label: 'Contact', href: '/#contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#009fe5] shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="https://esderos.eotcmk.org/seminary/pluginfile.php/1/theme_klass/logo/1651894977/logo.png"
            alt="Mahibere Kidusan Logo"
            className="h-10 w-10 object-contain drop-shadow transition-transform duration-300 group-hover:scale-105"
          />
          <div className="leading-tight">
            <p className="text-white font-bold text-sm leading-none tracking-tight">Esdros Theological Seminary</p>
            <p className="text-blue-100 text-xs leading-none mt-0.5 font-medium hidden sm:block">Mahibere Kidusan North America</p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-5">
          {NAV_LINKS.map((l) => {
            if (l.label === 'Academics') {
              return (
                <div key={l.label} className="relative group py-4">
                  <button className="text-white text-sm font-semibold hover:text-blue-100 transition uppercase tracking-wider flex items-center gap-1">
                    {l.label}
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Dropdown Menu Container */}
                  <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2.5 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 border border-slate-100">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-t border-l border-slate-100" />
                    <Link href="/academics/degree-programs" className="relative block px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-blue-50 hover:text-[#009fe5] transition-colors rounded-lg mx-1.5">
                      Degree Programs
                    </Link>
                    <Link href="/academics/academic-calendar" className="relative block px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-blue-50 hover:text-[#009fe5] transition-colors rounded-lg mx-1.5">
                      Academic Calendar
                    </Link>
                    <Link href="/academics/faculty-directory" className="relative block px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-blue-50 hover:text-[#009fe5] transition-colors rounded-lg mx-1.5">
                      Faculty Directory
                    </Link>
                  </div>
                </div>
              );
            }
            return (
              <Link key={l.label} href={l.href} className="text-white text-sm font-semibold hover:text-blue-100 transition uppercase tracking-wider py-2">
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-white text-sm font-semibold border border-white/30 rounded-lg hover:bg-white/10 hover:border-white/50 transition duration-300">
            SIS Portal
          </Link>
          <Link href="/apply" id="header-apply-btn" className="px-4 py-2 bg-[#c02424] text-white text-sm font-bold rounded-lg hover:bg-red-700 hover:shadow-lg active:scale-95 transition duration-300">
            Apply Now
          </Link>
        </div>

        {/* MOBILE BURGER TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition duration-300"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE NAV MENU DRAWER */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bg-[#009fe5] border-t border-white/10 shadow-2xl z-40 transition-all duration-300 ease-in-out origin-top ${
          mobileMenuOpen ? 'opacity-100 scale-y-100 h-auto py-6' : 'opacity-0 scale-y-95 h-0 overflow-hidden pointer-events-none'
        }`}
      >
        <div className="px-6 flex flex-col gap-4">
          {NAV_LINKS.map((l) => {
            if (l.label === 'Academics') {
              return (
                <div key={l.label} className="border-b border-white/10 pb-2">
                  <button
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className="w-full flex items-center justify-between text-white text-base font-bold uppercase tracking-wider py-2"
                  >
                    <span>{l.label}</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${mobileDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`mt-1 pl-4 flex flex-col gap-3 transition-all duration-300 overflow-hidden ${
                      mobileDropdownOpen ? 'max-h-40 opacity-100 py-2' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <Link
                      href="/academics/degree-programs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-blue-50 hover:text-white font-medium text-sm transition"
                    >
                      Degree Programs
                    </Link>
                    <Link
                      href="/academics/academic-calendar"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-blue-50 hover:text-white font-medium text-sm transition"
                    >
                      Academic Calendar
                    </Link>
                    <Link
                      href="/academics/faculty-directory"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-blue-50 hover:text-white font-medium text-sm transition"
                    >
                      Faculty Directory
                    </Link>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white text-base font-bold uppercase tracking-wider py-2 border-b border-white/10 block"
              >
                {l.label}
              </Link>
            );
          })}
          
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-white text-sm font-semibold border border-white/30 rounded-lg hover:bg-white/10 transition"
            >
              SIS Portal
            </Link>
            <Link
              href="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-[#c02424] text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-md transition"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
