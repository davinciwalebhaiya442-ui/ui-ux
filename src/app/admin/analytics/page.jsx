'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '../AdminShell';

export default function AnalyticsPage() {
  const [data, setData] = useState({ totals: {}, events: [] });
  useEffect(() => { fetch('/api/admin/analytics').then((response) => response.json()).then(setData); }, []);
  return <AdminLayout title="Analytics"><div className="mb-7"><p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">Business / Insights</p><h2 className="mt-2 text-3xl font-semibold">Analytics</h2></div><div className="grid gap-4 sm:grid-cols-3">{[['Products', data.totals.products], ['Orders', data.totals.orders], ['Downloads', data.totals.downloads]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-5"><p className="text-xs text-white/45">{label}</p><p className="mt-3 text-3xl font-semibold">{value ?? '—'}</p></div>)}</div><section className="mt-6 rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-5"><p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/35">Tracked events</p>{data.events.length ? <div className="space-y-2">{data.events.map((event) => <div key={event.name} className="flex justify-between border-b border-white/[.06] py-3 text-sm"><span>{event.name}</span><span className="text-white/45">{event._count._all}</span></div>)}</div> : <p className="text-sm text-white/40">No analytics events yet.</p>}</section></AdminLayout>;
}
