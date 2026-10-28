'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '../AdminShell';
import { Users, Search, FileSpreadsheet, RefreshCw, ShieldCheck, User } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = '/api/admin/export?type=customers';
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.userId?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <AdminLayout title="Users & Customer Accounts">
      {/* Top Header */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-400 font-semibold">
              Business / Audience
            </p>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Registered Customers
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Account profiles, library licenses, and download engagement.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Customers CSV</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#080c16] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors shadow-lg"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#080c16] shadow-2xl">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="text-white/40 font-mono border-b border-white/[0.06] bg-white/[0.01]">
            <tr>
              <th className="px-5 py-4 font-normal">Customer</th>
              <th className="px-4 py-4 font-normal">Role</th>
              <th className="px-4 py-4 font-normal">Joined Date</th>
              <th className="px-4 py-4 font-normal text-right">Licensed Assets</th>
              <th className="px-5 py-4 font-normal text-right">Total Downloads</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredUsers.length ? (
              filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin';
                return (
                  <tr key={u.userId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isAdmin
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                              : 'bg-white/5 text-white/70 border border-white/10'
                          }`}
                        >
                          {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.name || 'Customer'}</p>
                          <p className="text-[11px] text-white/50 font-mono mt-0.5">{u.email || u.userId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-white/5 text-white/60 border border-white/10'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-white/50">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-medium text-white/80">
                      {u._count?.access ?? 0}
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono text-emerald-400 font-semibold">
                      {u._count?.downloads ?? 0}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/40 font-mono">
                  {loading ? 'Loading registered users...' : 'No customer profiles found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
