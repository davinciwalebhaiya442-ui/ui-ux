'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PanelsTopBottom,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Mail,
  Youtube,
  Instagram,
  Twitter,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  Edit3,
  BookOpen,
} from 'lucide-react';
import { AdminLayout, useAdmin } from '../AdminShell';
import { DEFAULT_FOOTER_SETTINGS } from '@/lib/footer';

export default function FooterSettingsPage() {
  const { toast } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FOOTER_SETTINGS);
  const [activeTab, setActiveTab] = useState('brand');

  useEffect(() => {
    fetch('/api/admin/footer')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.footer) {
          setForm({
            ...DEFAULT_FOOTER_SETTINGS,
            ...data.footer,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load footer settings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLinkChange = (group, index, key, value) => {
    setForm((prev) => {
      const list = [...(prev[group] || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, [group]: list };
    });
  };

  const handleAddLink = (group) => {
    setForm((prev) => ({
      ...prev,
      [group]: [...(prev[group] || []), { label: 'New Link', href: '/#' }],
    }));
  };

  const handleRemoveLink = (group, index) => {
    setForm((prev) => {
      const list = [...(prev[group] || [])];
      list.splice(index, 1);
      return { ...prev, [group]: list };
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save footer settings');
      }

      toast('Footer settings saved successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Error saving footer settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle =
    'w-full rounded-xl border border-white/10 bg-[#080d18] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-400/50 transition-colors';

  if (loading) {
    return (
      <AdminLayout title="Footer Settings">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Footer Settings">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">
            Site / Footer Management
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Footer Settings</h2>
          <p className="mt-1 text-sm text-white/40">
            Customize branding, newsletter dispatch, directory links, support emails and social links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 mb-6 overflow-x-auto scrollbar-none">
        {[
          { id: 'brand', label: 'Brand & Dispatch' },
          { id: 'connect', label: 'Contact & Socials' },
          { id: 'links', label: 'Directory Navigation Links' },
          { id: 'preview', label: 'Live Preview' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: Brand & Dispatch */}
        {activeTab === 'brand' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Brand Information */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1b] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Brand Identity</h3>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">Brand Name</label>
                <input
                  type="text"
                  className={inputStyle}
                  value={form.brandName}
                  onChange={(e) => handleFieldChange('brandName', e.target.value)}
                  placeholder="DavinciWaleBhaiya"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">Brand Tagline / Mission</label>
                <textarea
                  rows={3}
                  className={inputStyle}
                  value={form.brandTagline}
                  onChange={(e) => handleFieldChange('brandTagline', e.target.value)}
                  placeholder="Precision color science, optical DCTLs, and timeline utilities for professional colorists and video editors."
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">Copyright Statement</label>
                <input
                  type="text"
                  className={inputStyle}
                  value={form.copyrightText}
                  onChange={(e) => handleFieldChange('copyrightText', e.target.value)}
                  placeholder="DavinciWaleBhaiya. All rights reserved."
                />
                <span className="text-[10px] text-white/30 block mt-1">
                  Year is automatically appended (e.g. &copy; {new Date().getFullYear()} {form.copyrightText})
                </span>
              </div>
            </div>

            {/* Newsletter Dispatch */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1b] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
                <Mail className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Direct Release Dispatch</h3>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">Dispatch Section Heading</label>
                <input
                  type="text"
                  className={inputStyle}
                  value={form.newsletterHeading}
                  onChange={(e) => handleFieldChange('newsletterHeading', e.target.value)}
                  placeholder="Direct Release Dispatch"
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">Email Input Placeholder</label>
                <input
                  type="text"
                  className={inputStyle}
                  value={form.newsletterPlaceholder}
                  onChange={(e) => handleFieldChange('newsletterPlaceholder', e.target.value)}
                  placeholder="editor@studio.com"
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">Submit Button Label</label>
                <input
                  type="text"
                  className={inputStyle}
                  value={form.newsletterButtonText}
                  onChange={(e) => handleFieldChange('newsletterButtonText', e.target.value)}
                  placeholder="Join"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contact & Socials */}
        {activeTab === 'connect' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1b] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
                <Mail className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Direct Support</h3>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">Support Email Address</label>
                <input
                  type="email"
                  className={inputStyle}
                  value={form.supportEmail}
                  onChange={(e) => handleFieldChange('supportEmail', e.target.value)}
                  placeholder="support@davinciwalebhaiya.com"
                />
                <span className="text-[10px] text-white/30 block mt-1">
                  Rendered as a direct mailto link in the Connect column.
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1b] p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Social Media Channels</h3>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-white/60 mb-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                  <span>YouTube Channel URL</span>
                </label>
                <input
                  type="url"
                  className={inputStyle}
                  value={form.youtubeUrl}
                  onChange={(e) => handleFieldChange('youtubeUrl', e.target.value)}
                  placeholder="https://youtube.com/@davinciwalebhaiya"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-white/60 mb-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram Profile URL</span>
                </label>
                <input
                  type="url"
                  className={inputStyle}
                  value={form.instagramUrl}
                  onChange={(e) => handleFieldChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/davinciwalebhaiya"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-white/60 mb-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>Twitter / X Profile URL</span>
                </label>
                <input
                  type="url"
                  className={inputStyle}
                  value={form.twitterUrl}
                  onChange={(e) => handleFieldChange('twitterUrl', e.target.value)}
                  placeholder="https://x.com/davinciwale"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-white/60 mb-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Discord Community URL</span>
                </label>
                <input
                  type="url"
                  className={inputStyle}
                  value={form.discordUrl}
                  onChange={(e) => handleFieldChange('discordUrl', e.target.value)}
                  placeholder="https://discord.gg/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Directory Navigation Links */}
        {activeTab === 'links' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Action Banner to Page Content Editor */}
            <div className="lg:col-span-3 p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Need to edit the text inside these linked pages?</h4>
                  <p className="text-[11px] text-white/50">
                    Customize legal clauses, terms, privacy policies, return rules, and about text directly in the Page Content Editor.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/pages"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 w-fit shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open Page Content Editor &rarr;</span>
              </Link>
            </div>

            {/* Products Column */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1b] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-xs font-mono uppercase tracking-wider text-blue-300 font-semibold">
                  Products Column
                </h3>
                <button
                  type="button"
                  onClick={() => handleAddLink('productsLinks')}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-mono"
                >
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              </div>

              <div className="space-y-2.5">
                {(form.productsLinks || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        placeholder="Label"
                        value={item.label}
                        onChange={(e) => handleLinkChange('productsLinks', idx, 'label', e.target.value)}
                        className="w-full bg-transparent text-xs text-white outline-none border-b border-white/10 pb-1 focus:border-blue-400"
                      />
                      <input
                        type="text"
                        placeholder="/#featured"
                        value={item.href}
                        onChange={(e) => handleLinkChange('productsLinks', idx, 'href', e.target.value)}
                        className="w-full bg-transparent text-[11px] font-mono text-white/50 outline-none focus:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink('productsLinks', idx)}
                      className="p-1.5 text-white/30 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Column */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1b] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-semibold">
                  Company Column
                </h3>
                <button
                  type="button"
                  onClick={() => handleAddLink('companyLinks')}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-mono"
                >
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              </div>

              <div className="space-y-2.5">
                {(form.companyLinks || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        placeholder="Label"
                        value={item.label}
                        onChange={(e) => handleLinkChange('companyLinks', idx, 'label', e.target.value)}
                        className="w-full bg-transparent text-xs text-white outline-none border-b border-white/10 pb-1 focus:border-blue-400"
                      />
                      <input
                        type="text"
                        placeholder="/about"
                        value={item.href}
                        onChange={(e) => handleLinkChange('companyLinks', idx, 'href', e.target.value)}
                        className="w-full bg-transparent text-[11px] font-mono text-white/50 outline-none focus:text-white"
                      />
                      {item.href?.startsWith('/') && !item.href.includes('#') && (
                        <div className="pt-1">
                          <Link
                            href={`/admin/pages?slug=${item.href.replace('/', '')}`}
                            className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-mono"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Page Content &rarr;</span>
                          </Link>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink('companyLinks', idx)}
                      className="p-1.5 text-white/30 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Column */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1b] p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                  Legal Column
                </h3>
                <button
                  type="button"
                  onClick={() => handleAddLink('legalLinks')}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-mono"
                >
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              </div>

              <div className="space-y-2.5">
                {(form.legalLinks || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        placeholder="Label"
                        value={item.label}
                        onChange={(e) => handleLinkChange('legalLinks', idx, 'label', e.target.value)}
                        className="w-full bg-transparent text-xs text-white outline-none border-b border-white/10 pb-1 focus:border-blue-400"
                      />
                      <input
                        type="text"
                        placeholder="/terms"
                        value={item.href}
                        onChange={(e) => handleLinkChange('legalLinks', idx, 'href', e.target.value)}
                        className="w-full bg-transparent text-[11px] font-mono text-white/50 outline-none focus:text-white"
                      />
                      {item.href?.startsWith('/') && !item.href.includes('#') && (
                        <div className="pt-1">
                          <Link
                            href={`/admin/pages?slug=${item.href.replace('/', '')}`}
                            className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-mono"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Page Content &rarr;</span>
                          </Link>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink('legalLinks', idx)}
                      className="p-1.5 text-white/30 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Live Preview */}
        {activeTab === 'preview' && (
          <div className="rounded-2xl border border-white/[0.08] bg-black p-6 sm:p-10 space-y-12">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Footer Preview
              </span>
              <span className="text-xs text-white/40">Displays real-time rendered output</span>
            </div>

            {/* Top Brand Statement & Newsletter */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="space-y-3 max-w-xl">
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                  <span>{form.brandName || 'DavinciWaleBhaiya'}</span>
                </div>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
                  {form.brandTagline || 'Precision color science, optical DCTLs, and timeline utilities for professional colorists and video editors.'}
                </p>
              </div>

              <div className="w-full lg:w-auto min-w-[320px] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                  {form.newsletterHeading || 'Direct Release Dispatch'}
                </span>
                <div className="flex gap-2">
                  <input
                    type="email"
                    disabled
                    placeholder={form.newsletterPlaceholder || 'editor@studio.com'}
                    className="bg-[#0a0a0a] border border-white/[0.1] rounded-lg px-3.5 py-2 text-xs text-white placeholder-white/30 flex-1 opacity-80"
                  />
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg opacity-80"
                  >
                    {form.newsletterButtonText || 'Join'}
                  </button>
                </div>
              </div>
            </div>

            {/* Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/[0.06] text-xs font-sans">
              <div className="space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-semibold">Products</div>
                <ul className="space-y-2 text-white/60">
                  {(form.productsLinks || []).map((l, i) => (
                    <li key={i}>{l.label}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-semibold">Company</div>
                <ul className="space-y-2 text-white/60">
                  {(form.companyLinks || []).map((l, i) => (
                    <li key={i}>{l.label}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-semibold">Legal</div>
                <ul className="space-y-2 text-white/60">
                  {(form.legalLinks || []).map((l, i) => (
                    <li key={i}>{l.label}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-semibold">Connect</div>
                <ul className="space-y-2 text-white/60">
                  {form.supportEmail && <li className="text-blue-400">{form.supportEmail}</li>}
                  <li>Account & Downloads</li>
                  {form.youtubeUrl && <li>YouTube Channel</li>}
                  {form.instagramUrl && <li>Instagram</li>}
                  {form.twitterUrl && <li>Twitter / X</li>}
                  {form.discordUrl && <li>Discord Community</li>}
                </ul>
              </div>
            </div>

            {/* Bottom Copyright */}
            <div className="pt-8 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/40">
              <div>&copy; {new Date().getFullYear()} {form.copyrightText}</div>
              <div className="flex items-center space-x-3 text-[10px]">
                <span>Terms</span>
                <span>&bull;</span>
                <span>Privacy</span>
                <span>&bull;</span>
                <span>Refunds</span>
                <span>&bull;</span>
                <span>Shipping</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button at Bottom */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-xl shadow-blue-500/25 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes...' : 'Save Footer Settings'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
