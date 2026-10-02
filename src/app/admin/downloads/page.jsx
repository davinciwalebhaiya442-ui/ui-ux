'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '../AdminShell';
import {
  Download,
  ShoppingBag,
  Sparkles,
  Users,
  Search,
  RefreshCw,
  Mail,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PAID' | 'FREE'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/downloads?_t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setDownloads(data.downloads || []);
      }
    } catch (err) {
      console.error('Failed to load downloads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const filteredDownloads = useMemo(() => {
    return downloads.filter((d) => {
      const isPaid = d.accessType === 'PURCHASE' || d.product?.type === 'PAID';
      const matchesTab =
        activeTab === 'ALL' ||
        (activeTab === 'PAID' && isPaid) ||
        (activeTab === 'FREE' && !isPaid);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.user?.email?.toLowerCase().includes(q) ||
        d.user?.name?.toLowerCase().includes(q) ||
        d.product?.name?.toLowerCase().includes(q) ||
        d.accessType?.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [downloads, activeTab, searchQuery]);

  const paidCount = downloads.filter(
    (d) => d.accessType === 'PURCHASE' || d.product?.type === 'PAID'
  ).length;
  const freeCount = downloads.filter(
    (d) => d.accessType !== 'PURCHASE' && d.product?.type !== 'PAID'
  ).length;
  const uniqueUsersCount = new Set(
    downloads.map((d) => d.user?.email || d.user?.userId).filter(Boolean)
  ).size;

  return (
    <AdminLayout title="Downloads">
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">
              Catalogue / Asset Deliveries
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-white tracking-tight">
              Download & Acquisition History
            </h2>
            <p className="mt-1 text-xs text-white/50">
              Log of all digital asset downloads across both paid orders and direct free downloads.
            </p>
          </div>

          <button
            onClick={fetchDownloads}
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
              Total Deliveries
            </span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {downloads.length}
            </span>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400/80 block">
              Paid Purchases
            </span>
            <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
              {paidCount}
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 block">
              Free Downloads
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              {freeCount}
            </span>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400/80 block">
              Unique Users
            </span>
            <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">
              {uniqueUsersCount}
            </span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              All Deliveries ({downloads.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PAID')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'PAID'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Paid Purchases ({paidCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FREE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'FREE'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Free Downloads ({freeCount})
            </button>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search user, product, or access..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070b15] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors font-sans"
            />
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0a0f1b] shadow-xl">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="text-[11px] font-mono uppercase tracking-wider text-white/40 bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                <th className="px-5 py-3.5 font-medium">User / Customer</th>
                <th className="px-5 py-3.5 font-medium">Product Asset</th>
                <th className="px-5 py-3.5 font-medium">Acquisition Type</th>
                <th className="px-5 py-3.5 font-medium text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-white/40 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                    <span>Loading download records...</span>
                  </td>
                </tr>
              ) : filteredDownloads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-white/40 font-mono">
                    No download records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredDownloads.map((d) => {
                  const isPaid = d.accessType === 'PURCHASE' || d.product?.type === 'PAID';
                  const email = d.user?.email || 'Customer';

                  return (
                    <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              isPaid
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {email.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <a
                              href={`mailto:${email}`}
                              className="text-white font-medium hover:text-blue-300 transition-colors block truncate"
                              title={`Email ${email}`}
                            >
                              {email}
                            </a>
                            {d.user?.name && (
                              <span className="text-[10px] text-white/40 block truncate">
                                {d.user.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{d.product?.name || 'Asset'}</span>
                          {d.product?.slug && (
                            <a
                              href={`/product/${d.product.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/30 hover:text-white transition-colors"
                              title="View product page"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Access / Type Badge */}
                      <td className="px-5 py-3.5">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                            <ShoppingBag className="w-3 h-3 text-blue-400" />
                            <span>PAID PURCHASE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                            <Download className="w-3 h-3 text-emerald-400" />
                            <span>FREE DOWNLOAD</span>
                          </span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="px-5 py-3.5 text-right font-mono text-[11px] text-white/50">
                        {new Date(d.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
