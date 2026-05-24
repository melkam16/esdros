// app/login/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetAction, setResetAction] = useState<'password' | 'mfa'>('password');
  const [resetMessage, setResetMessage] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mfaCode: showMfa ? mfaCode : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
      } else if (data.mfaRequired) {
        setShowMfa(true);
        setError('');
      } else {
        if (data.role === 'ADMIN') window.location.href = '/dashboard/admin';
        else if (data.role === 'FACULTY') window.location.href = '/dashboard/faculty';
        else window.location.href = '/dashboard/student';
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('loading');
    setResetMessage('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, action: resetAction }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetStatus('error');
        setResetMessage(data.error || 'A network error occurred. Please verify input.');
      } else {
        setResetStatus('success');
        setResetMessage(data.message || 'Instructions sent successfully!');
        setResetEmail('');
      }
    } catch {
      setResetStatus('error');
      setResetMessage('A connection error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0e2a47 0%, #1e508d 50%, #009fe5 100%)' }}>
      {/* Top bar */}
      <div className="bg-[#0e2a47]/60 px-6 py-2 flex items-center justify-between text-xs text-blue-200">
        <Link href="/" className="flex items-center gap-1.5 hover:text-white transition">
          ← Back to Esderos EOTC Theological Seminary
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
            <h1 className="text-2xl font-extrabold text-white">Esderos EOTC Theological Seminary</h1>
            <p className="text-blue-100 text-sm">Student & Faculty SIS Portal</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-[#009fe5]" />
            <div className="p-8 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Sign In</h2>
                <p className="text-slate-500 text-sm mt-0.5">Enter your institutional credentials to continue.</p>
              </div>

              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                  <span className="flex-shrink-0">⚠</span> {error}
                </div>
              )}

              {!showMfa ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-1.5">Institutional Email</label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@eotcmk.org"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009fe5] focus:border-transparent text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => { setShowResetModal(true); setResetStatus('idle'); }}
                        className="text-xs font-semibold text-[#009fe5] hover:text-[#007bb5] transition hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009fe5] focus:border-transparent text-sm text-slate-800"
                    />
                  </div>
                  <button
                    id="login-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#009fe5] text-white font-bold rounded-lg hover:bg-[#007bb5] transition shadow disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                    ) : 'Sign In to SIS Portal'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-xs text-emerald-800 leading-relaxed font-medium">
                    🔒 <b>MFA verification required</b>. Please enter the 6-digit verification code from your authenticator app.
                  </div>
                  <div>
                    <label htmlFor="login-mfa-code" className="block text-sm font-semibold text-slate-700 mb-1.5 text-center font-bold">
                      Verification Code
                    </label>
                    <input
                      id="login-mfa-code"
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009fe5] focus:border-transparent text-center font-mono text-xl font-bold tracking-[0.2em] text-slate-800"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowMfa(false); setMfaCode(''); }}
                      disabled={loading}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-xs border border-slate-200"
                    >
                      Back
                    </button>
                    <button
                      id="login-mfa-submit"
                      type="submit"
                      disabled={loading || mfaCode.length !== 6}
                      className="flex-[2] py-2.5 bg-[#009fe5] hover:bg-[#007bb5] text-white font-bold rounded-lg transition shadow disabled:opacity-60 flex items-center justify-center gap-1.5 text-xs"
                    >
                      {loading ? 'Verifying OTP...' : '⚡ Verify & Sign In'}
                    </button>
                  </div>
                </form>
              )}

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 text-center mb-3 uppercase tracking-wide font-semibold">Portal Access Levels</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[['🎓', 'Student', 'text-[#009fe5]'], ['👨‍🏫', 'Faculty', 'text-emerald-600'], ['⚙️', 'Admin', 'text-[#c02424]']].map(([icon, role, color]) => (
                    <div key={role} className="py-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-base">{icon}</span>
                      <p className={`text-xs font-semibold mt-0.5 ${color}`}>{role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-blue-100 text-sm">
              Not yet enrolled?{' '}
              <Link href="/apply" className="text-white font-bold underline hover:text-blue-200 transition">Apply for admission →</Link>
            </p>
            <p className="text-blue-200/80 text-xs">
              Received a portal invite?{' '}
              <Link href="/signup" className="text-white font-semibold underline hover:text-blue-100 transition">Activate your account here →</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Password & MFA Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Security Recovery</h2>
              <p className="text-sm text-slate-500 mt-1">Recover account access or reset credential security keys.</p>
            </div>

            {/* TAB SELECTION */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${resetAction === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => { setResetAction('password'); setResetStatus('idle'); setResetMessage(''); }}
              >
                Password Reset
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${resetAction === 'mfa' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => { setResetAction('mfa'); setResetStatus('idle'); setResetMessage(''); }}
              >
                MFA Reset
              </button>
            </div>

            {resetStatus === 'success' ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm space-y-2">
                <p className="font-semibold flex items-center gap-1.5">✓ Success!</p>
                <p className="text-xs leading-relaxed">{resetMessage}</p>
                <button onClick={() => setShowResetModal(false)} className="mt-2 w-full py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition text-xs">
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {resetStatus === 'error' && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs leading-relaxed">
                    ⚠️ {resetMessage || 'Please enter a valid email address.'}
                  </div>
                )}
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-semibold text-slate-700 mb-1.5">Institutional Email Address</label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@esderos.org"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009fe5] focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={resetStatus === 'loading'} className="flex-1 py-2.5 bg-[#009fe5] text-white font-bold rounded-lg hover:bg-[#007bb5] transition shadow disabled:opacity-60 text-sm">
                    {resetStatus === 'loading' ? 'Processing...' : resetAction === 'password' ? 'Reset Password' : 'Reset MFA'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-[#0e2a47]/60 px-6 py-3 text-center text-blue-300 text-xs">
        © {new Date().getFullYear()} Mahibere Kidusan North America · 2312 Arcola Ave, Silver Spring, MD 20902 · info@eotcmk.org
      </div>
    </div>
  );
}