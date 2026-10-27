'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../AdminShell';
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UserCheck,
} from 'lucide-react';

export default function AdminSecuritySettings() {
  const { toast } = useAdmin();

  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Change Password Form State
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passBusy, setPassBusy] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  // Change Email Form State
  const [emailForm, setEmailForm] = useState({
    currentPassword: '',
    newEmail: '',
  });
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetch('/api/admin/settings/account')
      .then((r) => r.json())
      .then((d) => {
        if (d.admin) setAdminInfo(d.admin);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passForm.newPassword.length < 8) {
      setPassMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }

    setPassBusy(true);
    try {
      const res = await fetch('/api/admin/settings/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-password',
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setPassMsg({ type: 'success', text: data.message || 'Password updated successfully!' });
      toast('Admin password updated successfully!', 'success');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setPassBusy(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailMsg({ type: '', text: '' });

    if (!emailForm.newEmail || !emailForm.newEmail.includes('@')) {
      setEmailMsg({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    if (!emailForm.currentPassword) {
      setEmailMsg({ type: 'error', text: 'Current password is required to change email' });
      return;
    }

    setEmailBusy(true);
    try {
      const res = await fetch('/api/admin/settings/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-email',
          currentPassword: emailForm.currentPassword,
          newEmail: emailForm.newEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update email');

      setEmailMsg({ type: 'success', text: data.message || 'Email updated successfully!' });
      toast(`Admin email changed to ${data.newEmail}`, 'success');
      setAdminInfo((prev) => ({ ...prev, email: data.newEmail }));
      setEmailForm({ currentPassword: '', newEmail: '' });
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.message || 'Failed to update email' });
    } finally {
      setEmailBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2FA & Account Status Overview Card */}
      <section className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#0c1628]/95 via-[#080d1a]/95 to-[#050812]/95 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
          <ShieldCheck className="w-48 h-48 text-blue-400" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Admin Security & Two-Factor Authentication
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Login requires email OTP verification. Every administrative sign-in sends a single-use 6-digit code.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-black/40">
            <span className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider">Active Admin Email</span>
            <span className="text-white font-semibold text-sm truncate block font-sans">
              {loading ? 'Loading…' : adminInfo?.email || 'admin@gmail.com'}
            </span>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-black/40">
            <span className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider">Role & Permissions</span>
            <span className="text-blue-400 font-semibold text-sm block">
              Full Administrator (All Modules)
            </span>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-black/40">
            <span className="text-[10px] text-white/40 block mb-1 uppercase tracking-wider">2FA Method</span>
            <span className="text-emerald-400 font-semibold text-sm block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Email OTP (Resend Engine)
            </span>
          </div>
        </div>
      </section>

      {/* Forms Grid: Change Password & Change Email */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Change Password */}
        <section className="rounded-3xl border border-white/[0.08] bg-[#080c16] p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.08]">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">Change Password</h4>
                <p className="text-xs text-white/45">Update your administrator sign-in password</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">
                  New Password (min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter strong new password"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              {passMsg.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                    passMsg.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {passMsg.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passMsg.text}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {passBusy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating password…</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* 2. Change Admin Email */}
        <section className="rounded-3xl border border-white/[0.08] bg-[#080c16] p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.08]">
              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">Change Admin Email</h4>
                <p className="text-xs text-white/45">Update the email address used for sign-in & 2FA OTPs</p>
              </div>
            </div>

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">
                  Current Email
                </label>
                <input
                  type="email"
                  disabled
                  value={adminInfo?.email || 'admin@gmail.com'}
                  className="w-full rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-2.5 text-xs text-white/50 outline-none cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">
                  New Admin Email *
                </label>
                <input
                  type="email"
                  required
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }))}
                  placeholder="newadmin@davinciwalebhaiya.com"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-blue-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">
                  Confirm Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={emailForm.currentPassword}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter password to authorize email change"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {emailMsg.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                    emailMsg.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {emailMsg.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{emailMsg.text}</span>
                </div>
              )}

              <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                ⚠️ Naya email update karne ke baad, aapka login aur future 2FA verification codes isi naye email par aayenge.
              </p>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={emailBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {emailBusy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating email…</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Update Admin Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

