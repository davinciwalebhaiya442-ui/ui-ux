import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExportSettingsFinder from '@/components/ExportSettingsFinder';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Best Export Settings Finder — DaVinci, Premiere, FCP & CapCut',
  description:
    'Free professional calculator for video export settings. Get exact bitrates, codecs, safe zones, and render profiles for Instagram Reels, YouTube 4K, TikTok, Vimeo, and Broadcast.',
};

export default function ExportSettingsPage() {
  return (
    <div className="min-h-screen bg-[#04060c] text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
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

        {/* Breadcrumb Navigation: Resources / Content → Tools → Best Export Settings Finder */}
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
          <Link href="/tools" className="hover:text-white transition-colors">
            Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <span className="text-blue-400 font-semibold truncate">
            Best Export Settings Finder
          </span>
        </nav>

        {/* Back Link */}
        <div>
          <Link
            href="/tools"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Technical Workspace</span>
          </Link>
        </div>

        {/* Interactive Utility */}
        <div className="relative z-10">
          <ExportSettingsFinder />
        </div>
      </main>

      <Footer />
    </div>
  );
}
