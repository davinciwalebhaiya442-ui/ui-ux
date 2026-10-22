'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, FileArchive, UploadCloud, CheckCircle2, File, RefreshCw, X, ExternalLink, Link2, HardDrive } from 'lucide-react';
import { AdminLayout, ProductThumb, useAdmin } from './AdminShell';
import MediaManager from '@/components/admin/MediaManager';
import { notifyProductsUpdated } from '@/lib/events';

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

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
  const [fileUploading, setFileUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [deliveryMode, setDeliveryMode] = useState(() => {
    const key = product?.downloadFileKey || '';
    return key.startsWith('http://') || key.startsWith('https://') ? 'drive' : 'r2';
  });
  const [driveLinkInput, setDriveLinkInput] = useState(() => {
    const key = product?.downloadFileKey || '';
    return key.startsWith('http://') || key.startsWith('https://') ? key : '';
  });
  const [driveNameInput, setDriveNameInput] = useState(() => product?.downloadFileName || '');
  const [driveSizeInput, setDriveSizeInput] = useState(() => product?.fileSize || '150 MB');
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
    downloadFileKey: product?.downloadFileKey || '',
    downloadFileName: product?.downloadFileName || '',
    downloadFileSize: product?.downloadFileSize || 0,
    installationGuide: [],
    featured: false,
    published: false,
    ...(product || {}),
    type: product?.type
      ? String(product.type).toUpperCase()
      : (Number(product?.price || 0) > 0 ? 'PAID' : 'FREE'),
  }));

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const text = (field, separator = ', ') => (Array.isArray(form[field]) ? form[field].join(separator) : form[field] || '');

  const handleFileUpload = async (fileToUpload) => {
    const file = fileToUpload || pendingFile;
    if (!file) return;

    const id = product?.dbId || product?.id;
    if (!id) {
      setPendingFile(file);
      set('fileSize', `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      toast(`File "${file.name}" selected. It will upload automatically when you save.`, 'info');
      return;
    }

    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}/file`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload product file');

      setForm((prev) => ({
        ...prev,
        downloadFileKey: data.file.key,
        downloadFileName: data.file.name,
        downloadFileSize: data.file.size,
        fileSize: prev.fileSize || `${(data.file.size / (1024 * 1024)).toFixed(1)} MB`,
      }));

      setPendingFile(null);
      toast(`Download file "${data.file.name}" uploaded successfully!`, 'success');
      notifyProductsUpdated();
    } catch (err) {
      toast(err.message || 'Error uploading file', 'error');
    } finally {
      setFileUploading(false);
    }
  };

  const handleSaveDriveLink = () => {
    const link = (driveLinkInput || '').trim();
    if (!link) {
      toast('Please enter a valid Google Drive or cloud link', 'error');
      return;
    }
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      toast('Link must start with https:// or http://', 'error');
      return;
    }

    const friendlyName = (driveNameInput || '').trim() || `${form.name || 'Digital Package'} (Google Drive)`;
    const friendlySize = (driveSizeInput || '').trim() || '150 MB';

    setForm((prev) => ({
      ...prev,
      downloadFileKey: link,
      downloadFileName: friendlyName,
      fileSize: friendlySize,
      downloadFileSize: 157286400, // 150MB approx
    }));

    toast('Google Drive link attached successfully! Remember to click Save/Publish.', 'success');
  };

  const handleFileDelete = async () => {
    const id = product?.dbId || product?.id;
    const isUrl = form.downloadFileKey?.startsWith('http://') || form.downloadFileKey?.startsWith('https://');

    const ok = await confirm({
      title: isUrl ? 'Remove Google Drive Link?' : 'Remove Digital Asset File?',
      message: `Are you sure you want to remove "${form.downloadFileName || 'the downloadable package'}"? Customers will not be able to download this asset until a new file or link is attached.`,
      confirmText: 'Remove',
      destructive: true,
    });
    if (!ok) return;

    if (!id || isUrl) {
      setPendingFile(null);
      setForm((prev) => ({
        ...prev,
        downloadFileKey: '',
        downloadFileName: '',
        downloadFileSize: null,
      }));
      setDriveLinkInput('');
      toast('Download package removed', 'success');
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}/file`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product file');

      setForm((prev) => ({
        ...prev,
        downloadFileKey: '',
        downloadFileName: '',
        downloadFileSize: null,
      }));
      toast('Download file removed', 'success');
      notifyProductsUpdated();
    } catch (err) {
      toast(err.message || 'Error removing file', 'error');
    }
  };

  const save = async (event, publish) => {
    event?.preventDefault();
    setSaving(true);
    try {
      const sanitizedSlug = slugify(form.slug || form.name);
      const sanitizedPrice = Number(form.price || 0);
      const sanitizedType = String(form.type || (sanitizedPrice > 0 ? 'PAID' : 'FREE')).toUpperCase();
      const payload = {
        ...form,
        type: sanitizedType === 'PAID' || sanitizedPrice > 0 ? 'PAID' : 'FREE',
        slug: sanitizedSlug,
        published: publish ?? form.published,
        price: sanitizedPrice,
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
      if (!response.ok) {
        let errorMsg = data.error || 'Failed to save product';
        if (data.details && Array.isArray(data.details)) {
          const detailMsgs = data.details.map((issue) => {
            const field = issue.path ? issue.path.join('.') : '';
            return field ? `${field}: ${issue.message}` : issue.message;
          });
          errorMsg = detailMsgs.join(' | ');
        }
        throw new Error(errorMsg);
      }

      const successMsg = id ? 'Product updated successfully' : 'Product created successfully';
      setMessage(successMsg);
      toast(successMsg, 'success');
      notifyProductsUpdated();

      if (!id) {
        if (pendingFile) {
          try {
            const newId = data.product.slug || data.product.id;
            const formData = new FormData();
            formData.append('file', pendingFile);
            await fetch(`/api/admin/products/${encodeURIComponent(newId)}/file`, {
              method: 'POST',
              body: formData,
            });
          } catch (fileErr) {
            console.error('Failed to upload pending file:', fileErr);
          }
        }
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
      notifyProductsUpdated();
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
                <input
                  required
                  className={input}
                  value={form.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((curr) => {
                      const shouldUpdateSlug = !product && (!curr.slug || curr.slug === slugify(curr.name));
                      return {
                        ...curr,
                        name: val,
                        slug: shouldUpdateSlug ? slugify(val) : curr.slug,
                      };
                    });
                  }}
                />
              </Field>
              <Field label="Slug" hint="Unique URL identifier (auto-formatted lowercase)">
                <input
                  required
                  className={input}
                  value={form.slug}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                />
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
                <select
                  className={input}
                  value={String(form.type || (Number(form.price) > 0 ? 'PAID' : 'FREE')).toUpperCase()}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      type: nextType,
                      price: nextType === 'FREE' ? 0 : (Number(prev.price) === 0 ? 99 : prev.price),
                    }));
                  }}
                >
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
                  onChange={(e) => {
                    const nextPrice = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      price: nextPrice,
                      type: Number(nextPrice) > 0 ? 'PAID' : prev.type,
                    }));
                  }}
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
            
            {/* DIGITAL ASSET DOWNLOAD FILE (CLOUDFLARE R2 OR GOOGLE DRIVE) */}
            <div className="mb-6 rounded-xl border border-blue-500/20 bg-gradient-to-b from-[#0c1426] to-[#070b16] p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Downloadable Package (Google Drive / Zip / Tool)
                  </span>
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold ${
                  form.downloadFileKey?.startsWith('http')
                    ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                    : 'text-blue-400 bg-blue-500/15 border border-blue-500/30'
                }`}>
                  {form.downloadFileKey?.startsWith('http') ? 'Google Drive / Cloud Delivery' : 'Cloudflare R2 Storage'}
                </span>
              </div>
              <p className="text-xs text-white/60 mb-4 leading-relaxed font-sans">
                Choose how buyers will receive their files: either attach a <strong>Google Drive link (ideal for 150+ MB heavy packages)</strong> or upload a direct .zip file.
              </p>

              {form.downloadFileKey?.startsWith('http://') || form.downloadFileKey?.startsWith('https://') ? (
                /* GOOGLE DRIVE / EXTERNAL LINK ACTIVE CARD */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#09151c] border border-emerald-500/30 shadow-inner">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate font-mono flex items-center gap-2">
                        <span>{form.downloadFileName || 'Google Drive Cloud Asset'}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-sans font-semibold">
                          Google Drive Link
                        </span>
                      </div>
                      <div className="text-[11px] text-white/60 font-mono mt-0.5 truncate max-w-md">
                        {form.downloadFileKey}
                      </div>
                      <div className="text-[11px] text-white/40 font-mono mt-0.5">
                        {form.fileSize || '150 MB'} &bull; <span className="text-emerald-400 font-sans font-medium">Delivered to buyers on payment</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={form.downloadFileKey}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-xs font-semibold text-emerald-200 transition-colors border border-emerald-500/30"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Link</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setDriveLinkInput(form.downloadFileKey);
                        setDriveNameInput(form.downloadFileName || '');
                        setDriveSizeInput(form.fileSize || '150 MB');
                        setDeliveryMode('drive');
                        setForm((prev) => ({ ...prev, downloadFileKey: '', downloadFileName: '' }));
                      }}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/15"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleFileDelete}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Remove link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : form.downloadFileKey || form.downloadFileName ? (
                /* R2 DIRECT FILE ACTIVE CARD */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#091020] border border-blue-400/30 shadow-inner">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <File className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate font-mono">
                        {form.downloadFileName || 'Attached Asset File'}
                      </div>
                      <div className="text-[11px] text-white/50 font-mono mt-0.5">
                        {form.downloadFileSize ? `${(form.downloadFileSize / (1024 * 1024)).toFixed(2)} MB` : form.fileSize || 'Ready for download'}
                        {' '}&bull;{' '}
                        <span className="text-emerald-400 font-sans font-medium">Secured & Active in R2</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/15">
                      <UploadCloud className="w-4 h-4 text-blue-300" />
                      <span>{fileUploading ? 'Uploading...' : 'Replace File'}</span>
                      <input
                        type="file"
                        className="hidden"
                        disabled={fileUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleFileDelete}
                      disabled={fileUploading}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* NO FILE ATTACHED - TABS TO CHOOSE DELIVERY MODE */
                <div>
                  <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode('drive')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        deliveryMode === 'drive'
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/60'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Google Drive Link (For 150+ MB)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMode('r2')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        deliveryMode === 'r2'
                          ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300 shadow-[0_0_12px_rgba(37,99,235,0.2)]'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/60'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                      <span>Direct File Upload (.zip to R2)</span>
                    </button>
                  </div>

                  {deliveryMode === 'drive' ? (
                    /* GOOGLE DRIVE LINK INPUT SECTION */
                    <div className="p-4 rounded-xl bg-[#060e18] border border-emerald-500/30 space-y-3 shadow-inner">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">
                          Google Drive Link (Required) *
                        </label>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/file/d/..."
                          value={driveLinkInput}
                          onChange={(e) => setDriveLinkInput(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-[#091020] px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-white/70 mb-1">
                            Package Display Name (In Email / Library)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Master LUTs & Assets Pack"
                            value={driveNameInput}
                            onChange={(e) => setDriveNameInput(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-[#091020] px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-white/70 mb-1">
                            File Size (e.g. 150 MB)
                          </label>
                          <input
                            type="text"
                            placeholder="150 MB"
                            value={driveSizeInput}
                            onChange={(e) => setDriveSizeInput(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-[#091020] px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200/90 leading-relaxed font-sans">
                        💡 <strong>Google Drive Tip:</strong> Google Drive par file upload karke Share setting ko <strong>&ldquo;Anyone with the link can view&rdquo;</strong> set karein, taaki buyer link par click karte hi bina access permission maange direct file download kar sake.
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveDriveLink}
                        disabled={!driveLinkInput.trim()}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Attach Google Drive Package</span>
                      </button>
                    </div>
                  ) : (
                    /* R2 DRAG & DROP FILE UPLOAD SECTION */
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        fileUploading
                          ? 'border-blue-400/50 bg-blue-500/10'
                          : 'border-white/15 hover:border-blue-400/50 bg-[#060b18]/60 hover:bg-[#070d1e]'
                      }`}
                    >
                      <input
                        type="file"
                        className="hidden"
                        disabled={fileUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                          e.target.value = '';
                        }}
                      />
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-3 shadow-[0_0_15px_rgba(37,99,235,0.25)]">
                        {fileUploading ? (
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-300" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-white mb-1">
                        {fileUploading
                          ? 'Uploading file to Cloudflare R2...'
                          : pendingFile
                          ? `Selected: ${pendingFile.name}`
                          : 'Click to upload or drag & drop package file here'}
                      </div>
                      <div className="text-[11px] text-white/40 font-mono">
                        Accepts .ZIP, .DCTL, .DRX, .SETTING, .CUBE, .RAR, .PKG, .DMG
                      </div>
                    </label>
                  )}

                  {!product?.dbId && !product?.id && deliveryMode === 'r2' && (
                    <p className="mt-2 text-[11px] text-amber-300/80 font-mono">
                      * Note: You can select your file now; it will automatically upload to Cloudflare R2 when you click Publish or Save Draft.
                    </p>
                  )}
                </div>
              )}
            </div>
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
