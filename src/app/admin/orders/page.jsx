'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '../AdminShell';
import {
  ShoppingBag,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = '/api/admin/export?type=orders';
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.userId?.toLowerCase().includes(q) ||
        o.razorpayPaymentId?.toLowerCase().includes(q) ||
        (o.items || []).some((i) => i.productName?.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  const totalFilteredAmount = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status === 'PAID')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [filteredOrders]);

  return (
    <AdminLayout title="Orders & Transactions">
      {/* Top Header */}
      <div className="mb-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-400 font-semibold">
              Business / Transactions
            </p>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Orders Repository
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Verified checkouts, customer transaction audit, and payment logs.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Orders CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl border border-white/[0.08] bg-[#080c16]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by order #, email, customer, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-xl text-xs self-start sm:self-auto">
          {['ALL', 'PAID', 'PENDING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="mb-4 flex items-center justify-between px-2 text-xs text-white/50 font-mono">
        <span>
          Showing <strong className="text-white">{filteredOrders.length}</strong> of {orders.length} orders
        </span>
        <span>
          Paid Total: <strong className="text-emerald-400">₹{totalFilteredAmount.toLocaleString()}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#080c16] shadow-2xl">
        <table className="w-full min-w-[880px] text-left text-xs">
          <thead className="text-white/40 font-mono border-b border-white/[0.06] bg-white/[0.01]">
            <tr>
              <th className="px-5 py-4 font-normal">Order Number</th>
              <th className="px-4 py-4 font-normal">Customer</th>
              <th className="px-4 py-4 font-normal">Products / Items</th>
              <th className="px-4 py-4 font-normal">Amount</th>
              <th className="px-4 py-4 font-normal">Status</th>
              <th className="px-4 py-4 font-normal">Payment Reference</th>
              <th className="px-5 py-4 font-normal text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredOrders.length ? (
              filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Order Number */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-white">{o.orderNumber}</span>
                      <button
                        onClick={() => handleCopy(o.orderNumber, o.id)}
                        className="p-1 hover:text-blue-400 text-white/30 transition-colors"
                        title="Copy order number"
                      >
                        {copiedId === o.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-white">{o.user?.name || 'Customer'}</p>
                    <p className="text-[11px] text-white/50 font-mono mt-0.5">{o.user?.email || o.userId}</p>
                  </td>

                  {/* Items */}
                  <td className="px-4 py-3.5 max-w-[240px]">
                    <div className="truncate">
                      {(o.items || []).map((i) => i.productName).join(', ') || `${o.items?.length || 0} items`}
                    </div>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      {o.items?.length || 0} item{o.items?.length === 1 ? '' : 's'}
                    </p>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-semibold text-emerald-400">
                      ₹{o.total?.toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium ${
                        o.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : o.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}
                    >
                      {o.status === 'PAID' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {o.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-400" />}
                      {o.status === 'FAILED' && <XCircle className="w-3 h-3 text-rose-400" />}
                      {o.status}
                    </span>
                  </td>

                  {/* Razorpay Ref */}
                  <td className="px-4 py-3.5">
                    {o.razorpayPaymentId ? (
                      <span className="font-mono text-[10px] text-white/60 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                        {o.razorpayPaymentId}
                      </span>
                    ) : (
                      <span className="text-[11px] text-white/30">—</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-right font-mono text-[11px] text-white/40">
                    {new Date(o.createdAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-white/40 font-mono">
                  {loading ? 'Loading orders repository...' : 'No orders matched your search or filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
