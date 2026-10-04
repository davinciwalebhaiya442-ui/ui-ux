'use client';

import { useState } from 'react';
import { useProducts } from '@/data/useProducts';
import { ASSETS } from '@/data/assets';
import { ArrowUpRight, Check, Download, Monitor, Terminal, Sparkles, Star } from 'lucide-react';

const resolveUrl = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) {
    return str;
  }
  return `/api/media?key=${encodeURIComponent(str)}`;
};

const getCardImage = (product) => {
  if (!product) return null;
  const raw =
    product.thumbnailKey ||
    (Array.isArray(product.previewImages) && product.previewImages[0]) ||
    product.image ||
    product.beforeImage ||
    product.afterImage;
  if (!raw) return null;
  return resolveUrl(raw);
};

function FeaturedMediaBox({ src, alt, category, fallback, className = 'aspect-[16/10] sm:aspect-[16/9]' }) {
  const [hasError, setHasError] = useState(false);

  if (src && !hasError) {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden bg-[#070b16] border border-white/[0.12] shadow-2xl group/media transition-all duration-300 ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18)_0%,transparent_75%)] pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || 'Product preview'}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050812]/90 via-[#050812]/20 to-transparent pointer-events-none" />
        {category && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#070b14]/90 backdrop-blur-md border border-white/15 text-[10px] font-mono text-blue-300 uppercase tracking-wider font-semibold shadow-md">
            {category}
          </div>
        )}
      </div>
    );
  }

  return fallback;
}

