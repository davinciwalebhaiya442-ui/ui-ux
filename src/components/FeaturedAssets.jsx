'use client';

import { useProducts } from '@/data/useProducts';
import { ArrowUpRight, Check, Download, Monitor, Terminal } from 'lucide-react';

export default function FeaturedAssets({ onSelectAsset, initialProducts = [] }) {
  const assets = useProducts(initialProducts);
  const autoTracer = assets.find((a) => a.id === 'auto-tracer') || assets[0];
  const rippleEffect = assets.find((a) => a.id === 'ripple-effect') || assets[1] || assets[0];
  const ytDownloader = assets.find((a) => a.id === 'yt-downloader') || assets[2] || assets[0];
  const metallicLiquid = assets.find((a) => a.id === 'metallic-liquid') || assets[3] || assets[0];
  const gridTransition = assets.find((a) => a.id === 'grid-effect-transition') || assets[4] || assets[0];

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
          className="cursor-pointer group relative border border-white/[0.14] hover:border-blue-400/50 transition-all duration-300 bg-gradient-to-b from-[#0e1628]/95 via-[#0a0f1d]/95 to-[#070b14]/95 shadow-[0_12px_40px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_55px_rgba(14,35,80,0.5),0_0_30px_rgba(37,99,235,0.2)] rounded-3xl overflow-hidden hover:-translate-y-0.5"
        >
          {/* Subtle top edge glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Visual Preview Window (7 Cols) */}
            <div className="lg:col-span-7 bg-gradient-to-b from-[#080d1a] to-[#050812] p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.1] flex flex-col justify-between min-h-[380px]">
              
              {/* Top Viewport Header */}
              <div className="flex items-center justify-between text-[11px] font-mono text-white/50 border-b border-white/[0.08] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                  <span className="text-white/90 font-medium">COLOR PAGE OPENFX</span>
                </div>
                <span className="text-white/40">NODE 04 &bull; POWER WINDOW TRACK</span>
              </div>

              {/* Central Tracking Graphic */}
              <div className="my-8 py-8 px-6 rounded-2xl border border-white/[0.08] bg-[#070b16]/80 backdrop-blur-md shadow-inner">
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
                      <span className="text-[10px] font-mono text-white/95 tracking-widest block font-medium">
                        FACIAL ISOLATION MATTE
                      </span>
                      <span className="text-[9px] font-mono text-blue-300/60 block mt-0.5">
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
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-white/60">
                <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]">DaVinci Resolve Studio 18/19</span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]">macOS (Apple Silicon/Intel)</span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]">Windows 10/11</span>
              </div>
            </div>

            {/* Information Column (5 Cols) */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-[#0c1220] to-[#080d18]">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                    OpenFX Plugin
                  </span>
                  <span className="text-[11px] font-mono text-white/50">
                    v{autoTracer?.version}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-blue-200 transition-colors">
                  {autoTracer?.name}
                </h3>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                  {autoTracer?.description}
                </p>

                <div className="space-y-2 pt-2">
                  {autoTracer?.included.slice(0, 3).map((feat, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-white/80">
                      <span className="text-blue-400 font-mono mt-0.5">&bull;</span>
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
                    <span className="text-xs font-normal text-white/50 ml-2">(${autoTracer?.priceUSD} USD)</span>
                  </div>
                </div>

                {/* Primary High-Affordance Action Pill */}
                <span className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-white px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
                  <span>Inspect Details</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* 2 & 3. ASYMMETRIC PAIR: RIPPLE EFFECT & YOUTUBE DOWNLOADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* RIPPLE EFFECT (7 Cols) */}
        <div 
          onClick={() => onSelectAsset(rippleEffect)}
          className="lg:col-span-7 cursor-pointer group border border-white/[0.12] hover:border-sky-400/40 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(14,165,233,0.18)]"
        >
          <div>
            {/* Visual Demonstration */}
            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-6 bg-gradient-to-b from-[#0a1120] to-[#050810] border border-white/[0.1] p-6 flex flex-col justify-between relative shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-white/60">
                <span className="font-semibold text-sky-300">VOLUMETRIC SURFACE REFRACTION</span>
                <span>32-BIT FLOAT</span>
              </div>

              <div className="relative z-10 text-center my-6">
                <div className="w-24 h-24 mx-auto rounded-full border border-sky-400/40 relative flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.2)]">
                  <div className="w-16 h-16 rounded-full border border-sky-400/30" />
                  <div className="w-8 h-8 rounded-full bg-sky-400/20" />
                </div>
                <span className="text-[10px] font-mono text-sky-300 uppercase tracking-widest mt-3 block font-semibold">
                  OPTICAL CAUSTICS & CHROMATIC SHIFT
                </span>
              </div>

              <div className="relative z-10 flex justify-between text-[10px] font-mono text-white/50">
                <span>DISPLACEMENT MATTES: PRORES 4444</span>
                <span>FUSION + AE</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                {rippleEffect?.category} &bull; v{rippleEffect?.version}
              </span>
              <span className="text-sm font-mono text-white font-bold">
                ₹{rippleEffect?.price.toLocaleString()} <span className="text-white/50 text-xs font-normal">(${rippleEffect?.priceUSD})</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
              {rippleEffect?.name}
            </h3>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed mt-2 font-sans">
              {rippleEffect?.description}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <span className="text-white/50">{rippleEffect?.fileSize} download</span>
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 group-hover:bg-sky-500 group-hover:text-black font-semibold transition-all">
              <span>View Specs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* YOUTUBE REFERENCE UTILITY (5 Cols) */}
        <div 
          onClick={() => onSelectAsset(ytDownloader)}
          className="lg:col-span-5 cursor-pointer group border border-white/[0.12] hover:border-emerald-400/40 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.18)]"
        >
          <div>
            {/* Functional UI Mockup */}
            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-6 bg-gradient-to-b from-[#0a1120] to-[#050810] border border-white/[0.1] p-5 flex flex-col justify-between relative shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none" />

              <div className="relative z-10 flex justify-between text-[10px] font-mono text-emerald-400 font-semibold">
                <span>LOCAL DESKTOP UTILITY</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">100% FREE</span>
              </div>

              <div className="relative z-10 p-3 rounded-lg bg-[#070d18] border border-white/[0.1] text-[11px] font-mono text-white/80 truncate shadow-sm">
                youtube.com/watch?v=film_reference
              </div>

              <div className="relative z-10 space-y-1 text-[10px] font-mono text-white/50">
                <div>STEMS: VOCALS &bull; MUSIC &bull; DRUMS &bull; BASS</div>
                <div>CODEC: APPLE PRORES 422 PROXY / H.265</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Standalone Tool
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                FREE DOWNLOAD
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              {ytDownloader?.name}
            </h3>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed mt-2 font-sans">
              {ytDownloader?.tagline}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <span className="text-white/50">{ytDownloader?.fileSize} &bull; macOS / Windows</span>
            <span className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-black font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Download className="w-3.5 h-3.5" />
              <span>Get Tool Free</span>
            </span>
          </div>
        </div>

      </div>

      {/* 4 & 5. COMPACT CURATED ROW: METALLIC LIQUID & GRID WIPE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* METALLIC LIQUID */}
        <div 
          onClick={() => onSelectAsset(metallicLiquid)}
          className="cursor-pointer group border border-white/[0.12] hover:border-slate-300/40 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(148,163,184,0.18)]"
        >
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-white/60 mb-2">
              <span className="text-slate-300 uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">FUSION COMPOSITION</span>
              <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">FREE ASSET</span>
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-slate-200 transition-colors mt-2">
              {metallicLiquid?.name}
            </h4>
            <p className="text-xs sm:text-sm text-white/70 mt-1.5 leading-relaxed font-sans">
              {metallicLiquid?.tagline}
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-white/[0.08] flex justify-between items-center text-xs font-mono">
            <span className="text-white/50">DaVinci Resolve Fusion &bull; {metallicLiquid?.fileSize}</span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-white/[0.08] text-white group-hover:bg-white group-hover:text-black font-semibold transition-all">
              <span>Inspect</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* GRID EFFECT TRANSITION */}
        <div 
          onClick={() => onSelectAsset(gridTransition)}
          className="cursor-pointer group border border-white/[0.12] hover:border-blue-400/40 transition-all duration-300 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.18)]"
        >
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-white/60 mb-2">
              <span className="text-blue-400 uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">TIMELINE TRANSITION</span>
              <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">FREE ASSET</span>
            </div>
            <h4 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors mt-2">
              {gridTransition?.name}
            </h4>
            <p className="text-xs sm:text-sm text-white/70 mt-1.5 leading-relaxed font-sans">
              {gridTransition?.tagline}
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-white/[0.08] flex justify-between items-center text-xs font-mono">
            <span className="text-white/50">DaVinci + Premiere &bull; {gridTransition?.fileSize}</span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-white/[0.08] text-white group-hover:bg-white group-hover:text-black font-semibold transition-all">
              <span>Inspect</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>

    </section>
  );
}
