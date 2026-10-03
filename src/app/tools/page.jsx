import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExportSettingsFinder from '@/components/ExportSettingsFinder';
import Link from 'next/link';
import { ChevronRight, ArrowUpRight, Sliders, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Technical Workspace & Tools — DavinciWaleBhaiya',
  description:
    'Professional creator utilities: Best Export Settings Finder, YouTube reference extractor, aspect ratio calculator, and SMPTE timecode math.',
};

export default async function ToolsPage() {
  let dbTools = [];
  try {
    dbTools = await prisma.tool.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    dbTools = [];
  }

  return (
    <div className="min-h-screen bg-[#04060c] text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        {/* Subtle Ambient Navy Dispersion */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 40% at 50% 10%, rgba(14, 42, 90, 0.22) 0%, transparent 70%),
              radial-gradient(ellipse 60% 30% at 50% 50%, rgba(10, 32, 72, 0.15) 0%, transparent 65%)
            `,
          }}
        />

        {/* Breadcrumb Navigation: Resources / Content → Tools */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs font-mono text-white/50 pt-2"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <Link href="/#content" className="hover:text-white transition-colors">
            Content
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <span className="text-blue-400 font-semibold">Tools</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-blue-400 block mb-2">
              03 / Technical Workspace
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-sans">
              Editorial Tools & Utilities
            </h1>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
            In-browser color science utilities, render target calculators, and timeline conforming tools.
          </p>
        </div>

        {/* Featured Flagship Tool: Best Export Settings Finder */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                Featured Utility
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                100% Free
              </span>
            </div>
            <Link
              href="/tools/export-settings"
              className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
            >
              <span>Dedicated Fullscreen Page</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ExportSettingsFinder />
        </div>

        {/* Additional Database or Custom Tools */}
        {dbTools.length > 0 && (
          <div className="pt-12 border-t border-white/[0.08] space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Additional Timeline Utilities
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {dbTools.map((tool) => (
                <a
                  href={tool.url || '#'}
                  key={tool.id}
                  className="rounded-2xl border border-white/[0.1] bg-[#070b15]/80 p-5 hover:border-blue-400/40 transition-all group shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                        Utility
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-xs text-white/55 leading-relaxed font-sans">
                      {tool.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
