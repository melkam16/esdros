'use client';
// app/apply/page.tsx
import { useState } from 'react';
import Link from 'next/link';

type Step = 'personal' | 'program' | 'review' | 'submitted';

export default function ApplyPage() {
  const [step, setStep] = useState<Step>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    targetTrack: '' as 'THEOLOGY' | 'GEEZ_LANGUAGE' | '',
    degreeType: '',
    statement: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const nextStep = () => {
    if (step === 'personal') {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setStep('program');
    } else if (step === 'program') {
      if (!form.targetTrack || !form.degreeType) {
        setError('Please select a specific program degree.');
        return;
      }
      setStep('review');
    }
    setError(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admissions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          password: form.password,
          targetTrack: form.targetTrack,
          statement: `[Intended Program: ${form.degreeType}]\n\n${form.statement}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed.');
        return;
      }
      setSubmittedName(form.firstName);
      setStep('submitted');
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 'personal', label: 'Personal Info', num: 1 },
    { id: 'program', label: 'Program', num: 2 },
    { id: 'review', label: 'Review', num: 3 },
  ];

  if (step === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Application Submitted!</h1>
            <p className="text-slate-400 mt-2">Welcome, {submittedName}. Your application has been received and is now under review by the admissions team.</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-left space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">What happens next?</h2>
            <div className="space-y-2 text-sm text-slate-400">
              <p>📋 Your application enters the <span className="text-slate-200 font-medium">Admissions CRM pipeline</span></p>
              <p>✉️ You will receive an <span className="text-slate-200 font-medium">email notification</span> once a decision is made</p>
              <p>🎓 Upon approval, a student account will be <span className="text-slate-200 font-medium">activated</span> and you can log in</p>
            </div>
          </div>
          <Link href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      {/* Back to site */}
      <Link
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium z-10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to site
      </Link>

      <div className="max-w-2xl w-full space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 mb-2">
            <img
              src="https://esderos.eotcmk.org/seminary/pluginfile.php/1/theme_klass/logo/1651894977/logo.png"
              alt="Mahibere Kidusan"
              className="w-12 h-12 object-contain drop-shadow"
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Applications Open — 2026 Intake
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Esdros Seminary</h1>
          <p className="text-slate-400 text-lg">Admissions & SIS Application Portal</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                step === s.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : steps.findIndex(x => x.id === step) > i
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {steps.findIndex(x => x.id === step) > i ? '✓' : s.num} {s.label}
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${steps.findIndex(x => x.id === step) > i ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 'personal' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
                <p className="text-slate-400 text-sm mt-1">Tell us about yourself. Fields marked * are required.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                  <input id="apply-firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Abebe" className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                  <input id="apply-lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Tekle" className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                  <input id="apply-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                  <input id="apply-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+251 91 234 5678" className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                  <input id="apply-address" name="address" value={form.address} onChange={handleChange} placeholder="City, Region, Country" className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Create Password *</label>
                  <input id="apply-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password *</label>
                  <input id="apply-confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
              </div>
              <div className="flex justify-end">
                <button id="apply-next-personal" onClick={nextStep} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Program Selection */}
          {step === 'program' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Program Selection</h2>
                <p className="text-slate-400 text-sm mt-1">Choose your intended area of study.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { value: 'THEOLOGY', degree: 'BA in Theology', label: 'BA in Theology', icon: '🎓' },
                  { value: 'THEOLOGY', degree: 'Associate degrees in Theology', label: 'Associate degrees in Theology', icon: '✝' },
                  { value: 'THEOLOGY', degree: 'Post graduate degree in Theology', label: 'Post graduate degree in Theology', icon: '📜' },
                  { value: 'GEEZ_LANGUAGE', degree: 'BA in Geez Language', label: 'BA in Geez Language', icon: '🎓' },
                  { value: 'GEEZ_LANGUAGE', degree: 'Associate degrees in Geez Language', label: 'Associate degrees in Geez Language', icon: '𒀭' },
                ].map((track) => (
                  <button
                    key={track.degree}
                    id={`apply-track-${track.degree.replace(/\s+/g, '-')}`}
                    onClick={() => { setForm(p => ({ ...p, targetTrack: track.value as 'THEOLOGY' | 'GEEZ_LANGUAGE', degreeType: track.degree })); setError(null); }}
                    className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                      form.degreeType === track.degree
                        ? 'border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/10'
                        : 'border-slate-600 bg-slate-900/40 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{track.icon}</div>
                      <div>
                        <h3 className="font-bold text-white text-base md:text-lg">{track.label}</h3>
                        {form.degreeType === track.degree && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-400">
                            <span>✓</span> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Personal Statement <span className="text-slate-500">(optional)</span></label>
                <textarea
                  id="apply-statement"
                  name="statement"
                  value={form.statement}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Briefly explain your motivation for applying to this program..."
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep('personal')} className="px-6 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition">← Back</button>
                <button id="apply-next-program" onClick={nextStep} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                  Review Application →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Review Your Application</h2>
                <p className="text-slate-400 text-sm mt-1">Please confirm all details before submitting.</p>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-5 space-y-3 border border-slate-700">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-400">Full Name:</span><span className="text-white ml-2 font-medium">{form.firstName} {form.lastName}</span></div>
                    <div><span className="text-slate-400">Email:</span><span className="text-white ml-2 font-medium">{form.email}</span></div>
                    {form.phone && <div><span className="text-slate-400">Phone:</span><span className="text-white ml-2">{form.phone}</span></div>}
                    {form.address && <div><span className="text-slate-400">Address:</span><span className="text-white ml-2">{form.address}</span></div>}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-5 space-y-3 border border-slate-700">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Program Selection</h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${form.targetTrack === 'THEOLOGY' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {form.degreeType}
                    </span>
                  </div>
                  {form.statement && <p className="text-slate-300 text-sm italic">&ldquo;{form.statement}&rdquo;</p>}
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep('program')} className="px-6 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition">← Back</button>
                <button
                  id="apply-submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Submitting...</span>
                  ) : '✓ Submit Application'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">SIS Portal</Link>
        </p>
      </div>
    </div>
  );
}
