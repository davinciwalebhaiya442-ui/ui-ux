'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout, ProductThumb } from '../AdminShell';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Download,
  FileSpreadsheet,
  ArrowDownToLine,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'orders' | 'downloads'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);

  const fetchAnalytics = async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const handleExport = (type) => {
    setDownloadingType(type);
    setExportOpen(false);
    // Trigger download via anchor
    const link = document.createElement('a');
    link.href = `/api/admin/export?type=${type}`;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingType(null), 1500);
  };

  const s = data?.summary;
  const chartLabels = data?.chart?.labels || [];
  const chartValues =
    chartMetric === 'revenue'
      ? data?.chart?.revenue || []
      : chartMetric === 'orders'
      ? data?.chart?.orders || []
      : data?.chart?.downloads || [];

  const maxVal = Math.max(...chartValues, chartMetric === 'revenue' ? 100 : 5);
  const totalChartSum = chartValues.reduce((acc, v) => acc + v, 0);

  return (
    <AdminLayout title="Analytics & Revenue Intelligence">
      {/* Header bar */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-400 font-semibold">
              Business Intelligence / Sales Dashboard
            </p>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Analytics & Revenue
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Real-time financial performance, product leaderboard, and audience export data.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-xl text-xs">
            {[
              { label: '7D', value: '7d' },
              { label: '30D', value: '30d' },
              { label: '90D', value: '90d' },
              { label: 'All Time', value: 'all' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  period === p.value
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchAnalytics(period)}
            disabled={loading}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {exportOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setExportOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0b0f19] border border-white/10 shadow-2xl p-2 z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <p className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-white/40 border-b border-white/[0.06] mb-1">
                    Select Data Export
                  </p>

                  <button
                    onClick={() => handleExport('customers')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors text-xs group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Customers List</p>
                      <p className="text-[10px] text-white/40">Emails & total spend for marketing</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('orders')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors text-xs group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">All Orders CSV</p>
                      <p className="text-[10px] text-white/40">Tax, accounts & Razorpay IDs</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('products')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors text-xs group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Product Performance</p>
                      <p className="text-[10px] text-white/40">Units sold, downloads & revenue</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Gross Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0b1020] to-[#070b14] p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Gross Revenue</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
              {s ? `₹${s.periodRevenue.toLocaleString()}` : '—'}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-white/40">
              <span className="text-white/60">AOV: ₹{s?.averageOrderValue || 0}</span>
              <span>·</span>
              <span>All-time: ₹{(s?.allTimeRevenue || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0b1020] to-[#070b14] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Paid Orders</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-mono text-white tracking-tight">
              {s?.periodOrders ?? '—'}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-white/40">
              <span className="text-emerald-400 font-semibold">{s?.checkoutSuccessRate ?? 100}% Success</span>
              <span>·</span>
              <span>{s?.allTimeOrders ?? 0} All-time</span>
            </div>
          </div>
        </div>

        {/* Unique Customers */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0b1020] to-[#070b14] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Paying Buyers</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-mono text-white tracking-tight">
              {s?.payingCustomersCount ?? '—'}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-white/40">
              <span>{s?.totalCustomersCount ?? 0} Registered accounts</span>
            </div>
          </div>
        </div>

        {/* Total Deliveries / Downloads */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0b1020] to-[#070b14] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Digital Dispatches</span>
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Download className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-mono text-white tracking-tight">
              {s?.periodDownloads ?? '—'}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-white/40">
              <span>{s?.allTimeDownloads ?? 0} Total downloads</span>
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE & ORDERS INTERACTIVE TIMELINE CHART */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#080c16] p-6 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Performance Trajectory</h3>
            </div>
            <p className="text-xs text-white/40 mt-1">
              {chartMetric === 'revenue'
                ? `Total Revenue in selected ${period}: ₹${totalChartSum.toLocaleString()}`
                : chartMetric === 'orders'
                ? `Total Orders placed: ${totalChartSum}`
                : `Total File Downloads: ${totalChartSum}`}
            </p>
          </div>

          {/* Metric switcher tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-xl text-xs self-start sm:self-auto">
            <button
              onClick={() => setChartMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                chartMetric === 'revenue'
                  ? 'bg-emerald-500 text-black font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Revenue (₹)
            </button>
            <button
              onClick={() => setChartMetric('orders')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                chartMetric === 'orders'
                  ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Orders Count
            </button>
            <button
              onClick={() => setChartMetric('downloads')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                chartMetric === 'downloads'
                  ? 'bg-sky-500 text-black font-semibold shadow-[0_0_12px_rgba(14,165,233,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Downloads
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        {chartValues.length > 0 ? (
          <div className="pt-4">
            <div className="h-60 w-full flex items-end gap-1.5 sm:gap-2">
              {chartValues.map((val, idx) => {
                const heightPct = Math.max(6, Math.round((val / maxVal) * 100));
                const isRevenue = chartMetric === 'revenue';
                const isDownloads = chartMetric === 'downloads';

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-10 px-2.5 py-1 bg-black/95 border border-white/20 rounded-lg text-[10px] font-mono text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap shadow-xl">
                      <span className="text-white/50">{chartLabels[idx]}: </span>
                      <span className={isRevenue ? 'text-emerald-400 font-semibold' : 'text-blue-400 font-semibold'}>
                        {isRevenue ? `₹${val.toLocaleString()}` : `${val} ${chartMetric}`}
                      </span>
                    </div>

                    {/* Bar Column */}
                    <div className="w-full bg-white/[0.02] hover:bg-white/[0.06] rounded-lg transition-colors flex items-end justify-center h-48 p-0.5">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[28px] rounded-t-md transition-all ${
                          val > 0
                            ? isRevenue
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                              : isDownloads
                              ? 'bg-gradient-to-t from-sky-600 to-cyan-400 shadow-[0_0_12px_rgba(14,165,233,0.25)]'
                              : 'bg-gradient-to-t from-blue-600 to-indigo-400 shadow-[0_0_12px_rgba(37,99,235,0.25)]'
                            : 'bg-white/[0.04]'
                        }`}
                      />
                    </div>

                    {/* Date label */}
                    <span className="text-[9px] font-mono text-white/30 truncate max-w-[42px]">
                      {chartLabels[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-60 flex items-center justify-center text-xs text-white/40 font-mono">
            Awaiting order activity to display timeline chart.
          </div>
        )}
      </section>

      {/* PRODUCT LEADERBOARD & CATEGORY BREAKDOWN */}
      <div className="grid gap-6 lg:grid-cols-12 mb-8">
        {/* Products Leaderboard (8 Cols) */}
        <section className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#080c16] p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white">Top Revenue Assets</h3>
              <p className="text-xs text-white/40 mt-0.5">Products ranked by total sales revenue & download interest</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
            >
              Catalogue <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-white/40 font-mono border-b border-white/[0.06]">
                <tr>
                  <th className="pb-3 font-normal">Asset</th>
                  <th className="pb-3 font-normal">Type</th>
                  <th className="pb-3 font-normal text-right">Units Sold</th>
                  <th className="pb-3 font-normal text-right">Downloads</th>
                  <th className="pb-3 font-normal text-right">Revenue (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data?.topProducts?.length ? (
                  data.topProducts.map((p) => {
                    const maxRevenue = Math.max(...data.topProducts.map((x) => x.revenue), 1);
                    const revPct = Math.round((p.revenue / maxRevenue) * 100);

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <ProductThumb product={p} className="w-10 h-10 shrink-0 rounded-lg" />
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                                {p.name}
                              </p>
                              <p className="text-[10px] text-white/40 font-mono mt-0.5">
                                {p.category} · {p.price ? `₹${p.price}` : 'FREE'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                              p.type === 'FREE'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            }`}
                          >
                            {p.type}
                          </span>
                        </td>

                        <td className="py-3.5 text-right font-mono font-medium text-white/80">
                          {p.salesCount}
                        </td>

                        <td className="py-3.5 text-right font-mono text-white/60">
                          {p.downloadsCount}
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-semibold text-emerald-400">
                              ₹{p.revenue.toLocaleString()}
                            </span>
                            {p.revenue > 0 && (
                              <div className="w-20 bg-white/5 rounded-full h-1 mt-1 overflow-hidden">
                                <div
                                  className="bg-emerald-400 h-full rounded-full"
                                  style={{ width: `${revPct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/40 font-mono">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Category Breakdown (4 Cols) */}
        <section className="lg:col-span-4 rounded-2xl border border-white/[0.08] bg-[#080c16] p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Revenue by Category</h3>
            </div>
            <p className="text-xs text-white/40 mb-5">Distribution across creative formats</p>

            <div className="space-y-4">
              {data?.categoryBreakdown?.length ? (
                data.categoryBreakdown.map((cat) => {
                  const totalCatRevenue = data.categoryBreakdown.reduce((sum, c) => sum + c.revenue, 0) || 1;
                  const catPct = Math.round((cat.revenue / totalCatRevenue) * 100);

                  return (
                    <div key={cat.category} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white">{cat.category}</span>
                        <span className="font-mono font-semibold text-emerald-400">
                          ₹{cat.revenue.toLocaleString()}
                        </span>
                      </div>

                      <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full"
                          style={{ width: `${Math.max(8, catPct)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-white/40">
                        <span>{cat.sales} paid orders</span>
                        <span>{cat.downloads} downloads</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="p-6 text-center text-xs text-white/40 font-mono">No category data recorded.</p>
              )}
            </div>
          </div>

          {/* Quick CSV Export Box */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-[11px] text-white/50 mb-3">Download complete raw records for off-site reporting:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleExport('customers')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white text-[11px] font-medium transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Customers</span>
              </button>

              <button
                onClick={() => handleExport('orders')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white text-[11px] font-medium transition-colors"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                <span>Orders CSV</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
