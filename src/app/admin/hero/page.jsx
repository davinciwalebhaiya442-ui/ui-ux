'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Eye,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Type,
  Palette,
  Link2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { AdminLayout, useAdmin } from '../AdminShell';
import { notifyProductsUpdated } from '@/lib/events';

const FONT_OPTIONS = [
  { id: 'sans', name: 'Inter / Modern Sans (Default)', family: 'var(--font-sans, inherit)' },
  { id: 'Syne', name: 'Syne (Heavy Editorial)', family: "'Syne', sans-serif" },
  { id: 'Clash Display', name: 'Clash Display (Bold Commercial)', family: "'Clash Display', sans-serif" },
  { id: 'Bebas Neue', name: 'Bebas Neue (Impact Cinematic Tall)', family: "'Bebas Neue', cursive, sans-serif" },
  { id: 'Oswald', name: 'Oswald (Condensed Editorial)', family: "'Oswald', sans-serif" },
  { id: 'Cinzel', name: 'Cinzel (Classical Luxury Serif)', family: "'Cinzel', serif" },
  { id: 'Space Grotesk', name: 'Space Grotesk (Neo-Brutalist)', family: "'Space Grotesk', sans-serif" },
  { id: 'mono', name: 'JetBrains Mono (High-Tech Monospace)', family: 'monospace' },
  { id: 'custom', name: 'Custom Font Name...', family: '' },
];

const COLOR_PRESETS = [
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Platinum Silver', value: '#e2e8f0' },
  { name: 'Warm Gold', value: '#facc15' },
  { name: 'Film Grain Amber', value: '#fde047' },
  { name: 'Ice Blue', value: '#93c5fd' },
];

const DEFAULT_HERO = {
  heading: 'DAVINCI WALE BHAIYA',
  description: '',
  badge: 'ECOSYSTEM',
  heroImage: '/hero/2.jpg',
  fontFamily: 'sans',
  textColor: '#ffffff',
  primaryButtonText: 'Work With Us',
  primaryButtonLink: '#catalogue',
};

const inputClass = 'w-full rounded-xl border border-white/10 bg-[#080d18] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-blue-400/50 transition-colors';

