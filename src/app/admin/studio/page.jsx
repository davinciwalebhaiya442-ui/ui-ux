'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '../AdminShell';
import {
  BriefcaseBusiness,
  Mail,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  User,
} from 'lucide-react';

export default function StudioAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/studio?_t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load studio requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/studio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this studio request?')) return;
    try {
      const res = await fetch(`/api/admin/studio?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete request:', err);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.projectDetails?.toLowerCase().includes(q) ||
        item.requestType?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [items, filterStatus, searchQuery]);

  const newCount = items.filter((i) => i.status === 'NEW').length;
  const inReviewCount = items.filter((i) => i.status === 'IN_REVIEW').length;
  const contactedCount = items.filter((i) => i.status === 'CONTACTED').length;

  return (
    <AdminLayout title="Studio Requests">
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">
              Business / Creative Inquiries
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-white tracking-tight">
              Studio Project Briefs
            </h2>
            <p className="mt-1 text-xs text-white/50">
              Commercial campaigns, custom look development, and color grading inquiries.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white/80 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1b]/80 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
              Total Inquiries
            </span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {items.length}
            </span>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 block">
              New / Pending
            </span>
            <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
              {newCount}
            </span>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400/80 block">
              In Review
            </span>
            <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
              {inReviewCount}
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 block">
              Contacted
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              {contactedCount}
            </span>
          </div>
        </div>

        {/* Controls: Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto scrollbar-none">
            {['ALL', 'NEW', 'IN_REVIEW', 'CONTACTED', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {st === 'ALL' ? 'All' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by name, email or brief..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070b15] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors font-sans"
            />
          </div>
        </div>

        {/* Request Cards / List */}
        {loading ? (
          <div className="py-20 text-center border border-white/[0.08] rounded-2xl bg-[#0a0f1b]/50">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-400 mb-2" />
            <p className="text-xs font-mono text-white/50">Loading studio briefs...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center border border-white/[0.08] rounded-2xl bg-[#0a0f1b]/50 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-white/40">
              <BriefcaseBusiness className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">No Studio Inquiries Found</h4>
            <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
              {searchQuery || filterStatus !== 'ALL'
                ? 'No requests match your current search/filter criteria.'
                : 'When prospective clients submit creative briefs on the Studio section, their inquiries will appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/[0.08] bg-[#0a0f1b] p-6 space-y-4 shadow-xl hover:border-white/[0.15] transition-all"
              >
                {/* Top Meta Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-xs">
                      {item.name?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        <a
                          href={`mailto:${item.email}?subject=DaVinci Wale Bhaiya Studio Inquiry - ${encodeURIComponent(item.requestType)}`}
                          className="text-white/50 hover:text-blue-400 transition-colors inline-flex items-center gap-1 text-xs font-normal"
                          title="Click to email client"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{item.email}</span>
                        </a>
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-white/40 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                        item.status === 'NEW'
                          ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                          : item.status === 'IN_REVIEW'
                          ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                          : item.status === 'CONTACTED'
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                          : 'border-white/20 bg-white/5 text-white/40'
                      }`}
                    >
                      {item.status}
                    </span>

                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="bg-[#070b15] border border-white/[0.12] rounded-lg px-2.5 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                    >
                      <option value="NEW">Set NEW</option>
                      <option value="IN_REVIEW">Set IN_REVIEW</option>
                      <option value="CONTACTED">Set CONTACTED</option>
                      <option value="ARCHIVED">Set ARCHIVED</option>
                    </select>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                      title="Delete request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scope & Budget Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono font-medium">
                    Scope: {item.requestType}
                  </span>
                  {item.budget && (
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-medium">
                      Budget: {item.budget}
                    </span>
                  )}
                  {item.portfolioUrl && (
                    <a
                      href={item.portfolioUrl.startsWith('http') ? item.portfolioUrl : `https://${item.portfolioUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:text-purple-200 text-xs font-mono transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Portfolio / Cut</span>
                    </a>
                  )}
                </div>

                {/* Project Details */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-sans text-white/80 leading-relaxed whitespace-pre-wrap">
                  {item.projectDetails}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
