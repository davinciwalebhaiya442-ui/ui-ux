'use client';

import { useProducts } from '@/data/useProducts';
import { ArrowUpRight, Check, Download, Monitor, Terminal } from 'lucide-react';

export default function FeaturedAssets({ onSelectAsset }) {
  const assets = useProducts();
  const autoTracer = assets.find((a) => a.id === 'auto-tracer');
  const rippleEffect = assets.find((a) => a.id === 'ripple-effect');
  const ytDownloader = assets.find((a) => a.id === 'yt-downloader');
  const metallicLiquid = assets.find((a) => a.id === 'metallic-liquid');
  const gridTransition = assets.find((a) => a.id === 'grid-effect-transition');

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

      {/* 1. AUTO TRACER OFX — WIDESCREEN FLAGSHIP SHOWCASE */}
      <div className="mb-20">
        <div 
          onClick={() => onSelectAsset(autoTracer)}
          className="cursor-pointer group border border-white/[0.08] hover:border-white/20 transition-colors bg-[#080808] rounded-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Visual Preview Window (7 Cols) */}
            <div className="lg:col-span-7 bg-[#040404] p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col justify-between min-h-[380px]">
              
              {/* Top Viewport Header */}
              <div className="flex items-center justify-between text-[11px] font-mono text-white/40 border-b border-white/[0.06] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-white/80">COLOR PAGE OPENFX</span>
                </div>
                <span>NODE 04 &bull; POWER WINDOW TRACK</span>
              </div>

              {/* Central Tracking Graphic */}
              <div className="my-8 py-8 px-6 rounded-xl border border-white/[0.06] bg-black/60">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mb-6">
                  <span>GPU ENGINE: METAL / CUDA</span>
                  <span className="text-emerald-400 font-semibold">CONFIDENCE: 99.4%</span>
                </div>

                <div className="h-28 flex items-center justify-center relative">
                  <div className="w-56 h-20 rounded-lg border border-dashed border-blue-400/60 flex items-center justify-center relative bg-blue-500/[0.02]">
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-blue-400" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-blue-400" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-blue-400" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-blue-400" />
                    
                    <div className="text-center">
                      <span className="text-[10px] font-mono text-white/90 tracking-widest block font-medium">
                        FACIAL ISOLATION MATTE
                      </span>
                      <span className="text-[9px] font-mono text-white/40 block mt-0.5">
                        OFFSET &plusmn;0.02px &bull; OCCLUSION LOCK
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-white/40 mt-6 pt-2 border-t border-white/[0.06]">
                  <span>RESOLUTION: UP TO 12K DCI</span>
                  <span>ACCELERATION: GPU NATIVE</span>
                </div>
              </div>

              {/* Bottom Tags */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-white/50">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">DaVinci Resolve Studio 18/19</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">macOS (Apple Silicon/Intel)</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Windows 10/11</span>
              </div>
            </div>

            {/* Information Column (5 Cols) */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-[#080808]">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400">
                    OpenFX Plugin
                  </span>
                  <span className="text-[11px] font-mono text-white/40">
                    v{autoTracer?.version}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  {autoTracer?.name}
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
                  {autoTracer?.description}
                </p>

                <div className="space-y-2 pt-2">
                  {autoTracer?.included.slice(0, 3).map((feat, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-white/70">
                      <span className="text-white/40 font-mono mt-0.5">&bull;</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-8 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Perpetual License</div>
                  <div className="text-xl font-bold font-mono text-white">
                    ₹{autoTracer?.price.toLocaleString()}
                    <span className="text-xs font-normal text-white/40 ml-2">(${autoTracer?.priceUSD} USD)</span>
                  </div>
                </div>

                <span className="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-white px-4 py-2 rounded-lg bg-white/[0.08] group-hover:bg-white group-hover:text-black transition-colors">
                  <span>Inspect Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* 2 & 3. ASYMMETRIC PAIR: RIPPLE EFFECT & YOUTUBE DOWNLOADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        
        {/* RIPPLE EFFECT (7 Cols) */}
        <div 
          onClick={() => onSelectAsset(rippleEffect)}
          className="lg:col-span-7 cursor-pointer group border border-white/[0.08] hover:border-white/20 transition-colors bg-[#080808] rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            {/* Visual Demonstration */}
            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-6 bg-[#040404] border border-white/[0.06] p-6 flex flex-col justify-between relative">
              <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                <span>VOLUMETRIC SURFACE REFRACTION</span>
                <span>32-BIT FLOAT</span>
              </div>

              <div className="text-center my-6">
                <div className="w-24 h-24 mx-auto rounded-full border border-sky-400/40 relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-sky-400/20" />
                  <div className="w-8 h-8 rounded-full bg-sky-400/10" />
                </div>
                <span className="text-[10px] font-mono text-sky-300/80 uppercase tracking-widest mt-3 block">
                  OPTICAL CAUSTICS & CHROMATIC SHIFT
                </span>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>DISPLACEMENT MATTES: PRORES 4444</span>
                <span>FUSION + AE</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400">
                {rippleEffect?.category} &bull; v{rippleEffect?.version}
              </span>
              <span className="text-xs font-mono text-white font-semibold">
                ₹{rippleEffect?.price.toLocaleString()} (${rippleEffect?.priceUSD})
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
              {rippleEffect?.name}
            </h3>

            <p className="text-xs text-white/60 leading-relaxed mt-2 font-sans">
              {rippleEffect?.description}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-white/40">
            <span>{rippleEffect?.fileSize} download</span>
            <span className="text-white group-hover:text-sky-300 flex items-center space-x-1">
              <span>View Specs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* YOUTUBE REFERENCE UTILITY (5 Cols) */}
        <div 
          onClick={() => onSelectAsset(ytDownloader)}
          className="lg:col-span-5 cursor-pointer group border border-white/[0.08] hover:border-white/20 transition-colors bg-[#080808] rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            {/* Functional UI Mockup */}
            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-6 bg-[#040404] border border-white/[0.06] p-5 flex flex-col justify-between">
              <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                <span>LOCAL DESKTOP UTILITY</span>
                <span>100% FREE</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0e0e0e] border border-white/[0.06] text-[11px] font-mono text-white/60 truncate">
                youtube.com/watch?v=film_reference
              </div>

              <div className="space-y-1 text-[10px] font-mono text-white/40">
                <div>STEMS: VOCALS &bull; MUSIC &bull; DRUMS &bull; BASS</div>
                <div>CODEC: APPLE PRORES 422 PROXY / H.265</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Standalone Tool
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                FREE DOWNLOAD
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              {ytDownloader?.name}
            </h3>

            <p className="text-xs text-white/60 leading-relaxed mt-2 font-sans">
              {ytDownloader?.tagline}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-white/40">{ytDownloader?.fileSize} &bull; macOS / Windows</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>Get Tool</span>
            </span>
          </div>
        </div>

      </div>

      {/* 4 & 5. COMPACT CURATED ROW: METALLIC LIQUID & GRID WIPE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* METALLIC LIQUID */}
        <div 
          onClick={() => onSelectAsset(metallicLiquid)}
          className="cursor-pointer group border border-white/[0.08] hover:border-white/20 transition-colors bg-[#080808] rounded-2xl p-6 sm:p-7 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mb-2">
              <span className="text-slate-300 uppercase tracking-widest">FUSION COMPOSITION</span>
              <span className="text-emerald-400">FREE ASSET</span>
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-slate-300 transition-colors">
              {metallicLiquid?.name}
            </h4>
            <p className="text-xs text-white/60 mt-1 leading-relaxed font-sans">
              {metallicLiquid?.tagline}
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-white/[0.06] flex justify-between items-center text-xs font-mono text-white/40">
            <span>DaVinci Resolve Fusion &bull; {metallicLiquid?.fileSize}</span>
            <span className="text-white group-hover:text-slate-200 flex items-center space-x-1">
              <span>Inspect</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* GRID EFFECT TRANSITION */}
        <div 
          onClick={() => onSelectAsset(gridTransition)}
          className="cursor-pointer group border border-white/[0.08] hover:border-white/20 transition-colors bg-[#080808] rounded-2xl p-6 sm:p-7 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mb-2">
              <span className="text-blue-400 uppercase tracking-widest">TIMELINE TRANSITION</span>
              <span className="text-emerald-400">FREE ASSET</span>
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              {gridTransition?.name}
            </h4>
            <p className="text-xs text-white/60 mt-1 leading-relaxed font-sans">
              {gridTransition?.tagline}
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-white/[0.06] flex justify-between items-center text-xs font-mono text-white/40">
            <span>DaVinci + Premiere &bull; {gridTransition?.fileSize}</span>
            <span className="text-white group-hover:text-blue-300 flex items-center space-x-1">
              <span>Inspect</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>

    </section>
  );
}
