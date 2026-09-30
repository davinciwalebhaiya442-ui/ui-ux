'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AdminLayout, useAdmin } from '../AdminShell';

const input = 'w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400';

export default function ContentAdminPage() {
  const { toast, confirm } = useAdmin();
  const [data, setData] = useState({ posts: [], categories: [] });
  const [form, setForm] = useState({ title: '', slug: '', content: '', categoryId: '' });

  const load = () =>
    fetch('/api/admin/content')
      .then((response) => response.json())
      .then(setData)
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to create post');
      toast(`Post "${form.title}" created`, 'success');
      setForm({ title: '', slug: '', content: '', categoryId: '' });
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async (id, title) => {
    const ok = await confirm({
      title: 'Delete Content Post?',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: 'Delete Post',
      destructive: true,
    });
    if (!ok) return;

    try {
      const response = await fetch(`/api/admin/content?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to delete post');
      toast(`Post "${title}" deleted`, 'success');
      setData((prev) => ({
        ...prev,
        posts: prev.posts.filter((p) => p.id !== id),
      }));
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <AdminLayout title="Content">
      <div className="mb-7">
        <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">Content / Editorial</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Editorial Content & Prompts</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <form onSubmit={create} className="rounded-2xl border border-white/[.08] bg-[#080c16] p-6 space-y-4 h-fit">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">Create New Post</p>
          <input
            required
            className={input}
            placeholder="Post Title"
            value={form.title}
            onChange={(e) => {
              setForm({
                ...form,
                title: e.target.value,
                slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              });
            }}
          />
          <input
            required
            className={input}
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <select
            required
            className={input}
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Select category</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id} className="bg-black text-white">
                {category.name}
              </option>
            ))}
          </select>
          <textarea
            required
            rows={7}
            className={input}
            placeholder="Markdown content..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <button className="w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black hover:bg-white/90 transition-colors">
            Publish Post
          </button>
        </form>

        <div className="space-y-3">
          {data.posts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-white/[.08] bg-[#080c16] p-5 flex items-start justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold text-white text-base">{post.title}</h3>
                <p className="mt-1 text-xs text-white/40">
                  {post.category?.name || 'Uncategorized'} · {post.published ? 'Published' : 'Draft'}
                </p>
                <p className="mt-2 text-xs text-white/60 line-clamp-2">{post.excerpt || post.content}</p>
              </div>
              <button
                onClick={() => remove(post.id, post.title)}
                className="p-1.5 text-white/30 hover:text-red-400 transition-colors shrink-0"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </article>
          ))}
          {!data.posts.length && (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-xs text-white/40">
              No content posts yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
