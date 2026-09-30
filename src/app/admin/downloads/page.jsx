'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../AdminShell';

export default function DownloadsPage() {
  const [, setKey] = useState('');
  const [downloads, setDownloads] = useState([]);
  useEffect(() => { fetch('/api/admin/downloads').then((r) => r.json()).then((d) => setDownloads(d.downloads || [])); }, []);
  return <AdminLayout><h2 className="mb-4 text-lg">Download history</h2><div className="overflow-x-auto rounded border border-white/10"><table className="w-full min-w-[650px] text-left text-xs"><thead className="text-white/50"><tr>{['User', 'Product', 'Access', 'Date'].map((x) => <th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{downloads.map((d) => <tr key={d.id} className="border-t border-white/10"><td className="px-4 py-3">{d.user.email || d.user.name || d.user.userId}</td><td className="px-4 py-3">{d.product.name}</td><td className="px-4 py-3">{d.access.accessType}</td><td className="px-4 py-3">{new Date(d.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div></AdminLayout>;
}
