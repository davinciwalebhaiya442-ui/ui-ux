'use client';

import { useEffect, useState } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { AdminLayout, useAdmin } from '../AdminShell';

export default function ToolsAdminPage() {
  const { toast, confirm } = useAdmin();
  const [tools, setTools] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', url: '' });

  const load = () =>
    fetch('/api/admin/tools')
      .then((response) => response.json())
      .then((data) => setTools(data.tools || []))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create tool');
      toast(`Tool "${form.name}" created`, 'success');
      setForm({ name: '', slug: '', description: '', url: '' });
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async (id, name) => {
    const ok = await confirm({
      title: 'Delete Tool Permanently?',
      message: `Are you sure you want to delete tool "${name}"? This action cannot be undone.`,
      confirmText: 'Delete Tool',
      destructive: true,
    });
    if (!ok) return;

    try {
      const response = await fetch(`/api/admin/tools?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete tool');
      toast(`Tool "${name}" deleted`, 'success');
      setTools((prev) => prev.filter((t) => t.id !== id));
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <AdminLayout title="Tools">
      <div className="mb-7">
        <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">Content / Utilities</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Creative Tools & Utilities</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <form onSubmit={create} className="rounded-2xl border border-white/[.08] bg-[#080c16] p-6 space-y-4 h-fit">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">Add New Tool</p>
          {['name', 'slug', 'url'].map((field) => (
            <input
              key={field}
              required={field !== 'url'}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400"
              placeholder={field[0].toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          ))}
          <textarea
            required
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400"
            placeholder="Tool description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button className="w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black hover:bg-white/90 transition-colors">
            Add Tool
          </button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <article
              key={tool.id}
              className="rounded-2xl border border-white/[.08] bg-[#080c16] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white text-base">{tool.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {tool.url && (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-blue-400 hover:text-blue-300"
                        title="Open external link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => remove(tool.id, tool.name)}
                      className="p-1 text-white/30 hover:text-red-400 transition-colors"
                      title="Delete tool"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-[10px] font-mono text-blue-400">{tool.slug}</p>
                <p className="mt-3 text-xs text-white/50 leading-relaxed">{tool.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>{tool.published ? 'Published' : 'Draft'}</span>
                {tool.featured && <span className="text-amber-400">Featured</span>}
              </div>
            </article>
          ))}
          {!tools.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-12 text-center text-xs text-white/40">
              No tools registered yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
