'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Shield,
  RefreshCw,
  Truck,
  Info,
  Mail,
  Save,
  ExternalLink,
  Eye,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AdminLayout, useAdmin } from '../AdminShell';
import MarkdownContent from '@/components/MarkdownContent';
import { DEFAULT_SITE_PAGES } from '@/lib/sitePagesDefaults';

const PAGE_TABS = [
  { slug: 'terms', name: 'Terms & Conditions', icon: FileText, href: '/terms' },
  { slug: 'privacy', name: 'Privacy Policy', icon: Shield, href: '/privacy' },
  { slug: 'refund-policy', name: 'Refund & Cancellation', icon: RefreshCw, href: '/refund-policy' },
  { slug: 'shipping-policy', name: 'Shipping & Delivery', icon: Truck, href: '/shipping-policy' },
  { slug: 'about', name: 'About Us', icon: Info, href: '/about' },
  { slug: 'contact', name: 'Contact Page Info', icon: Mail, href: '/contact' },
];

function PagesEditorContent() {
  const { toast, confirm } = useAdmin();
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get('slug') || 'terms';

  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'edit' | 'preview' | 'split'
  const [pageData, setPageData] = useState({
    title: '',
    badge: '',
    lastUpdated: '',
    description: '',
    content: '',
  });

  // Handle slug change from query param
  useEffect(() => {
    const slugParam = searchParams.get('slug');
    if (slugParam && PAGE_TABS.some((t) => t.slug === slugParam)) {
      setActiveSlug(slugParam);
    }
  }, [searchParams]);

  // Load current page data from API
  const loadPage = async (slug) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.page) {
          setPageData({
            title: data.page.title || '',
            badge: data.page.badge || '',
            lastUpdated: data.page.lastUpdated || '',
            description: data.page.description || '',
            content: data.page.content || '',
          });
        }
      } else {
        // Fallback to defaults
        const def = DEFAULT_SITE_PAGES[slug] || {};
        setPageData({
          title: def.title || '',
          badge: def.badge || '',
          lastUpdated: def.lastUpdated || '',
          description: def.description || '',
          content: def.content || '',
        });
      }
    } catch {
      const def = DEFAULT_SITE_PAGES[slug] || {};
      setPageData({
        title: def.title || '',
        badge: def.badge || '',
        lastUpdated: def.lastUpdated || '',
        description: def.description || '',
        content: def.content || '',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(activeSlug);
  }, [activeSlug]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${activeSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });

      if (res.ok) {
        toast(`Page "${pageData.title}" updated successfully!`, 'success');
      } else {
        const err = await res.json();
        toast(err.error || 'Failed to update page', 'error');
      }
    } catch (err) {
      toast('Network error saving page', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    const ok = await confirm({
      title: 'Reset to Default Content?',
      message: `Are you sure you want to reset "${activeSlug}" back to the default original template text? Any custom edits will be replaced.`,
      confirmText: 'Reset to Default',
      destructive: true,
    });

    if (!ok) return;

    const def = DEFAULT_SITE_PAGES[activeSlug];
    if (def) {
      setPageData({
        title: def.title,
        badge: def.badge,
        lastUpdated: def.lastUpdated,
        description: def.description,
        content: def.content,
      });
      toast('Reset to default text. Remember to click Save to publish changes.', 'info');
    }
  };

  const currentTab = PAGE_TABS.find((t) => t.slug === activeSlug) || PAGE_TABS[0];
  const Icon = currentTab.icon;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-400">
            Site / Page Content Management
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Site Pages & Legal Content</span>
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Edit text, legal clauses, shipping terms, return policies, and brand statements across all linked pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={currentTab.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <span>View Live Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Page'}</span>
          </button>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
        {PAGE_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = tab.slug === activeSlug;
          return (
            <button
              key={tab.slug}
              onClick={() => setActiveSlug(tab.slug)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'bg-[#090d16] text-white/60 hover:text-white hover:bg-white/[0.04] border border-white/[0.06]'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.name}</span>
              <span className="text-[10px] font-mono text-white/30 ml-1">({tab.href})</span>
            </button>
          );
        })}
      </div>

      {/* Editor Body */}
      {loading ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#080c16] p-16 text-center text-xs text-white/40">
          Loading page content...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metadata Section */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#080c16] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2 text-white">
                <Icon className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold">Page Details: {currentTab.name}</h3>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[11px] text-white/40 hover:text-red-400 flex items-center space-x-1 transition-colors"
                title="Restore default text template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block">
                  Page Title
                </label>
                <input
                  type="text"
                  value={pageData.title}
                  onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                  placeholder="e.g. Terms & Conditions"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={pageData.badge}
                  onChange={(e) => setPageData({ ...pageData, badge: e.target.value })}
                  placeholder="e.g. Legal Agreement"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block">
                  Last Updated Date
                </label>
                <input
                  type="text"
                  value={pageData.lastUpdated}
                  onChange={(e) => setPageData({ ...pageData, lastUpdated: e.target.value })}
                  placeholder="e.g. October 1, 2026"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 block">
                Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={pageData.description}
                onChange={(e) => setPageData({ ...pageData, description: e.target.value })}
                placeholder="Brief summary displayed under the header..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Content Editor & Live Preview */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#080c16] overflow-hidden">
            {/* View Mode Switcher & Format Cheatsheet */}
            <div className="px-6 py-3 border-b border-white/[0.06] bg-black/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1.5 ${
                    viewMode === 'edit' ? 'bg-blue-600 text-white font-medium' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editor Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-colors ${
                    viewMode === 'split' ? 'bg-blue-600 text-white font-medium' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span>Split View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1.5 ${
                    viewMode === 'preview' ? 'bg-blue-600 text-white font-medium' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>

              <div className="text-[11px] text-white/40 flex items-center space-x-2">
                <span>Formatting supported:</span>
                <code className="bg-white/10 px-1 py-0.5 rounded text-blue-300">## Heading</code>
                <code className="bg-white/10 px-1 py-0.5 rounded text-blue-300">**Bold**</code>
                <code className="bg-white/10 px-1 py-0.5 rounded text-blue-300">- List</code>
                <code className="bg-white/10 px-1 py-0.5 rounded text-blue-300">&gt; Notice</code>
              </div>
            </div>

            <div
              className={`p-6 ${
                viewMode === 'split'
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                  : 'grid grid-cols-1'
              }`}
            >
              {/* Textarea Editor */}
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
                    <span>PAGE CONTENT (MARKDOWN / TEXT)</span>
                    <span>{pageData.content.length} characters</span>
                  </div>
                  <textarea
                    rows={26}
                    value={pageData.content}
                    onChange={(e) => setPageData({ ...pageData, content: e.target.value })}
                    placeholder="Type or paste page content here using Markdown formatting..."
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-white/90 focus:outline-none focus:border-blue-400 leading-relaxed scrollbar-thin"
                  />
                </div>
              )}

              {/* Formatted Preview */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
                    <span>LIVE FORMATTED PREVIEW</span>
                    <span className="text-emerald-400">&bull; Realtime</span>
                  </div>
                  <div className="h-[560px] overflow-y-auto rounded-xl border border-white/10 bg-[#04060c] p-6 text-slate-300 scrollbar-thin">
                    <div className="mb-6 pb-4 border-b border-white/[0.08] space-y-2">
                      {pageData.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono tracking-widest text-blue-400 uppercase">
                          {pageData.badge}
                        </span>
                      )}
                      <h1 className="text-2xl font-bold text-white tracking-tight">
                        {pageData.title || 'Untitled Page'}
                      </h1>
                      {pageData.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {pageData.description}
                        </p>
                      )}
                      {pageData.lastUpdated && (
                        <p className="text-[10px] font-mono text-white/40">
                          Last Updated: {pageData.lastUpdated}
                        </p>
                      )}
                    </div>
                    <MarkdownContent content={pageData.content} />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Save Action */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-black/40 flex items-center justify-between">
              <span className="text-xs text-white/40">
                Any changes made here are saved directly to the database and will reflect instantly on the public website.
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-white hover:bg-white/90 text-black text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing Changes...' : 'Save & Publish Page'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PagesAdminPage() {
  return (
    <AdminLayout title="Site Pages & Legal">
      <Suspense fallback={<div className="p-12 text-center text-xs text-white/40">Loading Page Editor...</div>}>
        <PagesEditorContent />
      </Suspense>
    </AdminLayout>
  );
}
