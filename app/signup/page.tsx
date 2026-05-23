// app/signup/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'password' | 'mfa'>('password');
  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get('email');
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail));
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check strong password combination rules
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passRegex.test(password)) {
      setError('Password combination rules: must be more than 7 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          mfaSecret: step === 'mfa' ? mfaSecret : undefined,
          mfaCode: step === 'mfa' ? mfaCode : undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to complete sign up. Please try again.');
      } else if (data.step === 'mfa_setup') {
        setMfaSecret(data.secret);
        setQrCodeUrl(data.qrCodeDataUrl);
        setStep('mfa');
        setError('');
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard/student';
        }, 1500);
      }
    } catch {
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-[#009fe5]" />
      <div className="p-8 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {step === 'password' ? 'Activate Your Student Account' : 'Set Up Multi-Factor Auth (MFA)'}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {step === 'password' 
              ? 'Please set a secure password to register your student portal access.' 
              : 'Mandatory device enrollment to secure your official academic transcripts.'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 animate-shake">
            <span className="flex-shrink-0">⚠</span> {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl mx-auto">✓</div>
            <p className="font-bold">Account Activated Successfully!</p>
            <p className="text-xs text-emerald-600">Logging you in and redirecting to your dashboard...</p>
          </div>
        ) : step === 'password' ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-semibold text-slate-700 mb-1.5">Institutional Email Address</label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@esdros.org"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009fe5] focus:border-transparent text-sm text-slate-800"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between items-center">
                <span>Create Secure Password</span>
                <span className="text-[10px] text-slate-400 font-normal">rules apply ℹ</span>
              </label>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Must be more than 7 characters with symbols"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009fe5] focus:border-transparent text-sm text-slate-800"
              />
              <div className="mt-1 bg-slate-50 p-2 rounded-md border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
                ⚠️ Requirement: More than 7 characters, at least one uppercase, lowercase, number, and special character.
              </div>
            </div>
            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009fe5] focus:border-transparent text-sm text-slate-800"
              />
            </div>
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#009fe5] text-white font-bold rounded-lg hover:bg-[#007bb5] transition shadow disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying Invitation...</>
              ) : 'Configure Multi-Factor Authentication →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 leading-relaxed font-medium">
              💡 <b>MFA is required</b>. Scan this barcode in your authenticator app (Google Authenticator, Microsoft Authenticator, etc.) to link your device.
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 gap-2">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="MFA QR Barcode" className="w-44 h-44 object-contain border border-slate-200 rounded-lg bg-white p-1" />
              ) : (
                <div className="w-44 h-44 bg-slate-200 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Generating QR code...
                </div>
              )}
              <div className="text-center space-y-1">
                <p className="text-[10px] font-bold text-slate-500">CAN'T SCAN? USE SECRET KEY:</p>
                <code className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-300 inline-block text-slate-700 select-all tracking-wider uppercase">
                  {mfaSecret}
                </code>
              </div>
            </div>

            <div>
              <label htmlFor="signup-code" className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">
                Enter 6-Digit Authenticator Code
              </label>
              <input
                id="signup-code"
                type="text"
                maxLength={6}
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009fe5] focus:border-transparent text-center font-mono text-xl font-bold tracking-[0.2em] text-slate-800"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('password')}
                disabled={loading}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-xs border border-slate-200"
              >
                Back
              </button>
              <button
                id="signup-submit-mfa"
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow disabled:opacity-60 flex items-center justify-center gap-1.5 text-xs"
              >
                {loading ? 'Verifying OTP...' : '⚡ Verify & Complete Signup'}
              </button>
            </div>
          </form>
        )}

        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Already have an active account?{' '}
            <Link href="/login" className="text-[#009fe5] font-bold hover:underline transition">Sign In here →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0e2a47 0%, #1e508d 50%, #009fe5 100%)' }}>
      {/* Top bar */}
      <div className="bg-[#0e2a47]/60 px-6 py-2 flex items-center justify-between text-xs text-blue-200">
        <Link href="/" className="flex items-center gap-1.5 hover:text-white transition">
          ← Back to Esdros Theological Seminary
        </Link>
        <span>Mahibere Kidusan North America</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-7">
          {/* Header */}
          <div className="text-center space-y-2">
            <img
              src="https://esderos.eotcmk.org/seminary/pluginfile.php/1/theme_klass/logo/1651894977/logo.png"
              alt="Mahibere Kidusan"
              className="mx-auto w-16 h-16 object-contain drop-shadow-lg mb-1"
            />
            <h1 className="text-2xl font-extrabold text-white">Esdros Theological Seminary</h1>
            <p className="text-blue-100 text-sm">Student Activation & Enrollment Sign Up</p>
          </div>

          <Suspense fallback={
            <div className="bg-white rounded-xl shadow-2xl p-8 text-center text-slate-500">
              Loading activation context...
            </div>
          }>
            <SignUpForm />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0e2a47]/60 px-6 py-3 text-center text-blue-300 text-xs">
        © {new Date().getFullYear()} Mahibere Kidusan North America · 2312 Arcola Ave, Silver Spring, MD 20902 · info@eotcmk.org
      </div>
    </div>
  );
}
