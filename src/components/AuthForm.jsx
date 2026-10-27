'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

const input =
  'w-full rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-blue-400/60';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // 2FA Specific States
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  // Check if directed to login due to missing 2FA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('needs2fa') === '1') {
        fetch('/api/auth/me')
          .then((res) => res.json())
          .then((data) => {
            if (data.user?.role === 'admin') {
              setIs2FAStep(true);
              setOtpEmail(data.user.email || '');
              triggerSendOtp();
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const triggerSendOtp = async () => {
    try {
      const res = await fetch('/api/auth/admin-2fa/send', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setResendCooldown(60);
        setMessage('A 6-digit verification code has been dispatched to your email.');
      } else {
        setMessage(data.error || 'Failed to dispatch code');
      }
    } catch {
      setMessage('Network error while dispatching code');
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/admin-2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      // Success: Hard navigation into admin
      window.location.href = '/admin';
    } catch (err) {
      setMessage(err.message || 'Verification failed');
      setBusy(false);
    }
  };

  const handleCancel2FA = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut().catch(() => {});
    setIs2FAStep(false);
    setOtpCode('');
    setMessage('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (mode === 'signup' && form.password !== form.confirm) {
      return setMessage('Passwords do not match.');
    }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      let result;

      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
      } else if (mode === 'signup') {
        const response = await fetch('/api/auth/me', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        const data = await response.json();
        if (!response.ok) {
          result = { error: { message: data.error } };
        } else {
          setMessage(data.needsEmailConfirmation ? 'Check your email to confirm your account.' : 'Account created.');
          window.location.href = data.needsEmailConfirmation ? '/login' : '/account';
          return;
        }
      } else {
        result = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      }

      if (result?.error) {
        setMessage(result.error.message);
      } else if (mode === 'login') {
        const next = new URLSearchParams(window.location.search).get('next');
        const profileResponse = await fetch('/api/auth/me');
        const profileData = await profileResponse.json();

        // If user is Admin, trigger 2FA OTP verification
        if (profileData.user?.role === 'admin') {
          setIs2FAStep(true);
          setOtpEmail(profileData.user.email || form.email);
          triggerSendOtp();
          setBusy(false);
          return;
        }

        // Regular customer navigation
        const target = next?.startsWith('/') ? next : '/account';
        window.location.href = target;
      } else {
        setMessage('Check your email for the next step.');
      }
    } catch {
      setMessage('Authentication failed. Please check your credentials or network.');
    } finally {
      if (!is2FAStep) setBusy(false);
    }
  };

  // Render 2FA Verification Screen
  if (is2FAStep) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#080b12]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[.25em] text-blue-300">
            Two-Factor Authentication
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Verify Admin Login
        </h1>
        <p className="text-xs text-white/60 mb-6 leading-relaxed">
          A 6-digit one-time security code was sent to <strong className="text-white">{otpEmail}</strong>. Enter it below to access the admin console:
        </p>

        <form onSubmit={handleVerify2FA} className="space-y-4">
          <div>
            <input
              type="text"
              required
              maxLength={6}
              autoFocus
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full rounded-2xl border border-blue-400/40 bg-black/60 px-4 py-3.5 text-center font-mono text-2xl font-bold tracking-[0.45em] text-blue-300 placeholder-white/20 outline-none focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={busy || otpCode.length !== 6}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 disabled:opacity-50 transition-all"
          >
            {busy ? (
              <span>Verifying code…</span>
            ) : (
              <>
                <span>Verify & Enter Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-xs text-center text-blue-300 font-medium bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
            {message}
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
          <button
            type="button"
            disabled={resendCooldown > 0}
            onClick={triggerSendOtp}
            className="text-white/60 hover:text-white disabled:opacity-40 flex items-center gap-1.5 transition-colors font-mono text-[11px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
            <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
          </button>

          <button
            type="button"
            onClick={handleCancel2FA}
            className="text-white/40 hover:text-white text-[11px] transition-colors"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  const title = mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password';

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#080b12]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[.25em] text-blue-300/70">DavinciWaleBhaiya / Account</p>
      <h1 className="mb-7 text-3xl font-semibold tracking-tight text-white">{title}</h1>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && (
          <input
            required
            className={input}
            placeholder="Name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        )}
        <input
          required
          type="email"
          className={input}
          placeholder="Email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
        {mode !== 'forgot' && (
          <input
            required
            minLength={8}
            type="password"
            className={input}
            placeholder="Password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />
        )}
        {mode === 'signup' && (
          <input
            required
            minLength={8}
            type="password"
            className={input}
            placeholder="Confirm password"
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
          />
        )}
        <button
          disabled={busy}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black disabled:opacity-50 hover:bg-white/90 transition-colors"
        >
          {busy ? 'Please wait…' : mode === 'login' ? 'Login' : mode === 'signup' ? 'Create account' : 'Send reset link'}
        </button>
      </form>
      {message && <p className="mt-4 text-xs text-amber-300 text-center">{message}</p>}
      <div className="mt-6 space-y-2 text-center text-xs text-white/50">
        {mode === 'login' && (
          <>
            <a className="block hover:text-white" href="/forgot-password">
              Forgot password?
            </a>
            <a className="block hover:text-white" href="/signup">
              Create account
            </a>
          </>
        )}
        {mode === 'signup' && (
          <a className="block hover:text-white" href="/login">
            Already have an account? Login
          </a>
        )}
        {mode === 'forgot' && (
          <a className="block hover:text-white" href="/login">
            Back to login
          </a>
        )}
      </div>
    </div>
  );
}
