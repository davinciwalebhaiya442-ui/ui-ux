'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import {
  Share2,
  Check,
  Download,
  ShoppingBag,
  SlidersHorizontal,
  Image as ImageIcon,
  Film,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function ProductViewClient({ asset, relatedAssets = [] }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadStatusText, setDownloadStatusText] = useState('');
  const [directDownloadUrl, setDirectDownloadUrl] = useState('');
  const [directDownloadName, setDirectDownloadName] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [copied, setCopied] = useState(false);

  const resolveUrl = (val) => {
    if (!val) return '';
    const str = String(val).trim();
    if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) {
      return str;
    }
    return `/api/media?key=${encodeURIComponent(str)}`;
  };

  const getEmbedUrl = (val) => {
    if (!val) return null;
    const str = String(val).trim();
    const ytMatch = str.match(
      /(?:youtu\.be\/|(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([a-zA-Z0-9_-]{11})/i
    );
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
    }
    const vimeoMatch = str.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&playsinline=1`;
    }
    return null;
  };

  const beforeSrc = resolveUrl(asset?.beforeImage);
  const afterSrc = resolveUrl(asset?.afterImage);
  const thumbSrc = resolveUrl(asset?.thumbnailKey || (Array.isArray(asset?.previewImages) && asset.previewImages[0]));
  const videoSrc = resolveUrl(asset?.demoVideo);
  const videoEmbedUrl = getEmbedUrl(asset?.demoVideo);

  const allPreviewImages = useMemo(() => {
    const list = [];
    if (asset?.thumbnailKey) {
      const u = resolveUrl(asset.thumbnailKey);
      if (u) list.push(u);
    }
    if (Array.isArray(asset?.previewImages)) {
      asset.previewImages.forEach((img) => {
        const u = resolveUrl(img);
        if (u && !list.includes(u)) list.push(u);
      });
    }
    return list;
  }, [asset]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const currentPreviewImage = allPreviewImages[selectedImageIndex] || thumbSrc;

  const hasBeforeAfter = Boolean(beforeSrc && afterSrc) || Boolean(beforeSrc || afterSrc);
  const hasPreview = Boolean(thumbSrc || allPreviewImages.length > 0);
  const hasVideo = Boolean(videoSrc || videoEmbedUrl);

  const canShowTabs = [hasPreview, hasBeforeAfter, hasVideo].filter(Boolean).length > 1;

  // Single preview FIRST, then Before/After, then Video
  const defaultTab = hasPreview ? 'preview' : (hasBeforeAfter ? 'comparison' : (hasVideo ? 'video' : 'preview'));

  const [activeMediaTab, setActiveMediaTab] = useState(defaultTab);

  useEffect(() => {
    setActiveMediaTab(defaultTab);
    setSelectedImageIndex(0);
  }, [asset?.id, asset?.slug]);

  const handleShare = async (e) => {
    if (e) e.stopPropagation();
    const slugOrId = asset.slug || asset.id;
    const shareUrl = `${window.location.origin}/product/${slugOrId}`;

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent || '')) {
      try {
        await navigator.share({
          title: asset.name,
          text: asset.tagline || `Check out ${asset.name} on DaVinci Wale Bhaiya`,
          url: shareUrl,
        });
        return;
      } catch (_) {}
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      window.prompt('Copy product link:', shareUrl);
    }
  };

  const handleFreeDownload = async () => {
    if (isDownloading) return;
    setDownloadError('');
    setIsDownloading(true);
    setDownloadSuccess(false);
    setDownloadStatusText('Connecting to cloud storage...');

    try {
      setDownloadStatusText('Requesting secure download package...');
      const response = await fetch(`/api/products/${asset.slug || asset.id}/download`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setIsDownloading(false);
        setDownloadError('Download is currently unavailable. Please try again.');
        return;
      }

      if (!response.ok) {
        setIsDownloading(false);
        setDownloadError(
          data.error === 'R2 is not configured'
            ? 'Download storage is not configured yet.'
            : (data.error || 'Download unavailable.')
        );
        return;
      }

      const fileName = data.fileName || `${asset.slug || 'asset'}.zip`;
      setDirectDownloadUrl(data.url);
      setDirectDownloadName(fileName);
      setDownloadStatusText('Download package ready! Initiating transfer...');
      setDownloadSuccess(true);
      setIsDownloading(false);

      const link = document.createElement('a');
      link.href = data.url;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 500);
    } catch (err) {
      console.error('Download error:', err);
      setIsDownloading(false);
      setDownloadError('Network issue while initiating download. Please try again.');
    }
  };

  const handlePurchase = () => {
    window.location.href = `/checkout?product=${asset.slug || asset.id}`;
  };

  return (
    <div className="min-h-screen bg-[#04060c] text-white flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/#catalogue"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/60 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Store Catalogue</span>
          </Link>

          <button
            onClick={handleShare}
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-medium transition-all border ${
              copied
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'border-white/10 bg-white/[0.04] text-white/80 hover:text-white hover:border-white/30 hover:bg-white/[0.08]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Product Link</span>
              </>
            )}
          </button>
        </div>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Left Column: Media Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {canShowTabs && (
              <div className="flex items-center gap-2">
                {hasPreview && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      activeMediaTab === 'preview'
                        ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                        : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Single Preview</span>
                  </button>
                )}

                {hasBeforeAfter && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('comparison')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      activeMediaTab === 'comparison'
                        ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                        : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Before / After</span>
                  </button>
                )}

                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('video')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      activeMediaTab === 'video'
                        ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                        : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Demo Video</span>
                  </button>
                )}
              </div>
            )}

            {/* Media Container */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] bg-[#080d18] shadow-2xl min-h-[320px] sm:min-h-[460px]">
              {activeMediaTab === 'preview' && (thumbSrc || currentPreviewImage) && (
                <div className="w-full flex flex-col justify-center items-center bg-black/40 min-h-[380px] sm:min-h-[460px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentPreviewImage}
                    alt={asset.name}
                    className="w-full h-full object-contain max-h-[560px]"
                  />
                  {allPreviewImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto p-3 w-full bg-black/60 border-t border-white/10 scrollbar-none justify-center">
                      {allPreviewImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative w-16 h-10 rounded-lg overflow-hidden border transition-all shrink-0 cursor-pointer ${
                            selectedImageIndex === idx
                              ? 'border-blue-400 ring-2 ring-blue-500/40 opacity-100 scale-105'
                              : 'border-white/10 opacity-50 hover:opacity-80'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeMediaTab === 'comparison' && (
                hasBeforeAfter ? (
                  <BeforeAfterSlider
                    beforeSrc={beforeSrc}
                    afterSrc={afterSrc}
                    beforeLabel="Before"
                    afterLabel="After"
                  />
                ) : (
                  <div className="relative w-full h-[400px] sm:h-[480px] bg-gradient-to-b from-[#0a1224] to-[#040810] flex items-center justify-center p-8 text-center">
                    <div>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">{asset.name}</h4>
                      <p className="text-xs font-mono text-white/50">{asset.category} &bull; v{asset.version || '1.0'}</p>
                    </div>
                  </div>
                )
              )}

              {activeMediaTab === 'video' && (videoEmbedUrl || videoSrc) && (
                <div className="relative w-full h-full aspect-video min-h-[380px] sm:min-h-[460px] flex items-center justify-center bg-black">
                  {asset?.demoVideo && (String(asset.demoVideo).includes('youtu') || String(asset.demoVideo).includes('vimeo')) && (
                    <a
                      href={asset.demoVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white/80 hover:text-white text-xs font-mono backdrop-blur-md border border-white/15 transition-all shadow-md"
                      title="Watch video on original platform"
                    >
                      <span>Open External</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {videoEmbedUrl ? (
                    <iframe
                      key={videoEmbedUrl}
                      src={videoEmbedUrl}
                      title={`${asset.name} Demo Video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="w-full h-full min-h-[380px] sm:min-h-[460px] border-0"
                    />
                  ) : (
                    <video
                      src={videoSrc}
                      controls
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-contain max-h-[560px]"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Purchase Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-5 bg-gradient-to-b from-[#0e172a]/80 to-[#070b14]/90 border border-white/[0.1] rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 font-semibold uppercase tracking-wider">
                  {asset.category}
                </span>
                <span className="text-white/40">v{asset.version || '1.0'}</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {asset.name}
                </h1>
                <p className="text-sm text-white/70 mt-2 font-sans leading-relaxed">
                  {asset.tagline}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08]">
                {asset.type === 'free' ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold font-mono text-emerald-400">FREE</span>
                    <span className="text-xs font-mono text-white/40">Personal & Commercial License</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-bold font-mono text-white">
                        ₹{asset.price.toLocaleString()}
                      </span>
                      <span className="text-xs font-mono text-white/40">
                        One-time Perpetual License
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {asset.type === 'free' ? (
                  <button
                    onClick={handleFreeDownload}
                    disabled={isDownloading}
                    type="button"
                    className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center space-x-2 transition-all shadow-[0_0_24px_rgba(16,185,129,0.35)] disabled:opacity-50 active:scale-[0.99]"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Secure Link...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Download Ready</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Direct Free Download</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handlePurchase}
                    type="button"
                    className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center space-x-2 transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Buy Now &bull; Instant Access</span>
                  </button>
                )}
              </div>

              {/* Status or errors */}
              {isDownloading && (
                <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{downloadStatusText}</span>
                </div>
              )}

              {downloadSuccess && directDownloadUrl && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Download package ready!</span>
                  </div>
                  <p className="text-[11px] text-white/60 font-sans">
                    Your browser download started automatically. If it didn&apos;t begin, click below:
                  </p>
                  <a
                    href={directDownloadUrl}
                    download={directDownloadName || `${asset.slug || 'asset'}.zip`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-300 hover:text-emerald-200 underline pt-1 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Click here to manually download ({directDownloadName})</span>
                  </a>
                </div>
              )}

              {downloadError && (
                <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{downloadError}</span>
                </div>
              )}

              {/* Security & Guarantees */}
              <div className="pt-2 text-[11px] font-mono text-white/40 space-y-1.5 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Instant digital delivery with permanent updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>256-bit encrypted secure checkout via Razorpay</span>
                </div>
              </div>
            </div>

            {/* Quick Metadata Box */}
            <div className="bg-[#080d18]/60 border border-white/[0.08] rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-white/50">
                <span>Compatibility</span>
                <span className="text-white font-medium">{asset.compatibility?.join(', ') || 'DaVinci Resolve Studio / Free'}</span>
              </div>
              <div className="flex justify-between items-center text-white/50 border-t border-white/[0.06] pt-2">
                <span>Platform</span>
                <span className="text-white font-medium">{asset.os || 'macOS & Windows'}</span>
              </div>
              {asset.fileSize && (
                <div className="flex justify-between items-center text-white/50 border-t border-white/[0.06] pt-2">
                  <span>Download Size</span>
                  <span className="text-white font-medium">{asset.fileSize}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Description & What's Included */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#080d18]/70 border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-white/50">
                Detailed Overview
              </h2>
              <div className="text-sm text-white/80 font-sans leading-relaxed whitespace-pre-line space-y-4">
                {asset.description}
              </div>
            </div>

            {Array.isArray(asset.installation) && asset.installation.length > 0 && (
              <div className="bg-[#080d18]/70 border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
                <h2 className="text-sm font-mono uppercase tracking-widest text-white/50">
                  Installation Guide
                </h2>
                <ol className="space-y-3 font-sans text-sm text-white/80 list-decimal list-inside">
                  {asset.installation.map((step, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">
                      <span className="font-mono text-blue-400 mr-2">0{idx + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            {Array.isArray(asset.included) && asset.included.length > 0 && (
              <div className="bg-[#080d18]/70 border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
                <h2 className="text-sm font-mono uppercase tracking-widest text-white/50">
                  What&apos;s Included In The Package
                </h2>
                <ul className="space-y-2.5 font-mono text-xs text-white/80">
                  {asset.included.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Assets Section */}
        {relatedAssets.length > 0 && (
          <div className="border-t border-white/[0.08] pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-blue-400">Discover More</span>
                <h3 className="text-2xl font-bold tracking-tight text-white mt-1">Related Creative Assets</h3>
              </div>
              <Link
                href="/#catalogue"
                className="text-xs font-mono uppercase tracking-wider text-white/60 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedAssets.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.slug || rel.id}`}
                  className="group relative border border-white/[0.1] hover:border-blue-400/40 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/90 to-[#070b14]/90 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-2">
                      <span className="uppercase text-blue-300 font-semibold">{rel.category}</span>
                      <span>v{rel.version || '1.0'}</span>
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">
                      {rel.name}
                    </h4>
                    <p className="text-xs text-white/60 mt-1 line-clamp-2">
                      {rel.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                    <div>
                      {rel.type === 'free' ? (
                        <span className="text-emerald-400 font-bold">FREE</span>
                      ) : (
                        <span className="text-white font-bold">₹{rel.price?.toLocaleString()}</span>
                      )}
                    </div>
                    <span className="text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View Details &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
