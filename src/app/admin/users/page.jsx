'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../AdminShell';

export default function UsersPage() {
  const [, setKey] = useState('');
  const [users, setUsers] = useState([]);
  useEffect(() => { const savedKey = window.localStorage.getItem('davinci-admin-key') || ''; setKey(savedKey); fetch('/api/admin/users', { headers: { 'x-admin-key': savedKey } }).then((r) => r.json()).then((d) => setUsers(d.users || [])); }, []);
  return <AdminLayout><h2 className="mb-4 text-lg">Users</h2><div className="overflow-x-auto rounded border border-white/10"><table className="w-full min-w-[650px] text-left text-xs"><thead className="text-white/50"><tr>{['Name', 'Email', 'Role', 'Joined', 'Access', 'Downloads'].map((x) => <th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{users.map((u) => <tr key={u.userId} className="border-t border-white/10"><td className="px-4 py-3">{u.name || '—'}</td><td className="px-4 py-3 text-white/60">{u.email || '—'}</td><td className="px-4 py-3">{u.role}</td><td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td><td className="px-4 py-3">{u._count.access}</td><td className="px-4 py-3">{u._count.downloads}</td></tr>)}</tbody></table></div></AdminLayout>;
}
