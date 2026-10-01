'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
});

export default function HomeClient({ initialProducts = [] }) {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const heroSectionRef = useRef(null);
  const heroInnerRef = useRef(null);
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        isMobile: '(max-width: 1023px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions;
        if (reduceMotion) return;

        if (heroInnerRef.current && mainContentRef.current) {
          // Exactly ONE clean, cinematic stacked transition:
          // Hero stays pinned while the entire website comes up from below and covers it
          gsap.to(heroInnerRef.current, {
            scale: isDesktop ? 0.95 : 0.98,
            opacity: 0.72,
            filter: 'brightness(0.6)',
            ease: 'none',
            scrollTrigger: {
              trigger: mainContentRef.current,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }

        ScrollTrigger.refresh();
      }
    );

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      clearTimeout(timer);
      mm.revert();
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-white/20 selection:text-white">
      {/* 00: AWESOME PRELOADER (PRESERVED) */}
      <Preloader />

      {/* FLOATING LIQUID GLASS NAVBAR */}
      <Navbar />

      {/* 🚨 HERO SECTION (STICKY PINNED AT TOP) 🚨 */}
      <div
        ref={heroSectionRef}
        className="sticky top-0 w-full h-screen z-10 overflow-hidden bg-black"
      >
        <div ref={heroInnerRef} className="w-full h-full will-change-transform origin-center">
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
        </div>
      </div>

      {/* 🚀 THE ENTIRE WEBSITE AS ONE SINGLE CINEMATIC STACKED LAYER 🚀 */}
      <div
        ref={mainContentRef}
        className="relative w-full z-20 bg-[#030305] border-t border-white/[0.08] shadow-[0_-30px_70px_rgba(0,0,0,0.95)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/25 before:to-transparent before:pointer-events-none"
      >
        {/* 01: CURATED RELEASES */}
        <FeaturedAssets onSelectAsset={setSelectedAsset} initialProducts={initialProducts} />

        {/* 02: ASSET REPOSITORY & CATALOGUE */}
        <AssetCatalogue onSelectAsset={setSelectedAsset} initialProducts={initialProducts} />

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
      </div>

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
