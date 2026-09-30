'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Preloader from '@/components/Preloader';
import Navbar from '@/components/Navbar';
import FeaturedAssets from '@/components/FeaturedAssets';
import AssetCatalogue from '@/components/AssetCatalogue';
import ComparisonSection from '@/components/ComparisonSection';
import ToolsSection from '@/components/ToolsSection';
import ContentSection from '@/components/ContentSection';
import StudioSection from '@/components/StudioSection';
import AboutSection from '@/components/AboutSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import ProductModal from '@/components/ProductModal';
import { ChevronDown } from 'lucide-react';

const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
});

export default function Home() {
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-white/20 selection:text-white">
      {/* 00: AWESOME PRELOADER (PRESERVED) */}
      <Preloader />

      {/* FLOATING LIQUID GLASS NAVBAR */}
      <Navbar />

      {/* 🚨 HERO SECTION — 100% PRESERVED & UNTOUCHED 🚨 */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <Scene />

        {/* Subtle, non-intrusive scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/50 mb-1">
            Scroll to Explore
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-white/40" />
        </div>
      </section>

      {/* 01: CURATED RELEASES */}
      <FeaturedAssets onSelectAsset={setSelectedAsset} />

      {/* 02: ASSET REPOSITORY & CATALOGUE */}
      <AssetCatalogue onSelectAsset={setSelectedAsset} />

      {/* 03: BEFORE / AFTER COLOR SCIENCE ENGINE */}
      <ComparisonSection onSelectAsset={setSelectedAsset} />

      {/* 04: TECHNICAL WORKSPACE & TOOLS */}
      <ToolsSection />

      {/* 05: EDITORIAL VAULT */}
      <ContentSection />

      {/* 06: STUDIO LAB */}
      <StudioSection />

      {/* 07: STUDIO NOTES & PHILOSOPHY */}
      <AboutSection />

      {/* 08: FREQUENTLY ANSWERED QUESTIONS */}
      <FAQSection />

      {/* 09: FOOTER CLOSING FRAME */}
      <Footer />

      {/* PRODUCT DETAIL MODAL */}
      {selectedAsset && (
        <ProductModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </main>
  );
}
