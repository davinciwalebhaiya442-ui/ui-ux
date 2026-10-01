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

  // Section refs for stacked scroll system
  const heroSectionRef = useRef(null);
  const heroInnerRef = useRef(null);

  const featuredRef = useRef(null);
  const featuredInnerRef = useRef(null);

  const catalogueRef = useRef(null);
  const catalogueInnerRef = useRef(null);

  const comparisonRef = useRef(null);
  const comparisonInnerRef = useRef(null);

  const toolsRef = useRef(null);
  const toolsInnerRef = useRef(null);

  const contentRef = useRef(null);
  const contentInnerRef = useRef(null);

  const studioRef = useRef(null);
  const studioInnerRef = useRef(null);

  const aboutRef = useRef(null);
  const aboutInnerRef = useRef(null);

  const faqRef = useRef(null);
  const faqInnerRef = useRef(null);

  const footerRef = useRef(null);
  const footerInnerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use GSAP matchMedia for responsive and accessible stacked scroll
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        isTablet: '(min-width: 768px) and (max-width: 1023px)',
        isMobile: '(max-width: 767px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, isTablet, reduceMotion } = context.conditions;

        // Respect prefers-reduced-motion
        if (reduceMotion) return;

        // Sequence of stacked transitions: (current layer, inner layer, next incoming layer)
        const stackPairs = [
          { current: heroSectionRef.current, inner: heroInnerRef.current, next: featuredRef.current, isHero: true },
          { current: featuredRef.current, inner: featuredInnerRef.current, next: catalogueRef.current },
          { current: catalogueRef.current, inner: catalogueInnerRef.current, next: comparisonRef.current },
          { current: comparisonRef.current, inner: comparisonInnerRef.current, next: toolsRef.current },
          { current: toolsRef.current, inner: toolsInnerRef.current, next: contentRef.current },
          { current: contentRef.current, inner: contentInnerRef.current, next: studioRef.current },
          { current: studioRef.current, inner: studioInnerRef.current, next: aboutRef.current },
          { current: aboutRef.current, inner: aboutInnerRef.current, next: faqRef.current },
          { current: faqRef.current, inner: faqInnerRef.current, next: footerRef.current },
        ];

        stackPairs.forEach(({ current, inner, next, isHero }) => {
          if (!current || !inner || !next) return;

          // ScrollTrigger timeline tied directly to the incoming section rising from the bottom
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          if (isHero) {
            // Hero is sticky at top-0: it stays stationary naturally.
            // As next section rises upward over it, hero recedes with subtle depth, scale & dimming.
            tl.to(
              inner,
              {
                scale: isDesktop ? 0.95 : 0.97,
                opacity: 0.72,
                filter: 'brightness(0.6)',
                ease: 'none',
              },
              0
            );
          } else {
            // For tall sections:
            // When next section enters the viewport, counter-translate current layer
            // so it stays rock-solid stationary on screen while next section slides over it.
            if (isDesktop) {
              tl.to(
                current,
                {
                  y: () => window.innerHeight,
                  ease: 'none',
                },
                0
              );
            }

            // Cinematic card stacking depth on inner content
            tl.to(
              inner,
              {
                scale: isDesktop ? 0.96 : 0.98,
                opacity: 0.76,
                filter: 'brightness(0.65)',
                ease: 'none',
              },
              0
            );
          }
        });

        // Ensure calculations are accurate once page fonts/elements settle
        ScrollTrigger.refresh();
      }
    );

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(timer);
      mm.revert();
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-white/20 selection:text-white">
      {/* 00: AWESOME PRELOADER (PRESERVED) */}
      <Preloader />

      {/* FLOATING LIQUID GLASS NAVBAR (HIGH Z-INDEX) */}
      <Navbar />

      {/* 🚨 SECTION 0: HERO (100% PRESERVED & UNTOUCHED VISUALLY) 🚨 */}
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

      {/* 01: CURATED RELEASES (STACKED LAYER 1) */}
      <div
        ref={featuredRef}
        className="relative w-full z-20 bg-[#040406] border-t border-white/[0.08] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:pointer-events-none"
      >
        <div ref={featuredInnerRef} className="w-full will-change-transform origin-bottom">
          <FeaturedAssets onSelectAsset={setSelectedAsset} initialProducts={initialProducts} />
        </div>
      </div>

      {/* 02: ASSET REPOSITORY & CATALOGUE (STACKED LAYER 2) */}
      <div
        ref={catalogueRef}
        className="relative w-full z-30 bg-[#030305] border-t border-white/[0.08] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:pointer-events-none"
      >
        <div ref={catalogueInnerRef} className="w-full will-change-transform origin-bottom">
          <AssetCatalogue onSelectAsset={setSelectedAsset} initialProducts={initialProducts} />
        </div>
      </div>

      {/* 03: BEFORE / AFTER COLOR SCIENCE ENGINE (STACKED LAYER 3) */}
      <div
        ref={comparisonRef}
        className="relative w-full z-40 bg-[#040406] border-t border-white/[0.08] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:pointer-events-none"
      >
        <div ref={comparisonInnerRef} className="w-full will-change-transform origin-bottom">
          <ComparisonSection onSelectAsset={setSelectedAsset} />
        </div>
      </div>

      {/* 04: TECHNICAL WORKSPACE & TOOLS (STACKED LAYER 4) */}
      <div
        ref={toolsRef}
        className="relative w-full z-50 bg-[#030305] border-t border-white/[0.08] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:pointer-events-none"
      >
        <div ref={toolsInnerRef} className="w-full will-change-transform origin-bottom">
          <ToolsSection />
        </div>
      </div>

      {/* 05: EDITORIAL VAULT (STACKED LAYER 5) */}
      <div
        ref={contentRef}
        className="relative w-full z-[60] bg-[#040406] border-t border-white/[0.08] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:pointer-events-none"
      >
        <div ref={contentInnerRef} className="w-full will-change-transform origin-bottom">
          <ContentSection />
        </div>
      </div>

      {/* 06: STUDIO LAB (STACKED LAYER 6) */}
      <div
        ref={studioRef}
        className="relative w-full z-[70] bg-[#030305] border-t border-white/[0.08] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:pointer-events-none"
      >
        <div ref={studioInnerRef} className="w-full will-change-transform origin-bottom">
          <StudioSection />
        </div>
      </div>

      {/* 07: STUDIO NOTES & PHILOSOPHY (STACKED LAYER 7) */}
      <div
        ref={aboutRef}
        className="relative w-full z-[80] bg-[#040406] border-t border-white/[0.08] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:pointer-events-none"
      >
        <div ref={aboutInnerRef} className="w-full will-change-transform origin-bottom">
          <AboutSection />
        </div>
      </div>

      {/* 08: FREQUENTLY ANSWERED QUESTIONS (STACKED LAYER 8) */}
      <div
        ref={faqRef}
        className="relative w-full z-[90] bg-[#030305] border-t border-white/[0.08] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:pointer-events-none"
      >
        <div ref={faqInnerRef} className="w-full will-change-transform origin-bottom">
          <FAQSection />
        </div>
      </div>

      {/* 09: FOOTER CLOSING FRAME (STACKED LAYER 9) */}
      <div
        ref={footerRef}
        className="relative w-full z-[100] bg-black border-t border-white/[0.08] shadow-[0_-25px_60px_rgba(0,0,0,0.95)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent before:pointer-events-none"
      >
        <div ref={footerInnerRef} className="w-full will-change-transform origin-bottom">
          <Footer />
        </div>
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