async function optimizeHeroImageFile(file) {
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_DIMENSION = 2560; // 2K standard for crisp Retina & WebGL shaders
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP format for high compression ratio & crisp detail
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const cleanName = file.name.replace(/\.[^.]+$/, '') + '.webp';
          const optimized = new File([blob], cleanName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(optimized);
        },
        'image/webp',
        0.90
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export default function AdminHeroPage() {
  const { toast } = useAdmin();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState(DEFAULT_HERO);
  const [customFont, setCustomFont] = useState('');

  useEffect(() => {
    // Dynamically inject Google Fonts for real-time editorial preview
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@600;700;800&family=Oswald:wght@600;700&family=Space+Grotesk:wght@600;700&family=Syne:wght@700;800&display=swap';
    document.head.appendChild(link);

    // Fetch existing hero settings
    fetch('/api/admin/hero')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load hero settings');
        return res.json();
      })
      .then((data) => {
        if (data.hero) {
          setForm({
            ...DEFAULT_HERO,
            ...data.hero,
          });
          if (data.hero.fontFamily && !FONT_OPTIONS.some((f) => f.id === data.hero.fontFamily)) {
            setCustomFont(data.hero.fontFamily);
          }
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

  const handleImageFileSelected = async (e) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(originalFile.type)) {
      toast('Please upload a JPG, PNG, or WebP image.', 'error');
      return;
    }

    if (originalFile.size > 25 * 1024 * 1024) {
      toast('Image exceeds maximum limit of 25MB.', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      // 1. Optimize image client-side to prevent Vercel 4.5MB payload limit & GPU shader lag
      let fileToUpload = originalFile;
      try {
        fileToUpload = await optimizeHeroImageFile(originalFile);
      } catch (optErr) {
        console.warn('Image optimization skipped, using original:', optErr);
      }

      let uploadedUrl = null;

      // 2. Try direct R2 presigned upload first (0 byte Vercel serverless load)
      try {
        const presignRes = await fetch('/api/admin/hero/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'presign',
            fileName: fileToUpload.name,
            fileType: fileToUpload.type || 'image/webp',
          }),
        });

        if (presignRes.ok) {
          const presignData = await presignRes.json();
          if (presignData.uploadUrl) {
            const putRes = await fetch(presignData.uploadUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': fileToUpload.type || 'image/webp',
              },
              body: fileToUpload,
            });

            if (putRes.ok) {
              uploadedUrl = presignData.url;
            }
          }
        }
      } catch (presignErr) {
        console.warn('Presigned direct upload unavailable, using server endpoint:', presignErr);
      }

      // 3. Fallback: multipart server endpoint (file is now optimized < 2MB, never triggers 413)
      if (!uploadedUrl) {
        const formData = new FormData();
        formData.append('file', fileToUpload);

        const res = await fetch('/api/admin/hero/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload hero image');
        uploadedUrl = data.url;
      }

      handleChange('heroImage', uploadedUrl);
      toast('Hero artwork uploaded to secure cloud storage!', 'success');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.heading?.trim()) {
      toast('Main heading cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    try {
      const selectedFont = form.fontFamily === 'custom' ? (customFont.trim() || 'sans') : form.fontFamily;

      const payload = {
        ...form,
        heading: form.heading.trim(),
        fontFamily: selectedFont,
      };

      const res = await fetch('/api/admin/hero', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save hero settings');

      toast('Hero settings saved successfully! Live website updated.', 'success');
      notifyProductsUpdated(); // cross-tab live sync
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to save hero settings.');
      toast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setForm(DEFAULT_HERO);
    setCustomFont('');
    toast('Form reset to default hero configuration. Click "Save Hero Settings" to apply.', 'info');
  };

  const activeFontFamily =
    form.fontFamily === 'custom'
      ? customFont || 'inherit'
      : (FONT_OPTIONS.find((f) => f.id === form.fontFamily)?.family || 'inherit');

  return (
    <AdminLayout title="Hero Section Settings">
      {/* Top Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">Site Customization / Hero</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-blue-400" />
            <span>Hero Section Management</span>
          </h2>
          <p className="mt-1.5 text-xs text-white/50 max-w-xl">
            Live-update your public hero title, background artwork image, typography, and badges. Changes save directly to the database and sync across all visitors.
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
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-white/70 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
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
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Hero Settings</span>
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
          <span className="text-xs font-mono">Loading hero configuration...</span>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT COLUMN: Controls & Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Hero Artwork Image */}
            <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Hero Artwork Background</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">16:9 Aspect Ratio</span>
              </div>

              <div className="space-y-4">
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-white/10 bg-black group">
                  <img
                    src={form.heroImage || '/hero/2.jpg'}
                    alt="Hero artwork preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-[11px] font-mono text-white/70 truncate">
                      Source: {form.heroImage}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileSelected}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl bg-white text-black hover:bg-white/90 px-4 py-2.5 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Uploading Image...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload New Image (JPG, PNG, WebP)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('heroImage', '/hero/2.jpg')}
                    className="rounded-xl border border-white/10 px-3.5 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    Use Default Film-Grain Image
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1.5">
                    Or Direct Image Path / URL
                  </label>
                  <input
                    type="text"
                    value={form.heroImage}
                    onChange={(e) => handleChange('heroImage', e.target.value)}
                    placeholder="/hero/2.jpg or https://..."
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* 2. Hero Editorial Text & Badge */}
            <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Type className="w-4 h-4 text-blue-400" />
                  <span>Hero Text & Editorial Content</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">Live Editable</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Main Heading <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.heading}
                    onChange={(e) => handleChange('heading', e.target.value)}
                    placeholder="DAVINCI WALE BHAIYA"
                    className={`${inputClass} text-base font-semibold`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Top Badge / Category Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.badge || ''}
                    onChange={(e) => handleChange('badge', e.target.value)}
                    placeholder="e.g. ECOSYSTEM or COLOR SCIENCE"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Subtext / Editorial Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={form.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Optional subheadline beneath title..."
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* 3. Typography & Text Color */}
            <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <span>Typography & Color Styling</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Realtime CSS</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Font Family
                  </label>
                  <select
                    value={form.fontFamily || 'sans'}
                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                    className={inputClass}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {form.fontFamily === 'custom' && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                      Custom CSS Font Name
                    </label>
                    <input
                      type="text"
                      value={customFont}
                      onChange={(e) => setCustomFont(e.target.value)}
                      placeholder="e.g. 'Playfair Display', serif"
                      className={inputClass}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Heading Text Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={form.textColor || '#ffffff'}
                      onChange={(e) => handleChange('textColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-0.5"
                    />
                    <input
                      type="text"
                      value={form.textColor || '#ffffff'}
                      onChange={(e) => handleChange('textColor', e.target.value)}
                      className={inputClass}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">
                    Quick Color Presets
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleChange('textColor', preset.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                          form.textColor === preset.value
                            ? 'border-blue-400 bg-blue-500/10 text-white'
                            : 'border-white/10 text-white/60 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: preset.value }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Primary CTA Button (Optional) */}
            <section className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Link2 className="w-4 h-4 text-blue-400" />
                  <span>Hero CTA Button (Optional)</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Action Button</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={form.primaryButtonText || ''}
                    onChange={(e) => handleChange('primaryButtonText', e.target.value)}
                    placeholder="e.g. Work With Us or Explore"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={form.primaryButtonLink || ''}
                    onChange={(e) => handleChange('primaryButtonLink', e.target.value)}
                    placeholder="e.g. #catalogue or /studio"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Live Accurate Hero Preview (5 cols) */}
          <div className="lg:col-span-5 sticky top-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-white/50 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Hero Preview</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                WYSIWYG
              </span>
            </div>

            {/* Preview Box - Accurate representation of public Hero */}
            <div className="w-full aspect-[4/5] sm:aspect-square rounded-2xl border border-white/15 bg-black overflow-hidden relative shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none">
              
              {/* Background Artwork */}
              <div className="absolute inset-0 z-0">
                <img
                  src={form.heroImage || '/hero/2.jpg'}
                  alt="Live Hero Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
              </div>

              {/* Foreground Typography */}
              <div className="relative z-10 flex flex-col items-center justify-center max-w-full px-2">
                {form.badge && (
                  <div className="mb-2 px-2.5 py-0.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[9px] font-mono tracking-[0.25em] uppercase text-white/80">
                    {form.badge}
                  </div>
                )}

                <h1
                  className="font-bold tracking-tight uppercase transition-all duration-300 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
                  style={{
                    fontSize: 'clamp(1.6rem, 4vw, 3.2rem)',
                    lineHeight: 0.95,
                    color: form.textColor || '#ffffff',
                    fontFamily: activeFontFamily,
                  }}
                >
                  {form.heading || 'DAVINCI WALE BHAIYA'}
                </h1>

                {form.description && (
                  <p className="mt-2.5 text-xs text-white/70 font-sans tracking-wide max-w-xs">
                    {form.description}
                  </p>
                )}

                {form.primaryButtonText && (
                  <div className="mt-4">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white text-black font-semibold text-[10px] shadow-lg">
                      {form.primaryButtonText}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Subtle Scroll Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/40 tracking-[0.2em] uppercase">
                SCROLL TO EXPLORE
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#080d18] p-4 text-[11px] text-white/50 space-y-1.5 font-sans">
              <p className="font-semibold text-white/80">✨ Real-time Synchronization:</p>
              <p>When you click <strong>Save Hero Settings</strong>, the changes are stored in Supabase PostgreSQL and broadcast instantly to the public homepage.</p>
            </div>
          </div>

        </div>
      )}
    </AdminLayout>
  );
}
