'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { AdminLayout, ProductThumb, useAdmin } from './AdminShell';
import MediaManager from '@/components/admin/MediaManager';

const input = 'w-full rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50';
function Field({ label, children, hint }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-white/55">{label}</span>
      {children}
      {hint && <small className="block text-[10px] text-white/25">{hint}</small>}
    </label>
  );
}

export default function VisualProductForm({ product }) {
  const router = useRouter();
  const { toast, confirm } = useAdmin();
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    type: 'FREE',
    price: 0,
    currency: 'INR',
    software: [],
    version: '',
    fileSize: '',
    thumbnailKey: '',
    previewImages: [],
    demoVideo: '',
    beforeImage: '',
    afterImage: '',
    installationGuide: [],
    featured: false,
    published: false,
    ...(product || {}),
  }));

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const text = (field, separator = ', ') => (Array.isArray(form[field]) ? form[field].join(separator) : form[field] || '');

  const save = async (event, publish) => {
    event?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        published: publish ?? form.published,
        price: Number(form.price),
        software: String(form.software || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        previewImages: Array.isArray(form.previewImages) ? form.previewImages : [],
        installationGuide: String(form.installationGuide || '')
          .split('\n')
          .map((value) => value.trim())
          .filter(Boolean),
        included: Array.isArray(form.included) ? form.included : [],
      };
      const id = product?.dbId || product?.id;
      const response = await fetch(id ? `/api/products/${encodeURIComponent(id)}` : '/api/products', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save product');

      const successMsg = id ? 'Product updated successfully' : 'Product created successfully';
      setMessage(successMsg);
      toast(successMsg, 'success');

      if (!id) {
        router.push(`/admin/products/${data.product.slug || data.product.id}/edit`);
      }
    } catch (err) {
      setMessage(err.message);
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = product?.dbId || product?.id;
    if (!id) return;
    const ok = await confirm({
      title: 'Delete Asset Permanently?',
      message: `Are you sure you want to delete "${form.name || 'this product'}"? This action cannot be undone and will delete all associated download records.`,
      confirmText: 'Delete Asset',
      destructive: true,
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      toast('Product deleted permanently', 'success');
      router.push('/admin/products');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const category = categories.find((item) => item.id === form.categoryId)?.name;

  return (
    <AdminLayout title={product ? 'Edit Product' : 'New Product'}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">Store / Product Editor</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {product ? 'Edit Product' : 'Create Product'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {product && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Asset
            </button>
          )}
          <Link
            href="/admin/products"
            className="rounded-xl border border-white/10 px-4 py-3 text-xs text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(null, true)}
            className="rounded-xl bg-white px-5 py-3 text-xs font-semibold text-black hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-5">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-widest text-white/35">Product Information</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product name">
                <input required className={input} value={form.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="Slug">
                <input required className={input} value={form.slug} onChange={(e) => set('slug', e.target.value)} />
              </Field>
              <Field label="Short description">
                <input
                  className={input}
                  value={form.shortDescription || ''}
                  onChange={(e) => set('shortDescription', e.target.value)}
                />
              </Field>
              <Field label="Category">
                <select
                  required
                  className={input}
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <select className={input} value={form.type} onChange={(e) => set('type', e.target.value)}>
                  <option value="FREE">Free</option>
                  <option value="PAID">Paid</option>
                </select>
              </Field>
              <Field label="Price (INR)">
                <input
                  type="number"
                  min="0"
                  className={input}
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                />
              </Field>
              <Field label="Currency">
                <input
                  className={input}
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value.toUpperCase())}
                />
              </Field>
              <Field label="Software compatibility" hint="Comma separated (e.g. DaVinci Resolve 18+, Premiere Pro)">
                <input className={input} value={text('software')} onChange={(e) => set('software', e.target.value)} />
              </Field>
              <Field label="Version">
                <input className={input} value={form.version || ''} onChange={(e) => set('version', e.target.value)} />
              </Field>
              <Field label="File size">
                <input className={input} value={form.fileSize || ''} onChange={(e) => set('fileSize', e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    required
                    rows={7}
                    className={input}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-5">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-widest text-white/35">Media & Delivery</p>
            <MediaManager
              slug={form.slug}
              thumbnail={form.thumbnailKey}
              gallery={form.previewImages}
              demoVideo={form.demoVideo}
              beforeImage={form.beforeImage}
              afterImage={form.afterImage}
              onChange={(media) =>
                setForm((current) => ({
                  ...current,
                  thumbnailKey: media.thumbnail,
                  previewImages: media.gallery,
                  demoVideo: media.demoVideo,
                  beforeImage: media.beforeImage,
                  afterImage: media.afterImage,
                }))
              }
            />
            <div className="mt-5">
              <Field label="Installation guide" hint="One step per line">
                <textarea
                  rows={4}
                  className={input}
                  value={text('installationGuide', '\n')}
                  onChange={(e) => set('installationGuide', e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/35">Publishing Controls</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => set('published', e.target.checked)}
                  className="rounded"
                />{' '}
                Published
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set('featured', e.target.checked)}
                  className="rounded"
                />{' '}
                Featured
              </label>
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-28 xl:h-fit">
          <section className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0a0f1b]">
            <div className="border-b border-white/[.08] p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">Live Product Preview</p>
            </div>
            <ProductThumb product={{ ...form, category }} className="m-5 h-48" />
            <div className="px-5 pb-5">
              <p className="text-[10px] uppercase tracking-widest text-white/35">
                {category || 'Category'} · v{form.version || '1.0'}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">{form.name || 'Product name'}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/50">
                {form.shortDescription || form.description || 'Your product description will appear here.'}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-white/[.08] pt-4">
                <span className={form.type === 'FREE' ? 'text-emerald-300 font-mono font-bold' : 'text-white font-mono font-bold'}>
                  {form.type === 'FREE' ? 'FREE' : `₹${Number(form.price || 0).toLocaleString()}`}
                </span>
                <span className="text-[10px] font-mono text-white/35">{form.published ? 'Published' : 'Draft'}</span>
              </div>
            </div>
          </section>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          {message && <p className="mt-3 text-center text-xs text-amber-200">{message}</p>}
        </aside>
      </form>
    </AdminLayout>
  );
}
