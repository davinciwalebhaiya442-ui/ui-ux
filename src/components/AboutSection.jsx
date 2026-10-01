'use client';

export default function AboutSection() {
  return (
    <section id="about" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Origin & Reality */}
        <div className="lg:col-span-7 space-y-6">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block">
            06 / Studio Notes
          </span>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans leading-tight">
            Built by Working Colorists <br />
            <span className="text-white/40 font-normal">For Real Timelines.</span>
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-white/70 leading-relaxed font-sans max-w-2xl">
            <p>
              DavinciWaleBhaiya started inside grading suites in Mumbai. Like most editors and colorists, we were frustrated with online marketplaces flooded with low-effort LUT packs that crush highlight dynamic range, poorly optimized OFX plugins that crash Resolve, and tools marketed with loud buzzwords instead of proper color science.
            </p>
            <p>
              We write our own DCTL transforms, Fusion macros, and timeline utilities because we needed them on client deliverables. When we build a film print emulation, we match densitometer readings from genuine 35mm negative-to-print lab stocks. When we build a tracking tool, we optimize the OpenFX Metal and CUDA compute shaders so scrubbing stays real-time at 60 frames per second.
            </p>
            <p className="text-white/50">
              Everything released here is perpetual. No subscriptions, no telemetry tracking, and no bloated installers. If a tool doesn’t survive a 14-hour commercial grading session on our own mastering monitors, it doesn’t get released.
            </p>
          </div>
        </div>

        {/* Right Column: Grounded Work Principles */}
        <div className="lg:col-span-5 border border-white/[0.12] rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              Technical Discipline
            </span>
            <span className="text-[10px] font-mono text-white/50">Core Tenets</span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <div className="text-white font-semibold mb-1 font-mono text-[11px] uppercase tracking-wider text-blue-300">
                01 &bull; 32-Bit Float Color Science
              </div>
              <p className="text-white/70 leading-relaxed">
                All color transforms run in non-destructive 32-bit floating point precision. Highlight roll-offs are mathematically continuous without clipping or banding.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <div className="text-white font-semibold mb-1 font-mono text-[11px] uppercase tracking-wider text-blue-300">
                02 &bull; Native Resolve Architecture
              </div>
              <p className="text-white/70 leading-relaxed">
                No foreign wrapper layers. We use native DaVinci Color Transform Language (.dctl), native OpenFX binaries, and native Fusion compositions.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <div className="text-white font-semibold mb-1 font-mono text-[11px] uppercase tracking-wider text-blue-300">
                03 &bull; Perpetual Ownership
              </div>
              <p className="text-white/70 leading-relaxed">
                You pay once and keep the files forever. Free compatibility updates are provided when Blackmagic releases new major DaVinci Resolve versions.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] text-[10px] font-mono text-white/50">
            ENGINEERED IN MUMBAI & BANGALORE &bull; CALIBRATED ON FLANDERS QD-OLED
          </div>
        </div>

      </div>

    </section>
  );
}
