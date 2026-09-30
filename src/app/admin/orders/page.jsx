'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '../AdminShell';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { fetch('/api/admin/orders').then((response) => response.json()).then((data) => setOrders(data.orders || [])); }, []);
  return <AdminLayout title="Orders"><div className="mb-7"><p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">Business / Payments</p><h2 className="mt-2 text-3xl font-semibold">Orders</h2><p className="mt-2 text-sm text-white/40">Verified checkout activity and purchased products.</p></div><div className="overflow-x-auto rounded-2xl border border-white/[.08] bg-[#0a0f1b]"><table className="w-full min-w-[820px] text-left text-xs"><thead className="text-white/35"><tr>{['Order', 'Customer', 'Items', 'Total', 'Status', 'Created'].map((item) => <th key={item} className="px-4 py-4">{item}</th>)}</tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t border-white/[.07]"><td className="px-4 py-3 font-medium">{order.orderNumber}</td><td className="px-4 py-3 text-white/60">{order.user?.email || order.userId}</td><td className="px-4 py-3">{order.items.length}</td><td className="px-4 py-3">{order.currency} {order.total.toLocaleString()}</td><td className="px-4 py-3">{order.status}</td><td className="px-4 py-3 text-white/45">{new Date(order.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{!orders.length && <p className="p-10 text-center text-sm text-white/40">No orders yet.</p>}</div></AdminLayout>;
}
