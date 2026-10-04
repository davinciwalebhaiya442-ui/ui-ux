'use client';

import { useEffect, useState } from 'react';
import { X, Check, Download, ShoppingBag, SlidersHorizontal, Image as ImageIcon, Film, Loader2, CheckCircle2, AlertCircle, Share2, Link2 } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function ProductModal({ asset, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadStatusText, setDownloadStatusText] = useState('');
  const [directDownloadUrl, setDirectDownloadUrl] = useState('');
  const [directDownloadName, setDirectDownloadName] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [purchaseStage, setPurchaseStage] = useState('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const resolveUrl = (val) => {
    if (!val) return '';
    const str = String(val).trim();
    if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) {
      return str;
    }
    return `/api/media?key=${encodeURIComponent(str)}`;
  };

  const beforeSrc = resolveUrl(asset?.beforeImage);
  const afterSrc = resolveUrl(asset?.afterImage);
  const thumbSrc = resolveUrl(asset?.thumbnailKey || (Array.isArray(asset?.previewImages) && asset.previewImages[0]));
  const videoSrc = resolveUrl(asset?.demoVideo);

  const hasBeforeAfter = Boolean(beforeSrc || afterSrc);
  const isColorGradingCategory =
    asset?.id === 'kodak-2383-print' ||
    asset?.previewType === 'lut' ||
    asset?.category?.toLowerCase().includes('color') ||
    asset?.category?.toLowerCase().includes('lut') ||
    asset?.category?.toLowerCase().includes('grade');

  const shouldDefaultToComparison = hasBeforeAfter || isColorGradingCategory;

  const [activeMediaTab, setActiveMediaTab] = useState(
    shouldDefaultToComparison ? 'comparison' : (thumbSrc ? 'preview' : (videoSrc ? 'video' : 'comparison'))
  );

  if (!asset) return null;

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

      // Trigger automatic browser download via link click
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

  const canShowTabs = (shouldDefaultToComparison || hasBeforeAfter) && (thumbSrc || videoSrc);

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#080808] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden z-10 my-auto">
        
        {/* Top Minimal Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-black">
          <div className="text-[11px] font-mono uppercase tracking-wider text-white/40">
            {asset.category} &bull; v{asset.version || '1.0'}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all border ${
                copied
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:border-white/30 hover:bg-white/[0.08]'
              }`}
              title="Share product link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Link</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-10 max-h-[85vh] overflow-y-auto space-y-8">
          
          {/* Header & Primary Meta */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                  {asset.name}
                </h2>
                <p className="text-xs sm:text-sm text-white/60 mt-1 font-sans">
                  {asset.tagline}
                </p>
              </div>

              {/* Price Tag */}
              <div className="text-left sm:text-right">
                {asset.type === 'free' ? (
                  <div className="text-xl font-bold font-mono text-emerald-400">FREE</div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold font-mono text-white">
                      ₹{asset.price.toLocaleString()}
                    </div>
                    <div className="text-xs font-mono text-white/40">(${asset.priceUSD} USD perpetual)</div>
                  </div>
                )}
              </div>
            </div>

            {/* Media Mode Switcher (if multiple media views available) */}
            {canShowTabs && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('comparison')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                    activeMediaTab === 'comparison'
                      ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                      : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Before / After</span>
                </button>

                {thumbSrc && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      activeMediaTab === 'preview'
                        ? 'bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                        : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Single Preview</span>
                  </button>
                )}

                {videoSrc && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('video')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
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

            {/* Visual Demonstration Render Area */}
            {activeMediaTab === 'comparison' || (shouldDefaultToComparison && activeMediaTab !== 'preview' && activeMediaTab !== 'video') ? (
              <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                <BeforeAfterSlider
                  beforeSrc={beforeSrc}
                  afterSrc={afterSrc}
                  beforeLabel="Before"
                  afterLabel="After"
                />
              </div>
            ) : activeMediaTab === 'video' && videoSrc ? (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] bg-black">
                <video
                  src={videoSrc}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            ) : thumbSrc ? (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/[0.08] relative bg-[#040404]">
                <img
                  src={thumbSrc}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-xl bg-[#040404] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex justify-between text-[11px] font-mono text-white/40">
                  <span>PREVIEW STREAM</span>
                  <span>{asset.fileSize || 'Standard Archive'} &bull; {asset.os}</span>
                </div>

                <div className="text-center my-8">
                  <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-widest">
                    {asset.name.toUpperCase()}
                  </div>
                  <div className="text-xs font-mono text-white/50 mt-1">
                    {Array.isArray(asset.compatibility) ? asset.compatibility.join(', ') : ''}
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>WORLDWIDE COMMERCIAL LICENSE INCLUDED</span>
                  <span>PERPETUAL ACCESS</span>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 space-y-3">
              {asset.type === 'free' ? (
                <div className="space-y-2">
                  <button
                    onClick={handleFreeDownload}
                    disabled={isDownloading}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-2.5 ${
                      isDownloading
                        ? 'bg-blue-600 text-white cursor-wait opacity-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                        : downloadSuccess
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'text-black bg-white hover:bg-white/90 active:scale-[0.98]'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Preparing Download Package...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-black stroke-[3]" />
                        <span>Download Started! Check Browser Downloads</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Free Archive ({asset.fileSize || 'Asset Package'})</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-emerald-400/80 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Free Community Edition: Direct browser zip download.</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handlePurchase}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(37,99,235,0.35)]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Purchase License &bull; ₹{asset.price.toLocaleString()}</span>
                  </button>
                  <p className="text-[11px] text-white/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>Licensed Edition: Full digital zip package will be emailed to your inbox upon payment.</span>
                  </p>
                </div>
              )}

              {/* Instant Visual Progress & Status Box */}
              {isDownloading && (
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center space-x-3 text-xs text-blue-200 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">Preparing secure download link...</p>
                    <p className="text-[11px] text-blue-300/80">{downloadStatusText || 'Connecting to DavinciWaleBhaiya cloud storage...'}</p>
                  </div>
                </div>
              )}

              {downloadSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Download file sent to browser! Look at your browser downloads icon (top-right or bottom-bar).</span>
                  </div>
                  {directDownloadUrl && (
                    <div className="text-[11px] text-white/70 pl-6">
                      Did not start automatically?{' '}
                      <a
                        href={directDownloadUrl}
                        download={directDownloadName || 'archive.zip'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 underline hover:text-emerald-300 font-semibold ml-1"
                      >
                        Click here to download directly ({directDownloadName || 'Asset File'})
                      </a>
                    </div>
                  )}
                </div>
              )}

              {downloadError && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center space-x-2.5 text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{downloadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-6 border-t border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase tracking-widest text-white/40 block">
              Overview
            </span>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans max-w-2xl whitespace-pre-line">
              {asset.description}
            </p>
          </div>

          {/* What's Included */}
          {Array.isArray(asset.included) && asset.included.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/[0.08]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/40 block">
                What&apos;s Included In Download
              </span>
              <div className="space-y-2 max-w-xl">
                {asset.included.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs text-white/80 font-sans">
                    <span className="text-white/40 font-mono mt-0.5">&bull;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Installation */}
          {Array.isArray(asset.installation) && asset.installation.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/[0.08]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/40 block">
                Installation Instructions
              </span>
              <div className="space-y-2.5 max-w-2xl font-sans">
                {asset.installation.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs text-white/70">
                    <span className="text-white/40 font-mono font-semibold">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

