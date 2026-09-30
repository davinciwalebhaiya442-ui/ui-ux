'use client';

import { useState } from 'react';
import { Sparkles, Activity, Layers, Sliders, Film, Grid, Disc } from 'lucide-react';

export default function ProductCardVisual({ asset }) {
  const [imageError, setImageError] = useState(false);

  const rawImage = asset?.thumbnailKey || (Array.isArray(asset?.previewImages) && asset.previewImages[0]) || asset?.image;
  const imageUrl = rawImage
    ? (String(rawImage).startsWith('http') || String(rawImage).startsWith('/')
        ? rawImage
        : `/api/media?key=${encodeURIComponent(rawImage)}`)
    : null;

  if (imageUrl && !imageError) {
    return (
      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg bg-[#070b14] border border-white/[0.08] mb-4 group/img">
        <img
          src={imageUrl}
          alt={asset?.name || 'Product preview'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Soft category chip */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/70 uppercase tracking-wider">
          {asset?.category || 'Asset'}
        </div>
      </div>
    );
  }

  // Cinematic Visual Previews for built-in creative tools
  const slug = asset?.slug || asset?.id || '';

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg bg-[#05070d] border border-white/[0.08] mb-4 flex items-center justify-center group/preview">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* 1. AUTO TRACER */}
      {slug === 'auto-tracer' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          <div className="w-36 h-20 rounded border border-dashed border-blue-400/70 relative flex items-center justify-center bg-blue-500/[0.04]">
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-blue-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-blue-400" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-blue-400" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-blue-400" />
            <div className="text-center">
              <span className="text-[9px] font-mono text-blue-300 font-semibold tracking-wider block">
                POINT CLOUD TRACK
              </span>
              <span className="text-[8px] font-mono text-white/40 block mt-0.5">
                99.4% CONFIDENCE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. FLUID RIPPLE */}
      {slug === 'ripple-effect' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-sky-400/20 animate-ping opacity-30" />
            <div className="w-20 h-20 rounded-full border border-sky-400/40 relative flex items-center justify-center bg-sky-500/[0.03]">
              <div className="w-12 h-12 rounded-full border border-sky-300/60 flex items-center justify-center bg-sky-400/[0.08]">
                <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_12px_#38bdf8]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. YT DOWNLOADER */}
      {slug === 'yt-downloader' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          <div className="w-40 space-y-2">
            <div className="flex items-center justify-between text-[8px] font-mono text-white/40">
              <span>VOCAL</span>
              <div className="flex-1 mx-2 h-1 bg-white/10 rounded overflow-hidden">
                <div className="h-full bg-emerald-400 w-3/4 rounded" />
              </div>
              <span className="text-emerald-400"> stems</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-white/40">
              <span>DRUMS</span>
              <div className="flex-1 mx-2 h-1 bg-white/10 rounded overflow-hidden">
                <div className="h-full bg-blue-400 w-5/6 rounded" />
              </div>
              <span className="text-blue-400"> 48kHz</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-white/40">
              <span>PRORES</span>
              <div className="flex-1 mx-2 h-1 bg-white/10 rounded overflow-hidden">
                <div className="h-full bg-amber-400 w-full rounded" />
              </div>
              <span className="text-amber-400"> 4K 10b</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. MOLTEN CHROME */}
      {slug === 'metallic-liquid' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-700 via-zinc-200 to-zinc-900 border border-white/20 shadow-[0_0_24px_rgba(255,255,255,0.15)] flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-bl from-zinc-100 via-zinc-800 to-zinc-300 opacity-90" />
          </div>
        </div>
      )}

      {/* 5. ANAMORPHIC GRID WIPE */}
      {slug === 'grid-effect-transition' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-36 h-20 grid grid-cols-4 grid-rows-3 gap-1 border border-cyan-500/30 p-1 bg-cyan-950/10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border border-cyan-400/20 bg-cyan-400/[0.04]" />
            ))}
          </div>
          <div className="absolute inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee]" />
        </div>
      )}

      {/* 6. KODAK 2383 PRINT DCTL */}
      {slug === 'kodak-2383-print' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="w-40 h-20 border border-amber-500/30 rounded bg-amber-950/[0.08] p-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[8px] font-mono text-amber-300/70">
              <span>KODAK 2383</span>
              <span>D65 PRINT</span>
            </div>
            <div className="h-8 flex items-center">
              <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                <path d="M 0 25 C 30 25, 40 15, 60 8 C 80 2, 90 2, 100 2" stroke="#f59e0b" strokeWidth="2" />
                <path d="M 0 28 C 30 28, 40 18, 60 12 C 80 6, 90 6, 100 6" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
              </svg>
            </div>
            <div className="text-[7px] font-mono text-white/30 text-right">PHOTORECEPTOR ROLL-OFF</div>
          </div>
        </div>
      )}

      {/* 7. OPTICAL HALATION & BLOOM */}
      {slug === 'halation-bloom-dctl' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-red-600/20 blur-md absolute" />
          <div className="w-14 h-14 rounded-full bg-red-500/30 border border-red-500/50 flex items-center justify-center relative">
            <div className="w-6 h-6 rounded-full bg-white shadow-[0_0_18px_#ef4444]" />
          </div>
        </div>
      )}

      {/* FALLBACK FOR ANY OTHER CREATED PRODUCTS */}
      {!['auto-tracer', 'ripple-effect', 'yt-downloader', 'metallic-liquid', 'grid-effect-transition', 'kodak-2383-print', 'halation-bloom-dctl'].includes(slug) && (
        <div className="flex flex-col items-center justify-center text-white/30 space-y-1">
          <Layers className="w-6 h-6" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
            {asset?.category || 'Creative Asset'}
          </span>
        </div>
      )}

      {/* Top Left Badge */}
      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/60 uppercase tracking-wider">
        {asset?.category || 'Asset'}
      </div>

      {/* Top Right Version */}
      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/50">
        v{asset?.version || '1.0'}
      </div>
    </div>
  );
}