export default function FeaturedAssets({ onSelectAsset, initialProducts = [] }) {
  const assets = useProducts(initialProducts);

  // 1. Prioritize products from Admin Panel / Database
  const dbFeatured = assets.filter((a) => a.featured);
  const dbNonFeatured = assets.filter((a) => !a.featured);
  const prioritizedDb = [...dbFeatured, ...dbNonFeatured];

  // 2. Map 5 slots: use DB products first, then fallback to distinct static ASSETS (no duplicates!)
  const usedSlugs = new Set();

  const getSlotProduct = (index, fallbackIndex) => {
    if (prioritizedDb[index]) {
      usedSlugs.add(prioritizedDb[index].slug || prioritizedDb[index].id);
      return prioritizedDb[index];
    }
    // Find a fallback asset that hasn't been used yet
    const fallback =
      ASSETS.find((a, i) => i === fallbackIndex && !usedSlugs.has(a.id) && !usedSlugs.has(a.slug)) ||
      ASSETS.find((a) => !usedSlugs.has(a.id) && !usedSlugs.has(a.slug)) ||
      ASSETS[fallbackIndex] ||
      ASSETS[0];
    if (fallback) usedSlugs.add(fallback.slug || fallback.id);
    return fallback;
  };

  const card1 = getSlotProduct(0, 0);
  const card2 = getSlotProduct(1, 1);
  const card3 = getSlotProduct(2, 2);
  const card4 = getSlotProduct(3, 3);
  const card5 = getSlotProduct(4, 4);

  const card1Img = getCardImage(card1);
  const card2Img = getCardImage(card2);
  const card3Img = getCardImage(card3);
  const card4Img = getCardImage(card4);
  const card5Img = getCardImage(card5);

  return (
    <section id="featured" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Editorial Section Introduction */}
      <div className="border-b border-white/[0.08] pb-12 mb-20 flex flex-col md:flex-row md:items-baseline justify-between gap-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-2">
            01 / Curated Releases
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Tools for Working Colorists & Editors
          </h2>
        </div>
        <p className="max-w-md text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
          Engineered inside DaVinci Resolve suites. Built to solve real timeline friction—without subscriptions, license dongles, or bloat.
        </p>
      </div>

      {/* 1. AUTO TRACER / FLAGSHIP SHOWCASE — WIDESCREEN FLAGSHIP */}
      {card1 && (
        <div className="mb-20">
          <div 
            onClick={() => onSelectAsset(card1)}
            className="cursor-pointer group relative border border-white/[0.14] hover:border-blue-400/50 transition-all duration-300 bg-gradient-to-b from-[#0e1628]/95 via-[#0a0f1d]/95 to-[#070b14]/95 shadow-[0_12px_40px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_55px_rgba(14,35,80,0.5),0_0_30px_rgba(37,99,235,0.2)] rounded-3xl overflow-hidden hover:-translate-y-0.5"
          >
            {/* Subtle top edge glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              {/* Visual Preview Window (7 Cols) */}
              <div className="lg:col-span-7 bg-gradient-to-b from-[#080d1a] to-[#050812] p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.1] flex flex-col justify-between min-h-[380px]">
                
                {/* Top Viewport Header */}
                <div className="flex items-center justify-between text-[11px] font-mono text-white/50 border-b border-white/[0.08] pb-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    <span className="text-white/90 font-medium uppercase">{card1.category || 'COLOR PAGE OPENFX'}</span>
                  </div>
                  <span className="text-white/40 font-mono">
                    {card1.compatibility?.[0] || 'DAVINCI RESOLVE STUDIO'}
                  </span>
                </div>

                {/* Central Media / Graphic */}
                <div className="my-auto py-2">
                  <FeaturedMediaBox
                    src={card1Img}
                    alt={card1.name}
                    category={card1.category}
                    className="aspect-[16/10] sm:aspect-[16/9] w-full"
                    fallback={
                      <div className="my-4 py-8 px-6 rounded-2xl border border-white/[0.08] bg-[#070b16]/80 backdrop-blur-md shadow-inner">
                        <div className="flex justify-between items-center text-[10px] font-mono text-white/50 mb-6">
                          <span>GPU ENGINE: METAL / CUDA</span>
                          <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">CONFIDENCE: 99.4%</span>
                        </div>

                        <div className="h-28 flex items-center justify-center relative">
                          <div className="w-56 h-20 rounded-lg border border-dashed border-blue-400/70 flex items-center justify-center relative bg-blue-500/[0.04] shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-blue-400" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-blue-400" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-blue-400" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-blue-400" />
                            
                            <div className="text-center">
                              <span className="text-[10px] font-mono text-white/95 tracking-widest block font-medium uppercase">
                                {card1.name || 'FACIAL ISOLATION MATTE'}
                              </span>
                              <span className="text-[9px] font-mono text-blue-300/60 block mt-0.5">
                                GPU ACCELERATED &bull; NATIVE OFX
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between text-[10px] font-mono text-white/40 mt-6 pt-2 border-t border-white/[0.06]">
                          <span>RESOLUTION: UP TO 12K DCI</span>
                          <span>ACCELERATION: GPU NATIVE</span>
                        </div>
                      </div>
                    }
                  />
                </div>

                {/* Bottom Tags */}
                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-white/60 mt-6 pt-2">
                  {Array.isArray(card1.compatibility) && card1.compatibility.length > 0 ? (
                    card1.compatibility.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]">
                        {item}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]">DaVinci Resolve Studio 18/19</span>
                      <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]">macOS (Apple Silicon/Intel)</span>
                      <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]">Windows 10/11</span>
                    </>
                  )}
                </div>
              </div>

              {/* Information Column (5 Cols) */}
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-[#0c1220] to-[#080d18]">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {card1.category || 'OpenFX Plugin'}
                    </span>
                    <span className="text-[11px] font-mono text-white/50">
                      v{card1.version || '1.0'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-blue-200 transition-colors font-sans">
                    {card1.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                    {card1.tagline || card1.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    {Array.isArray(card1.included) && card1.included.length > 0 ? (
                      card1.included.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs text-white/80">
                          <span className="text-blue-400 font-mono mt-0.5">&bull;</span>
                          <span>{feat}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start space-x-2 text-xs text-white/80">
                          <span className="text-blue-400 font-mono mt-0.5">&bull;</span>
                          <span>Native GPU accelerated Color Page integration</span>
                        </div>
                        <div className="flex items-start space-x-2 text-xs text-white/80">
                          <span className="text-blue-400 font-mono mt-0.5">&bull;</span>
                          <span>Full ACES and DaVinci YRGB Color Management</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-8 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                      {card1.type === 'free' ? 'Instant Download' : 'Perpetual License'}
                    </div>
                    {card1.type === 'free' ? (
                      <div className="text-xl font-bold font-mono text-emerald-400">FREE</div>
                    ) : (
                      <div className="text-xl font-bold font-mono text-white">
                        ₹{Number(card1.price || 0).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Primary High-Affordance Action Pill */}
                  <span className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-white px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
                    <span>{card1.type === 'free' ? 'Download Free ↗' : 'Buy Now ↗'}</span>
                  </span>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2 & 3. ASYMMETRIC PAIR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* CARD 2 (7 Cols) */}
        {card2 && (
          <div 
            onClick={() => onSelectAsset(card2)}
            className="lg:col-span-7 cursor-pointer group border border-white/[0.12] hover:border-sky-400/40 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(14,165,233,0.18)] hover:-translate-y-0.5"
          >
            <div>
              {/* Visual Demonstration */}
              <div className="mb-6">
                <FeaturedMediaBox
                  src={card2Img}
                  alt={card2.name}
                  category={card2.category}
                  className="aspect-[16/9] w-full"
                  fallback={
                    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-b from-[#0a1120] to-[#050810] border border-white/[0.1] p-6 flex flex-col justify-between relative shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0%,transparent_70%)] pointer-events-none" />
                      
                      <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-white/60">
                        <span className="font-semibold text-sky-300 uppercase">{card2.category || 'SURFACE REFRACTION'}</span>
                        <span>v{card2.version || '1.0'}</span>
                      </div>

                      <div className="relative z-10 text-center my-4">
                        <div className="w-20 h-20 mx-auto rounded-full border border-sky-400/40 relative flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.2)]">
                          <div className="w-14 h-14 rounded-full border border-sky-400/30" />
                          <div className="w-7 h-7 rounded-full bg-sky-400/20" />
                        </div>
                        <span className="text-[10px] font-mono text-sky-300 uppercase tracking-widest mt-3 block font-semibold">
                          {card2.name}
                        </span>
                      </div>

                      <div className="relative z-10 flex justify-between text-[10px] font-mono text-white/50">
                        <span>{card2.compatibility?.[0] || 'DAVINCI RESOLVE / FUSION'}</span>
                        <span>{card2.fileSize || 'GPU ACCELERATED'}</span>
                      </div>
                    </div>
                  }
                />
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                  {card2.category || 'Macro'} &bull; v{card2.version || '1.0'}
                </span>
                <span className="text-sm font-mono text-white font-bold">
                  {card2.type === 'free' ? (
                    <span className="text-emerald-400">FREE</span>
                  ) : (
                    <>₹{Number(card2.price || 0).toLocaleString()}</>
                  )}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors font-sans">
                {card2.name}
              </h3>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mt-2 font-sans">
                {card2.tagline || card2.description}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <span className="text-white/50">{card2.fileSize || 'Instant Digital Delivery'}</span>
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 group-hover:bg-sky-500 group-hover:text-black font-semibold transition-all">
                <span>{card2.type === 'free' ? 'Download Free ↗' : 'Buy Now ↗'}</span>
              </span>
            </div>
          </div>
        )}

        {/* CARD 3 (5 Cols) */}
        {card3 && (
          <div 
            onClick={() => onSelectAsset(card3)}
            className="lg:col-span-5 cursor-pointer group border border-white/[0.12] hover:border-emerald-400/40 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.18)] hover:-translate-y-0.5"
          >
            <div>
              {/* Functional UI Mockup or Image */}
              <div className="mb-6">
                <FeaturedMediaBox
                  src={card3Img}
                  alt={card3.name}
                  category={card3.category}
                  className="aspect-[16/9] w-full"
                  fallback={
                    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-b from-[#0a1120] to-[#050810] border border-white/[0.1] p-5 flex flex-col justify-between relative shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none" />

                      <div className="relative z-10 flex justify-between text-[10px] font-mono text-emerald-400 font-semibold">
                        <span className="uppercase">{card3.category || 'LOCAL DESKTOP UTILITY'}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                          {card3.type === 'free' ? '100% FREE' : 'PRO TOOL'}
                        </span>
                      </div>

                      <div className="relative z-10 p-3 rounded-lg bg-[#070d18] border border-white/[0.1] text-[11px] font-mono text-white/80 truncate shadow-sm my-auto">
                        {card3.name} &bull; v{card3.version || '1.0'}
                      </div>

                      <div className="relative z-10 space-y-1 text-[10px] font-mono text-white/50">
                        <div>STEMS: VOCALS &bull; MUSIC &bull; AUDIO</div>
                        <div>CODEC: APPLE PRORES / H.264</div>
                      </div>
                    </div>
                  }
                />
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {card3.category || 'Standalone Tool'}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                  {card3.type === 'free' ? 'FREE DOWNLOAD' : `₹${Number(card3.price || 0).toLocaleString()}`}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors font-sans">
                {card3.name}
              </h3>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mt-2 font-sans">
                {card3.tagline || card3.description}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <span className="text-white/50">{card3.fileSize || 'macOS / Windows'}</span>
              <span className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-black font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span>{card3.type === 'free' ? 'Download Free ↗' : 'Buy Now ↗'}</span>
              </span>
            </div>
          </div>
        )}

      </div>

      {/* 4 & 5. COMPACT CURATED ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARD 4 */}
        {card4 && (
          <div 
            onClick={() => onSelectAsset(card4)}
            className="cursor-pointer group border border-white/[0.12] hover:border-slate-300/40 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(148,163,184,0.18)] hover:-translate-y-0.5"
          >
            <div>
              {card4Img && (
                <div className="mb-4">
                  <FeaturedMediaBox
                    src={card4Img}
                    alt={card4.name}
                    category={card4.category}
                    className="aspect-[16/9] w-full"
                    fallback={null}
                  />
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] font-mono text-white/60 mb-2">
                <span className="text-slate-300 uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">
                  {card4.category || 'FUSION COMPOSITION'}
                </span>
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {card4.type === 'free' ? 'FREE ASSET' : `₹${Number(card4.price || 0).toLocaleString()}`}
                </span>
              </div>

              <h4 className="text-lg font-bold text-white group-hover:text-slate-200 transition-colors mt-2 font-sans">
                {card4.name}
              </h4>

              <p className="text-xs sm:text-sm text-white/70 mt-1.5 leading-relaxed font-sans">
                {card4.tagline || card4.description}
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-white/[0.08] flex justify-between items-center text-xs font-mono">
              <span className="text-white/50">{card4.compatibility?.[0] || 'DaVinci Resolve'} &bull; {card4.fileSize || 'Digital Asset'}</span>
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-white/[0.08] text-white group-hover:bg-white group-hover:text-black font-semibold transition-all">
                <span>{card4.type === 'free' ? 'Download Free ↗' : 'Buy Now ↗'}</span>
              </span>
            </div>
          </div>
        )}

        {/* CARD 5 */}
        {card5 && (
          <div 
            onClick={() => onSelectAsset(card5)}
            className="cursor-pointer group border border-white/[0.12] hover:border-blue-400/40 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.18)] hover:-translate-y-0.5"
          >
            <div>
              {card5Img && (
                <div className="mb-4">
                  <FeaturedMediaBox
                    src={card5Img}
                    alt={card5.name}
                    category={card5.category}
                    className="aspect-[16/9] w-full"
                    fallback={null}
                  />
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] font-mono text-white/60 mb-2">
                <span className="text-blue-400 uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  {card5.category || 'TIMELINE TRANSITION'}
                </span>
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {card5.type === 'free' ? 'FREE ASSET' : `₹${Number(card5.price || 0).toLocaleString()}`}
                </span>
              </div>

              <h4 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors mt-2 font-sans">
                {card5.name}
              </h4>

              <p className="text-xs sm:text-sm text-white/70 mt-1.5 leading-relaxed font-sans">
                {card5.tagline || card5.description}
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-white/[0.08] flex justify-between items-center text-xs font-mono">
              <span className="text-white/50">{card5.compatibility?.[0] || 'DaVinci Resolve'} &bull; {card5.fileSize || 'Digital Asset'}</span>
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-white/[0.08] text-white group-hover:bg-white group-hover:text-black font-semibold transition-all">
                <span>{card5.type === 'free' ? 'Download Free ↗' : 'Buy Now ↗'}</span>
              </span>
            </div>
          </div>
        )}

      </div>

    </section>
  );
}
