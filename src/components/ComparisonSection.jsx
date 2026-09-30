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

        <div className="lg:col-span-4 border border-white/[0.08] rounded-xl p-6 sm:p-8 bg-[#080808] space-y-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-white/40">
            SPECTRAL DENSITY NOTES
          </div>

          <div className="space-y-4 text-xs font-sans text-white/70 leading-relaxed">
            <p>
              Standard digital grading clips RGB channels as saturation increases, leading to harsh neon skin tones and plastic highlights.
            </p>
            <p>
              Real 35mm film print stock behaves subtractively: as colors saturate, they absorb light and gain physical dye density, naturally rolling off into deep, organic shadows.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.06] space-y-2 text-[11px] font-mono text-white/50">
            <div>&bull; Preserves 16-bit float highlight dynamic range</div>
            <div>&bull; Smooth subtractive cyan-orange skin separation</div>
            <div>&bull; Zero 3D LUT banding or contour artifacting</div>
            <div>&bull; D55, D60, D65 & Tungsten white balances included</div>
          </div>
        </div>
      </div>

    </section>
  );
}
