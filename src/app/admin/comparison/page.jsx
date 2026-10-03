'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  UploadCloud,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Type,
  FileText,
  ListPlus,
  Trash2,
  AlertCircle,
  Eye,
  Plus,
} from 'lucide-react';
import { AdminLayout, useAdmin } from '../AdminShell';
import { notifyProductsUpdated } from '@/lib/events';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { DEFAULT_COMPARISON_SETTINGS } from '@/app/api/comparison/route';

const inputClass = 'w-full rounded-xl border border-white/10 bg-[#080d18] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-blue-400/50 transition-colors';

export default function AdminComparisonPage() {
  const { toast } = useAdmin();
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState(DEFAULT_COMPARISON_SETTINGS);
  const [newFeatureText, setNewFeatureText] = useState('');

  useEffect(() => {
    fetch('/api/admin/comparison')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load comparison settings');
        return res.json();
      })
      .then((data) => {
        if (data.comparison) {
          setForm({
            ...DEFAULT_COMPARISON_SETTINGS,
            ...data.comparison,
            features: Array.isArray(data.comparison.features)
              ? data.comparison.features
              : DEFAULT_COMPARISON_SETTINGS.features,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (file, side) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast('Please upload a JPG, PNG, or WebP image.', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast('Image exceeds maximum limit of 25MB.', 'error');
      return;
    }

    const setUploading = side === 'before' ? setUploadingBefore : setUploadingAfter;
    setUploading(true);

    try {
      let uploadedUrl = null;

      // 1. Try presigned URL first
      try {
        const presignRes = await fetch('/api/admin/comparison/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type || 'image/webp',
            side,
          }),
        });

        if (presignRes.ok) {
          const presignData = await presignRes.json();
          if (presignData.uploadUrl) {
            const putRes = await fetch(presignData.uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'image/webp' },
              body: file,
            });

            if (putRes.ok) {
              uploadedUrl = presignData.url;
            }
          }
        }
      } catch (presignErr) {
        console.warn('Presigned upload failed, falling back:', presignErr);
      }

      // 2. Direct multipart fallback
      if (!uploadedUrl) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('side', side);

        const res = await fetch('/api/admin/comparison/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload comparison image');
        uploadedUrl = data.url;
      }

      if (side === 'before') {
        handleChange('beforeImage', uploadedUrl);
        toast('Before photo uploaded to cloud storage!', 'success');
      } else {
        handleChange('afterImage', uploadedUrl);
        toast('After photo uploaded to cloud storage!', 'success');
      }
    } catch (err) {
      console.error(err);
      toast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploading(false);
      if (side === 'before' && beforeInputRef.current) beforeInputRef.current.value = '';
      if (side === 'after' && afterInputRef.current) afterInputRef.current.value = '';
    }
  };

  const handleAddFeature = (e) => {
    e?.preventDefault();
    const text = newFeatureText.trim();
    if (!text) return;
    setForm((prev) => ({
      ...prev,
      features: [...(prev.features || []), text],
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.title?.trim()) {
      toast('Section title cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/comparison', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save comparison settings');

      toast('Before/After comparison saved successfully! Public website updated.', 'success');
      notifyProductsUpdated();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to save comparison settings.');
      toast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setForm(DEFAULT_COMPARISON_SETTINGS);
    toast('Form reset to default comparison configuration. Click "Save Changes" to apply.', 'info');
  };

  return (
    <AdminLayout title="Before / After Comparison">
      {/* Top Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">
            Site Customization / Comparison
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
            <SlidersHorizontal className="w-7 h-7 text-blue-400" />
            <span>Before / After Comparison Section</span>
          </h2>
          <p className="mt-1.5 text-xs text-white/50 max-w-xl">
            Manage the interactive color science comparison slider photos, labels, headline, and the right-side spectral density notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/#comparison"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-white/70 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View On Site</span>
          </Link>

          <button
            type="button"
            disabled={saving || loading}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center space-x-3 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="p-20 text-center text-white/40 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-xs font-mono">Loading comparison configuration...</span>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT COLUMN: Controls & Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Comparison Photos */}
            <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Before & After Photos</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Interactive Slider
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* BEFORE PHOTO */}
                <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#070b14] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/90">Before Photo (RAW Log / Original)</span>
                    {form.beforeImage && (
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        UPLOADED
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                    {form.beforeImage ? (
                      <img
                        src={form.beforeImage}
                        alt="Before comparison"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-white/40 text-xs">
                        Default Flat Log Graphic Active
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={beforeInputRef}
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'before')}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={uploadingBefore}
                      onClick={() => beforeInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white text-black hover:bg-white/90 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {uploadingBefore ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload Before</span>
                        </>
                      )}
                    </button>

                    {form.beforeImage && (
                      <button
                        type="button"
                        onClick={() => handleChange('beforeImage', '')}
                        className="p-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        title="Clear photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                      Before Image URL / Path
                    </label>
                    <input
                      type="text"
                      value={form.beforeImage || ''}
                      onChange={(e) => handleChange('beforeImage', e.target.value)}
                      placeholder="https://... or /products/..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                      Before Slider Badge Label
                    </label>
                    <input
                      type="text"
                      value={form.beforeLabel || ''}
                      onChange={(e) => handleChange('beforeLabel', e.target.value)}
                      placeholder="RAW Log (DWG / ACES)"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* AFTER PHOTO */}
                <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#070b14] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/90">After Photo (Grade / Emulation)</span>
                    {form.afterImage && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        UPLOADED
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                    {form.afterImage ? (
                      <img
                        src={form.afterImage}
                        alt="After comparison"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-white/40 text-xs">
                        Default Print Graphic Active
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={afterInputRef}
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'after')}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={uploadingAfter}
                      onClick={() => afterInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 text-black hover:bg-amber-300 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {uploadingAfter ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload After</span>
                        </>
                      )}
                    </button>

                    {form.afterImage && (
                      <button
                        type="button"
                        onClick={() => handleChange('afterImage', '')}
                        className="p-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        title="Clear photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                      After Image URL / Path
                    </label>
                    <input
                      type="text"
                      value={form.afterImage || ''}
                      onChange={(e) => handleChange('afterImage', e.target.value)}
                      placeholder="https://... or /products/..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                      After Slider Badge Label
                    </label>
                    <input
                      type="text"
                      value={form.afterLabel || ''}
                      onChange={(e) => handleChange('afterLabel', e.target.value)}
                      placeholder="Kodak 2383 Print DCTL"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Section Header & Subtitle */}
            <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Type className="w-4 h-4 text-blue-400" />
                  <span>Section Headline & Subtitle</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Section Header</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Category Tag / Badge
                  </label>
                  <input
                    type="text"
                    value={form.badge || ''}
                    onChange={(e) => handleChange('badge', e.target.value)}
                    placeholder="02 / COLOR SCIENCE COMPARISON"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Section Main Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Photochemical Print Emulation"
                    className={`${inputClass} text-base font-semibold`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.subtitle || ''}
                    onChange={(e) => handleChange('subtitle', e.target.value)}
                    placeholder="Drag horizontally to compare unprocessed RAW camera log footage..."
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* 3. Right-Side Spectral Density Card */}
            <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Right-Side Details Card</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Editorial Notes</span>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                      Card Badge
                    </label>
                    <input
                      type="text"
                      value={form.cardBadge || ''}
                      onChange={(e) => handleChange('cardBadge', e.target.value)}
                      placeholder="SPECTRAL DENSITY NOTES"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                      Card Tag (Top Right)
                    </label>
                    <input
                      type="text"
                      value={form.cardTag || ''}
                      onChange={(e) => handleChange('cardTag', e.target.value)}
                      placeholder="35mm Print"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Card Description Paragraphs
                  </label>
                  <textarea
                    rows={4}
                    value={form.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Paragraph 1...&#10;&#10;Paragraph 2..."
                    className={inputClass}
                  />
                </div>

                {/* Feature Bullet Points */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Feature Bullet Points
                  </label>

                  <div className="space-y-2">
                    {(form.features || []).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => {
                              const updated = [...prev.features];
                              updated[idx] = val;
                              return { ...prev, features: updated };
                            });
                          }}
                          className={`${inputClass} py-1.5 text-xs`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-2 text-white/40 hover:text-red-400 transition-colors"
                          title="Remove bullet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Feature */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Add new feature bullet..."
                      className={`${inputClass} text-xs`}
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.06] transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Interactive WYSIWYG Preview (5 cols) */}
          <div className="lg:col-span-5 sticky top-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-white/50 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Interactive Preview</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                WYSIWYG
              </span>
            </div>

            {/* Live Slider Preview */}
            <div className="space-y-4 rounded-2xl border border-white/15 bg-black p-4 shadow-2xl">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-1">
                  {form.badge || '02 / COLOR SCIENCE COMPARISON'}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-white font-sans">
                  {form.title || 'Photochemical Print Emulation'}
                </h3>
                {form.subtitle && (
                  <p className="mt-1 text-xs text-white/60 line-clamp-2">
                    {form.subtitle}
                  </p>
                )}
              </div>

              {/* Slider */}
              <div className="rounded-xl overflow-hidden border border-white/10">
                <BeforeAfterSlider
                  beforeSrc={form.beforeImage}
                  afterSrc={form.afterImage}
                  beforeLabel={form.beforeLabel || 'RAW Log (DWG / ACES)'}
                  afterLabel={form.afterLabel || 'Kodak 2383 Print DCTL'}
                  aspectRatio="16/9"
                />
              </div>

              {/* Right-Side Card Live Representation */}
              <div className="border border-white/[0.12] rounded-xl p-5 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                    {form.cardBadge || 'SPECTRAL DENSITY NOTES'}
                  </span>
                  <span className="text-[9px] font-mono text-white/50">
                    {form.cardTag || '35mm Print'}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-sans text-white/75 leading-relaxed">
                  {(form.description || '').split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/[0.08] space-y-1.5 text-[11px] font-mono text-white/70">
                  {(form.features || []).map((feat, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#080d18] p-4 text-[11px] text-white/50 space-y-1.5 font-sans">
              <p className="font-semibold text-white/80">✨ Instant Live Sync:</p>
              <p>When you click <strong>Save Changes</strong>, the settings are stored in Supabase PostgreSQL and broadcast immediately to all visitors on the homepage.</p>
            </div>

          </div>

        </div>
      )}
    </AdminLayout>
  );
}
