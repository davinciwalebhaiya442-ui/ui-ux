'use client';

import { useEffect, useState } from 'react';
import { X, Check, Download, ShoppingBag, ArrowRight } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function ProductModal({ asset, onClose }) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [purchaseStage, setPurchaseStage] = useState('idle');

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

  if (!asset) return null;

  const handleFreeDownload = async () => {
    setDownloadError('');
    const response = await fetch(`/api/products/${asset.slug || asset.id}/download`, { method: 'POST' });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      window.location.href = `/login?next=/`;
      return;
    }
    if (!response.ok) {
      setDownloadError(data.error === 'R2 is not configured' ? 'Download storage is not configured yet.' : (data.error || 'Download unavailable.'));
      return;
    }
    setDownloadSuccess(true);
    window.location.href = data.url;
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handlePurchase = () => {
    window.location.href = `/checkout?product=${asset.slug || asset.id}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/85 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#080808] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden z-10 my-auto">
        
        {/* Top Minimal Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-black">
          <div className="text-[11px] font-mono uppercase tracking-wider text-white/40">
            {asset.category} &bull; v{asset.version}
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-10 max-h-[85vh] overflow-y-auto space-y-10">
          
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

            {/* Visual Demonstration */}
            {asset.id === 'kodak-2383-print' || asset.previewType === 'lut' ? (
              <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                <BeforeAfterSlider />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-xl bg-[#040404] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex justify-between text-[11px] font-mono text-white/40">
                  <span>PREVIEW STREAM</span>
                  <span>{asset.fileSize} &bull; {asset.os}</span>
                </div>

                <div className="text-center my-8">
                  <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-widest">
                    {asset.name.toUpperCase()}
                  </div>
                  <div className="text-xs font-mono text-white/50 mt-1">
                    {asset.compatibility.join(', ')}
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>WORLDWIDE COMMERCIAL LICENSE INCLUDED</span>
                  <span>PERPETUAL ACCESS</span>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4">
              {asset.type === 'free' ? (
                <button
                  onClick={handleFreeDownload}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-xs font-semibold text-black bg-white hover:bg-white/90 transition-colors flex items-center justify-center space-x-2"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Download Archive Triggered (.ZIP)</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Free Archive ({asset.fileSize})</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2"
                >
                  {purchaseStage === 'processing' ? (
                    <span>Opening Checkout Gateway...</span>
                  ) : purchaseStage === 'ready' ? (
                    <span>Gateway Connected &bull; Ready</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Purchase License &bull; ₹{asset.price.toLocaleString()}</span>
                    </>
                  )}
                </button>
              )}
              {downloadError && <p className="mt-3 text-xs text-amber-300">{downloadError}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-8 border-t border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase tracking-widest text-white/40 block">
              Overview
            </span>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans max-w-2xl">
              {asset.description}
            </p>
          </div>

          {/* What's Included */}
          <div className="space-y-4 pt-8 border-t border-white/[0.08]">
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

          {/* Installation */}
          <div className="space-y-4 pt-8 border-t border-white/[0.08]">
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

        </div>

      </div>
    </div>
  );
}
