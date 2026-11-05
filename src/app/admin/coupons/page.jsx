'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  TicketPercent,
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  Calendar,
  Sparkles,
  TrendingUp,
  Tag,
  AlertCircle,
  Loader2,
  Search,
  Percent,
  DollarSign,
  X,
} from 'lucide-react';
import { AdminLayout, useAdmin } from '../AdminShell';
import { notifyAdminChange } from '@/lib/events';

export default function CouponsAdminPage() {
  const { toast, confirm } = useAdmin();
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
    totalDiscountGiven: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Coupon Form State
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountPercent: 20,
    discountInr: 200,
    discountUsd: 5,
    minOrderInr: 0,
    minOrderUsd: 0,
    maxUses: '',
    expiresAt: '',
    isActive: true,
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
        if (data.stats) setStats(data.stats);
      } else {
        toast(data.error || 'Failed to load coupons', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Failed to load coupons from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast(`Copied code "${code}" to clipboard`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateRandomCode = (prefix = 'SAVE') => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({
      ...prev,
      code: `${prefix}${rand}`,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast('Please enter a coupon code', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountPercent: form.discountType === 'PERCENTAGE' ? Number(form.discountPercent) : null,
        discountInr: form.discountType === 'FIXED' ? Number(form.discountInr) : null,
        discountUsd: form.discountType === 'FIXED' ? Number(form.discountUsd) : null,
        minOrderInr: Number(form.minOrderInr) || 0,
        minOrderUsd: Number(form.minOrderUsd) || 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: form.isActive,
      };

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create coupon');
      }

      toast(`Coupon "${payload.code}" created successfully!`, 'success');
      setShowModal(false);
      setForm({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountPercent: 20,
        discountInr: 200,
        discountUsd: 5,
        minOrderInr: 0,
        minOrderUsd: 0,
        maxUses: '',
        expiresAt: '',
        isActive: true,
      });
      notifyAdminChange();
      loadCoupons();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const nextState = !coupon.isActive;
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update coupon');

      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: nextState } : c))
      );
      toast(`Coupon "${coupon.code}" ${nextState ? 'activated' : 'deactivated'}`, 'success');
      notifyAdminChange();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (coupon) => {
    const ok = await confirm({
      title: `Delete Coupon "${coupon.code}"?`,
      message:
        coupon.usedCount > 0
          ? `This coupon has been used in ${coupon.usedCount} orders. It will be permanently deactivated so order history remains intact.`
          : `Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`,
      confirmText: 'Delete Coupon',
      destructive: true,
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');

      toast(data.message || `Coupon "${coupon.code}" removed`, 'success');
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      notifyAdminChange();
      loadCoupons();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filteredCoupons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [coupons, search]);

  const getCouponStatus = (c) => {
    if (!c.isActive) {
      return { label: 'Disabled', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
    }
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
      return { label: 'Expired', color: 'bg-amber-950/40 text-amber-300 border-amber-800/40' };
    }
    if (c.maxUses && c.usedCount >= c.maxUses) {
      return { label: 'Limit Reached', color: 'bg-rose-950/40 text-rose-300 border-rose-800/40' };
    }
    return { label: 'Active', color: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        
        {/* Header & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <TicketPercent className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Coupons & Promo Codes
                </h1>
                <p className="text-xs text-white/50">
                  Create discount codes for festive campaigns, influencer launches, and seasonal flash sales.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              generateRandomCode('PROMO');
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>
        </div>

        {/* High-level Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#090d16] space-y-1.5">
            <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider block">
              Active Coupons
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono flex items-center gap-2">
              <span>{stats.activeCoupons}</span>
              <span className="text-xs font-normal text-white/40">/ {stats.totalCoupons} total</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#090d16] space-y-1.5">
            <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider block">
              Total Redemptions
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
              {stats.totalRedemptions}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#090d16] space-y-1.5">
            <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider block">
              Discount Given (INR)
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
              ₹{stats.totalDiscountGiven.toLocaleString()}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#090d16] space-y-1.5">
            <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider block">
              Dual-Currency
            </span>
            <div className="text-sm font-medium text-white/80 pt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-mono font-bold">INR (₹)</span>
              <span className="text-white/30">&bull;</span>
              <span className="text-blue-400 font-mono font-bold">USD ($)</span>
              <span className="text-xs text-white/40 font-normal">Auto-handled</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promo codes or descriptions..."
            className="w-full rounded-xl border border-white/10 bg-[#090d16] pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Coupons List / Table */}
        <div className="rounded-2xl border border-white/10 bg-[#090d16] overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-white/40 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Loading coupons from database...</span>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-white/40">
                <Tag className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-white/80">No coupons found</p>
              <p className="text-xs text-white/40 max-w-sm mx-auto">
                {search ? 'Try adjusting your search query.' : 'Click "Create New Coupon" to generate your first promotional code.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-white/50">
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Usage / Limit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-xs">
                  {filteredCoupons.map((c) => {
                    const status = getCouponStatus(c);
                    const usagePercent = c.maxUses ? Math.min(100, Math.round((c.usedCount / c.maxUses) * 100)) : null;

                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* Code + Description */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm tracking-wide px-2 py-0.5 rounded bg-white/[0.06] border border-white/10">
                              {c.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(c.code, c.id)}
                              className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Copy promo code"
                            >
                              {copiedId === c.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {c.description && (
                            <p className="text-[11px] text-white/50 mt-1 truncate max-w-xs">
                              {c.description}
                            </p>
                          )}
                          {(c.minOrderInr > 0 || c.minOrderUsd > 0) && (
                            <span className="inline-block mt-1 text-[10px] font-mono text-blue-300/80 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/40">
                              Min: ₹{c.minOrderInr} / ${c.minOrderUsd}
                            </span>
                          )}
                        </td>

                        {/* Discount Value */}
                        <td className="py-3.5 px-4 font-mono font-semibold">
                          {c.discountType === 'PERCENTAGE' ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Percent className="w-3.5 h-3.5" />
                              <span>{c.discountPercent}% OFF</span>
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1">
                              <span>₹{c.discountInr} / ${c.discountUsd} OFF</span>
                            </span>
                          )}
                        </td>

                        {/* Usage Progress */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
                              <span>{c.usedCount} used</span>
                              <span className="text-white/40">
                                {c.maxUses ? `/ ${c.maxUses} max` : 'Unlimited'}
                              </span>
                            </div>
                            {c.maxUses && (
                              <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    usagePercent >= 100 ? 'bg-rose-500' : usagePercent > 70 ? 'bg-amber-400' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono border ${status.color}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            <span>{status.label}</span>
                          </span>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3.5 px-4 text-xs font-mono text-white/60">
                          {c.expiresAt ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-white/30" />
                              <span>{new Date(c.expiresAt).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-white/30">Never expires</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(c)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                c.isActive
                                  ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40'
                                  : 'border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                              }`}
                              title={c.isActive ? 'Deactivate coupon' : 'Activate coupon'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Delete coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* CREATE NEW COUPON MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#090d16] p-6 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <TicketPercent className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Create Promotional Coupon</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              
              {/* Code Input & Random Generator */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider">
                  Coupon Code <span className="text-blue-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      required
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })
                      }
                      placeholder="e.g. DIWALI30, CREATIVE50"
                      className="w-full rounded-xl border border-white/15 bg-black/60 pl-9 pr-3 py-2 text-xs font-mono font-bold text-white uppercase placeholder-white/30 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => generateRandomCode('VIP')}
                    className="px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] text-[11px] font-mono text-white/70 hover:text-white transition-colors shrink-0"
                  >
                    Random Code
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-white/50 uppercase tracking-wider">
                  Internal Description / Campaign Note
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Diwali Flash Sale - 30% Off on All Film LUTs"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Discount Type Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider">
                  Discount Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discountType: 'PERCENTAGE' })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      form.discountType === 'PERCENTAGE'
                        ? 'border-blue-500 bg-blue-950/40 text-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.25)]'
                        : 'border-white/10 bg-black/40 text-white/50 hover:text-white'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    <span>Percentage (% OFF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discountType: 'FIXED' })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      form.discountType === 'FIXED'
                        ? 'border-blue-500 bg-blue-950/40 text-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.25)]'
                        : 'border-white/10 bg-black/40 text-white/50 hover:text-white'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Fixed Amount (₹ / $)</span>
                  </button>
                </div>
              </div>

              {/* Discount Amount Inputs */}
              {form.discountType === 'PERCENTAGE' ? (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider">
                    Discount Percentage (%) <span className="text-blue-400">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={form.discountPercent}
                      onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                      className="w-32 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-mono font-bold text-white focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex gap-1.5">
                      {[10, 20, 30, 50].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setForm({ ...form, discountPercent: preset })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                            Number(form.discountPercent) === preset
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/[0.05] text-white/60 hover:text-white'
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider">
                      Discount in INR (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.discountInr}
                      onChange={(e) => setForm({ ...form, discountInr: e.target.value })}
                      placeholder="e.g. 200"
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-mono font-bold text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider">
                      Discount in USD ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.discountUsd}
                      onChange={(e) => setForm({ ...form, discountUsd: e.target.value })}
                      placeholder="e.g. 5"
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-mono font-bold text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Usage Limit & Expiry Date */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-white/50 uppercase tracking-wider">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-white/40">Leave empty for unlimited</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-white/50 uppercase tracking-wider">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-white/40">Optional expiry</p>
                </div>
              </div>

              {/* Minimum Order Value (Optional) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-white/50 uppercase tracking-wider">
                    Min Order INR (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderInr}
                    onChange={(e) => setForm({ ...form, minOrderInr: e.target.value })}
                    placeholder="0 (No minimum)"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-white/50 uppercase tracking-wider">
                    Min Order USD ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderUsd}
                    onChange={(e) => setForm({ ...form, minOrderUsd: e.target.value })}
                    placeholder="0 (No minimum)"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-white/20 bg-black text-blue-500 focus:ring-blue-500"
                />
                <span className="text-xs text-white/80">
                  Activate this coupon code immediately upon creation
                </span>
              </label>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Coupon</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
