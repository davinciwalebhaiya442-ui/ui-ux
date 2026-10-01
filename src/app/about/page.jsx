import LegalLayout from '@/components/LegalLayout';
import Link from 'next/link';
import { Sparkles, Sliders, Cpu, ShieldCheck, Film, Layers, ArrowUpRight } from 'lucide-react';

export const metadata = {
  title: 'About Us',
  description: 'The story, engineering discipline, and color science philosophy behind DavinciWaleBhaiya.',
};

export default function AboutPage() {
  return (
    <LegalLayout
      badge="Studio & Tools"
      title="About DavinciWaleBhaiya"
      lastUpdated="October 2026"
      description="Precision color science, optical DCTL transforms, and timeline utilities built by working post-production artists for real grading suites."
    >
      {/* 1. Origin & Motivation */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          1. Origin & Philosophy
        </h2>
        <p>
          <strong className="text-white">DavinciWaleBhaiya</strong> began inside commercial grading suites and editing rooms in Mumbai. Like many colorists and video editors, we grew frustrated with the digital marketplace landscape: generic LUT bundles that clip highlight dynamic range, unoptimized OpenFX plugins that crash DaVinci Resolve during tight client reviews, and heavy marketing with minimal technical rigor.
        </p>
        <p>
          We started building our own mathematical tools &mdash; writing custom <strong className="text-white">DaVinci Color Transform Language (.dctl)</strong> shaders, native Fusion composition macros, and timeline workflow automations &mdash; because we needed them on high-stakes commercial deliverables.
        </p>
        <p>
          DavinciWaleBhaiya exists to make professional, mathematically disciplined tools accessible to independent colorists, commercial editors, filmmakers, and digital creators worldwide.
        </p>
      </section>

      {/* 2. What We Build */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          2. What We Build
        </h2>
        <p>
          Our platform publishes specialized digital creator resources designed specifically for DaVinci Resolve:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Optical DCTLs & Color Transforms</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Native GPU-accelerated Metal and CUDA compute scripts for highlight compression, split-toning, perceptual saturation, and camera matching.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Film Print & Stock Emulations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calibrated subtractive color density models referencing actual lab densitometer curves from 35mm and 16mm film stocks without digital clipping.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Fusion Macros & Visual Effects</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-performance node macros for halation, optical bloom, anamorphic flares, film gate weaves, and cinematic letterboxing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Editing Transitions & PowerGrades</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Structured PowerGrade node trees and editorial transitions built for speed, non-destructive editing, and rapid timeline iteration.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Core Technical Principles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          3. Core Technical Principles
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
              01 &bull; 32-Bit Floating Point Integrity
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every transform calculates in 32-bit floating point precision. Highlight roll-offs are mathematically smooth, preserving wide camera sensor dynamic ranges (Arri LogC3/C4, RED IPP2, Sony S-Log3, BMD Gen 5) without posterization or channel clipping.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
              02 &bull; Native Architecture, Zero Bloat
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              We rely strictly on native DaVinci Resolve architecture. No foreign installer packages that clutter system directories, no hidden background services, and zero telemetry tracking.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
              03 &bull; Perpetual Single-User Ownership
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              We believe creators should own their tools. No recurring subscription lock-ins. You buy a tool once, receive the raw files, and keep them for all current and future projects.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Studio Services & Collaboration */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          4. Studio Services & Custom Look Development
        </h2>
        <p>
          Beyond publishing digital tools, we collaborate on a select number of feature films, commercials, music videos, and bespoke look development projects every quarter. Our suite masters in a calibrated DCI-P3 / Rec.709 color pipeline with remote live streaming capabilities.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors"
          >
            <span>Explore Studio Services</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-medium transition-colors"
          >
            <span>Get in Touch</span>
          </Link>
        </div>
      </section>

      {/* 5. Community & Free Tools */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          5. Community & Educational Commitment
        </h2>
        <p>
          We are committed to sharing knowledge with the editing and grading community. A substantial portion of our catalogue includes free open utilities, installation breakdowns, and color science guides to help upcoming artists level up their craft without financial barriers.
        </p>
      </section>
    </LegalLayout>
  );
}
