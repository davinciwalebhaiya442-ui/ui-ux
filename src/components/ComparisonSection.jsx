'use client';

import BeforeAfterSlider from './BeforeAfterSlider';

export default function ComparisonSection() {
  return (
    <section id="comparison" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 gap-6 pb-8 border-b border-white/[0.08]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-2">
            02 / Color Science Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Photochemical Print Emulation
          </h2>
        </div>
        <p className="max-w-md text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
          Drag horizontally to compare unprocessed RAW camera log footage against our Kodak 2383 DCTL film transform.
        </p>
      </div>

      {/* Main Interactive Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <BeforeAfterSlider
            beforeLabel="RAW Log (DWG / ACES)"
            afterLabel="Kodak 2383 Print DCTL"
            aspectRatio="16/9"
          />
        </div>

        <div className="lg:col-span-4 border border-white/[0.12] rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              Spectral Density Notes
            </span>
            <span className="text-[10px] font-mono text-white/50">35mm Print</span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm font-sans text-white/75 leading-relaxed">
            <p>
              Standard digital grading clips RGB channels as saturation increases, leading to harsh neon skin tones and plastic highlights.
            </p>
            <p>
              Real 35mm film print stock behaves subtractively: as colors saturate, they absorb light and gain physical dye density, naturally rolling off into deep, organic shadows.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.08] space-y-2.5 text-xs font-mono text-white/70">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Preserves 16-bit float highlight dynamic range</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Smooth subtractive cyan-orange skin separation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Zero 3D LUT banding or contour artifacting</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>D55, D60, D65 & Tungsten white balances included</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
