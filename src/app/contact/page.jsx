'use client';

import { useState, useEffect } from 'react';
import LegalLayout from '@/components/LegalLayout';
import MarkdownContent from '@/components/MarkdownContent';
import { Mail, Clock, CheckCircle2, AlertCircle, Send, HelpCircle, DownloadCloud, CreditCard, Sparkles } from 'lucide-react';
import { DEFAULT_SITE_PAGES } from '@/lib/sitePagesDefaults';

export default function ContactPage() {
  const [pageData, setPageData] = useState(() => DEFAULT_SITE_PAGES.contact || {});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Enquiries',
    subject: '',
    orderNumber: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetch('/api/pages/contact')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.page) {
          setPageData(data.page);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: 'success',
          message: 'Thank you! Your inquiry has been submitted. Our team will review and reply within 24 hours.',
        });
        setFormData({
          name: '',
          email: '',
          category: 'General Enquiries',
          subject: '',
          orderNumber: '',
          message: '',
        });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to send message. Please write to support@davinciwalebhaiya.com directly.',
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Network issue. Please email support@davinciwalebhaiya.com directly.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LegalLayout
      badge={pageData.badge || 'Support Desk'}
      title={pageData.title || 'Contact Us'}
      lastUpdated={pageData.lastUpdated}
      description={pageData.description || 'Have questions regarding a digital purchase, download link, color transform compatibility, or studio collaboration? We are here to help.'}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct channels and inquiry types */}
        <div className="lg:col-span-5 space-y-6">
          {pageData.content && (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <MarkdownContent content={pageData.content} />
            </div>
          )}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              Direct Support Email
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              For direct assistance, order verification, or billing inquiries, reach out to our primary desk:
            </p>
            <a
              href="mailto:support@davinciwalebhaiya.com"
              className="inline-block text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              support@davinciwalebhaiya.com
            </a>
            <div className="pt-3 border-t border-white/[0.06] flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Response Window: Within 24 hours</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Support Categories
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Purchase & Payment Issues</strong>
                  <span>Razorpay deductions, duplicate charges, or receipt generation.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <DownloadCloud className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Download & Library Access</strong>
                  <span>Expired download tokens, archive unzipping, or missing library items.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Custom Look & Studio Inquiries</strong>
                  <span>Feature color grading, commercial look development, or custom DCTL coding.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">General Inquiries</strong>
                  <span>Workflow advice, version compatibility, or tutorial feedback.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#0c1220] via-[#080d18] to-[#050810] shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
          <h2 className="text-lg font-bold text-white mb-2">Send an Inquiry</h2>
          <p className="text-xs text-slate-400 mb-6">
            Fill out the details below and our team will get back to your registered email address.
          </p>

          {status.message && (
            <div
              className={`p-4 rounded-xl text-xs mb-6 flex items-start gap-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <span className="leading-relaxed">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-medium">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#05070e] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#05070e] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-medium">
                  Support Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#05070e] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 transition-all"
                >
                  <option value="General Enquiries">General Enquiries</option>
                  <option value="Purchase & Payment Issues">Purchase & Payment Issues</option>
                  <option value="Download & Access Issues">Download & Access Issues</option>
                  <option value="Collaboration & Business">Collaboration & Business</option>
                  <option value="Custom Look / Color Grading">Custom Look / Color Grading</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-medium">
                  Order Number (if applicable)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-10024"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  className="w-full bg-[#05070e] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-medium">
                Subject
              </label>
              <input
                type="text"
                placeholder="Brief summary of your question or issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-[#05070e] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-medium">
                Message / Details *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Please describe your question or issue in detail. If reporting an error, include your DaVinci Resolve version and operating system."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#05070e] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(37,99,235,0.35)] flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Submitting inquiry...</span>
              ) : (
                <>
                  <span>Submit Inquiry</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </LegalLayout>
  );
}
