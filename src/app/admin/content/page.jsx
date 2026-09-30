'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '../AdminShell';

const input = 'w-full rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50';

export default function ContentAdminPage() {
  const [data, setData] = useState({ posts: [], categories: [] });
  const [form, setForm] = useState({ title: '', slug: '', content: '', categoryId: '' });
  const load = () => fetch('/api/admin/content').then((response) => response.json()).then(setData);
  useEffect(() => { load(); }, []);
  const create = async (event) => { event.preventDefault(); const response = await fetch('/api/admin/content', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) }); if (response.ok) { setForm({ title: '', slug: '', content: '', categoryId: '' }); load(); } };
  return <AdminLayout title="Content"><div className="mb-7"><p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">Content / Editorial</p><h2 className="mt-2 text-3xl font-semibold">Content</h2></div><div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><form onSubmit={create} className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-5 space-y-4"><p className="font-mono text-[10px] uppercase tracking-widest text-white/35">New post</p><input required className={input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input required className={input} placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><select required className={input} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Select category</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><textarea required rows="7" className={input} placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /><button className="rounded-xl bg-white px-4 py-3 text-xs text-black">Create post</button></form><div className="space-y-3">{data.posts.map((post) => <article key={post.id} className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-medium">{post.title}</h3><p className="mt-1 text-xs text-white/40">{post.category?.name} · {post.published ? 'Published' : 'Draft'}</p></div><span className="text-[10px] text-white/35">{post.slug}</span></div></article>)}{!data.posts.length && <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">No content posts yet.</p>}</div></div></AdminLayout>;
}
