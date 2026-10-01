'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

const DEFAULT_HERO = {
  heading: 'DAVINCI WALE BHAIYA',
  description: '',
  badge: '',
  heroImage: '/hero/2.jpg',
  fontFamily: 'sans',
  customFontUrl: '',
  textColor: '#ffffff',
  primaryButtonText: '',
  primaryButtonLink: '',
};

export default function HomeClient({ initialProducts = [], initialHero = null }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [heroSettings, setHeroSettings] = useState(() => initialHero || DEFAULT_HERO);

  const heroSectionRef = useRef(null);
  const heroInnerRef = useRef(null);
  const mainContentRef = useRef(null);

  const fetchHeroSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/hero?_t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.hero) {
        setHeroSettings(data.hero);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchHeroSettings();

    // Instant cross-tab sync when admin updates hero settings
    let bc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('dwb_products_channel');
        bc.onmessage = (event) => {
          fetchHeroSettings();
        };
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'dwb_products_updated' || e.key === 'dwb_hero_updated') {
        fetchHeroSettings();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', fetchHeroSettings);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', fetchHeroSettings);
    };
  }, [fetchHeroSettings]);

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
        className="sticky top-0 w-full h-[100dvh] min-h-screen z-10 overflow-hidden bg-black touch-pan-y"
      >
        <div ref={heroInnerRef} className="w-full h-full will-change-transform origin-center touch-pan-y">
          <section className="relative h-[100dvh] min-h-screen w-full overflow-hidden bg-black touch-pan-y">
            <Scene
              title={heroSettings.heading || 'DAVINCI WALE BHAIYA'}
              heroImage={heroSettings.heroImage || '/hero/2.jpg'}
              fontFamily={heroSettings.fontFamily || 'sans'}
              customFontUrl={heroSettings.customFontUrl}
              textColor={heroSettings.textColor || '#ffffff'}
              badge={heroSettings.badge}
              description={heroSettings.description}
              ctaText={heroSettings.primaryButtonText}
              ctaLink={heroSettings.primaryButtonLink}
            />

            {/* Clickable, interactive scroll indicator */}
            <button
              type="button"
              onClick={() => {
                mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-auto cursor-pointer opacity-60 hover:opacity-100 active:scale-95 transition-all p-2 select-none"
              aria-label="Scroll to Explore"
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60 mb-1">
                Scroll to Explore
              </span>
              <ChevronDown className="w-4 h-4 text-white/70 animate-bounce" />
            </button>
          </section>
        </div>
      </div>

      {/* 🚀 THE ENTIRE WEBSITE AS ONE SINGLE CINEMATIC STACKED LAYER 🚀 */}
      <div
        ref={mainContentRef}
        className="relative w-full z-20 bg-[#04060c] border-t border-white/[0.1] shadow-[0_-30px_70px_rgba(0,0,0,0.95)] overflow-hidden"
      >
        {/* Layer 1: Atmospheric Deep Blue & Navy Radial Lighting at Key Content Altitudes */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 95% 35% at 50% 6%, rgba(14, 42, 90, 0.26) 0%, transparent 70%),
              radial-gradient(ellipse 85% 32% at 50% 22%, rgba(10, 32, 72, 0.22) 0%, transparent 65%),
              radial-gradient(ellipse 90% 32% at 50% 42%, rgba(12, 38, 80, 0.20) 0%, transparent 65%),
              radial-gradient(ellipse 85% 30% at 50% 64%, rgba(10, 30, 68, 0.22) 0%, transparent 65%),
              radial-gradient(ellipse 90% 35% at 50% 86%, rgba(14, 38, 82, 0.24) 0%, transparent 70%)
            `,
          }}
        />

        {/* Layer 2: Subtle Ambient Navy Radial Dispersion */}
        <div 
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(8,20,44,0.45)_0%,rgba(4,6,12,0.85)_60%,rgba(2,3,6,1)_100%)] opacity-90"
        />

        {/* Layer 3: Cinematic Edge Vignette to keep borders darker and draw eyes into products */}
        <div 
          className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.8)]"
        />

        {/* Top Crisp Light Catch */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/35 to-transparent pointer-events-none z-30" />

        {/* Content Layers (Relative z-10 for perfect contrast) */}
        <div className="relative z-10">
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
