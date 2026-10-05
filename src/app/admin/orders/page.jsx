'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Mail, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { AdminLayout, useAdmin } from '../AdminShell';

export default function OrdersPage() {
  const { toast } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      toast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWithRazorpay = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/orders/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.reconciledCount > 0) {
          toast(`Successfully reconciled ${data.reconciledCount} captured order(s) and dispatched emails!`, 'success');
        } else {
          toast('All orders are up to date with Razorpay.', 'info');
        }
        loadOrders();
      } else {
        toast('Sync with Razorpay failed', 'error');
      }
    } catch {
      toast('Network error during sync', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleResendEmail = async (orderId, customerEmail) => {
    setSendingId(orderId);
    try {
      const res = await fetch('/api/admin/orders/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(`Download email dispatched to ${customerEmail || 'customer'}!`, 'success');
      } else {
        toast(data.error || 'Failed to send email', 'error');
      }
    } catch {
      toast('Network error sending email', 'error');
    } finally {
      setSendingId(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <AdminLayout title="Orders">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 border-b border-white/[0.08] pb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">
            Business / Payments & Delivery
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-semibold text-white">Orders & Deliveries</h2>
          <p className="mt-1 text-xs text-white/50">
            Realtime verified transactions, customer licenses, and automated file delivery logs.
          </p>
        </div>

        <button
          onClick={handleSyncWithRazorpay}
          disabled={syncing}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing with Razorpay...' : 'Sync with Razorpay'}</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[.08] bg-[#0a0f1b]">
        <table className="w-full min-w-[880px] text-left text-xs font-sans">
          <thead className="bg-black/40 text-white/40 font-mono text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
            <tr>
              <th className="px-4 py-3.5">Order Number</th>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5">Purchased Product</th>
              <th className="px-4 py-3.5">Amount</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {orders.map((order) => {
              const isPaid = order.status === 'PAID';
              const customerEmail = order.user?.email || order.userId;
              const customerName = order.user?.name;

              return (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-mono text-white font-medium">
                    {order.orderNumber}
                    {order.razorpayPaymentId && (
                      <span className="block text-[10px] text-white/30 font-mono mt-0.5">
                        {order.razorpayPaymentId}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-white block font-medium">{customerEmail}</span>
                    {customerName && <span className="text-[11px] text-white/40 block">{customerName}</span>}
                  </td>
                  <td className="px-4 py-3.5 text-white/80">
                    {order.items?.map((i) => i.productName).join(', ') || 'Auto Tracer'}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-white font-medium">
                    {order.currency || 'INR'} {order.total?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PAID</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>PENDING</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-white/40 text-[11px] font-mono">
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {isPaid ? (
                      <button
                        onClick={() => handleResendEmail(order.id, customerEmail)}
                        disabled={sendingId === order.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-medium text-white/80 hover:text-white transition-colors"
                        title="Re-send download zip package to customer email"
                      >
                        <Mail className={`w-3.5 h-3.5 text-blue-400 ${sendingId === order.id ? 'animate-pulse' : ''}`} />
                        <span>{sendingId === order.id ? 'Sending...' : 'Resend Files'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSyncWithRazorpay}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-mono underline"
                      >
                        Verify Payment
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && !orders.length && (
          <div className="p-12 text-center text-xs text-white/40">No orders recorded yet.</div>
        )}
      </div>
    </AdminLayout>
  );
}
