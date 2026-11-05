'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Lottie } from 'lottie-react';
import gsap from 'gsap';
import { X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DEFAULT_FESTIVAL_SETTINGS,
  FESTIVAL_EFFECT_OPTIONS,
  resolveFestivalEffect,
} from '@/lib/festival';

// In-memory module cache for fetched Lottie JSON animations
const lottieAssetCache = new Map();

export default function FestivalManager({ previewSettings = null }) {
  const pathname = usePathname();

  // 1. Accessibility: Check prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 2. Initial state from previewSettings or localStorage cache
  const [settings, setSettings] = useState(() => {
    if (previewSettings) return previewSettings;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('dwb_festival_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed.enabled === 'boolean') {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_FESTIVAL_SETTINGS;
  });

  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('dwb_greeting_dismissed') === 'true';
      } catch (e) {}
    }
    return false;
  });

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem('dwb_greeting_dismissed', 'true');
    } catch (e) {}
  };

  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const heroLottieContainerRef = useRef(null);
  const heroGsapTimelineRef = useRef(null);

  // Sync settings when previewSettings prop changes (for Admin Simulator)
  useEffect(() => {
    if (previewSettings) {
      setSettings(previewSettings);
    }
  }, [previewSettings]);

  // Live client-side fetch & BroadcastChannel multi-tab instant sync
  useEffect(() => {
    if (previewSettings) return;

    let isMounted = true;
    const fetchLiveSettings = async () => {
      try {
        const res = await fetch('/api/festival?_t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.festival && isMounted) {
          setSettings(data.festival);
          try {
            localStorage.setItem('dwb_festival_settings', JSON.stringify(data.festival));
          } catch (e) {}
        }
      } catch (e) {}
    };

    fetchLiveSettings();

    // BroadcastChannel for sub-1ms cross-tab instant updates
    let bc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('dwb_festival_channel');
        bc.onmessage = (event) => {
          if (event.data?.festival) {
            setSettings(event.data.festival);
            try {
              localStorage.setItem('dwb_festival_settings', JSON.stringify(event.data.festival));
            } catch (e) {}
          }
        };
      }
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === 'dwb_festival_settings' || e.key === 'dwb_festival_updated') {
        try {
          const stored = localStorage.getItem('dwb_festival_settings');
          if (stored) {
            setSettings(JSON.parse(stored));
          } else {
            fetchLiveSettings();
          }
        } catch (err) {
          fetchLiveSettings();
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleCustom = (e) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener('dwb_festival_updated', handleCustom);

    return () => {
      isMounted = false;
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dwb_festival_updated', handleCustom);
    };
  }, [previewSettings]);

  // 3. Resolve active effect: Auto Calendar Schedule vs Manual
  const isEnabled = Boolean(settings?.enabled);
  const configuredEffect = settings?.effect || 'snow';
  const activeEffectId = useMemo(() => {
    return resolveFestivalEffect(configuredEffect);
  }, [configuredEffect]);

  const activePreset = useMemo(() => {
    return (
      FESTIVAL_EFFECT_OPTIONS.find((opt) => opt.id === activeEffectId) ||
      FESTIVAL_EFFECT_OPTIONS.find((opt) => opt.id === 'snow')
    );
  }, [activeEffectId]);

  const intensity = settings?.intensity || 'medium';
  const enableOnMobile = settings?.enableOnMobile !== false;
  const speedMultiplier = settings?.customSpeed === 2 ? 1.55 : settings?.customSpeed === 0 ? 0.65 : 1.0;

  // 4. Cart & Checkout Route Muting (Safety Guard)
  const isCartOrCheckout = pathname ? (
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/order') ||
    pathname.startsWith('/cart')
  ) : false;

  // 5. Lazy-load Lottie JSON Asset on Demand
  const [lottieData, setLottieData] = useState(null);

  useEffect(() => {
    if (!isEnabled || isCartOrCheckout) {
      setLottieData(null);
      return;
    }

    const assetPath = activePreset.lottieAsset;
    if (!assetPath) {
      setLottieData(null);
      return;
    }

    if (lottieAssetCache.has(assetPath)) {
      setLottieData(lottieAssetCache.get(assetPath));
      return;
    }

    let isSubscribed = true;
    fetch(assetPath)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isSubscribed) return;
        lottieAssetCache.set(assetPath, data);
        setLottieData(data);
      })
      .catch((err) => {
        console.warn(`Lottie load failed for ${assetPath}:`, err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isEnabled, isCartOrCheckout, activePreset.lottieAsset]);

  // 6. GSAP Cinematic Entrance & Parallax Sway Sequencing
  useEffect(() => {
    if (!lottieData || !heroLottieContainerRef.current || reducedMotion) return;

    const el = heroLottieContainerRef.current;
    
    // Kill existing timeline if any
    if (heroGsapTimelineRef.current) {
      heroGsapTimelineRef.current.kill();
    }

    // Reset initial style
    gsap.set(el, { opacity: 0, scale: 0.85, y: 25 });

    const tl = gsap.timeline();
    tl.to(el, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
    });

    // Gentle floating breathing sway
    tl.to(el, {
      y: '+=8',
      duration: 3.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    heroGsapTimelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [lottieData, reducedMotion]);

  // 7. Track cursor for organic breeze and mouse parallax deflection
  useEffect(() => {
    if (!isEnabled || isCartOrCheckout) return;

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };

      // Subtle parallax deflection on hero Lottie element
      if (heroLottieContainerRef.current && !reducedMotion) {
        const deltaX = (e.clientX - window.innerWidth / 2) * 0.015;
        const deltaY = (e.clientY - window.innerHeight / 2) * 0.015;
        gsap.to(heroLottieContainerRef.current, {
          x: deltaX,
          duration: 0.8,
          ease: 'power1.out',
          overwrite: 'auto',
        });
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, active: false };
      if (heroLottieContainerRef.current) {
        gsap.to(heroLottieContainerRef.current, { x: 0, duration: 1, ease: 'power2.out' });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isEnabled, isCartOrCheckout, reducedMotion]);

  // 8. Celebration burst for New Year or Independence Day
  useEffect(() => {
    if (!isEnabled || previewSettings || isCartOrCheckout || reducedMotion) return;
    if (activeEffectId !== 'newyear' && activeEffectId !== 'independence') return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      try {
        if (activeEffectId === 'independence') {
          confetti({
            particleCount: 28,
            angle: 60,
            spread: 50,
            origin: { x: 0, y: 0.85 },
            colors: ['#ff9933', '#ffffff', '#138808'],
            disableForReducedMotion: true,
            zIndex: 35,
          });
          confetti({
            particleCount: 28,
            angle: 120,
            spread: 50,
            origin: { x: 1, y: 0.85 },
            colors: ['#ff9933', '#ffffff', '#138808'],
            disableForReducedMotion: true,
            zIndex: 35,
          });
        } else if (activeEffectId === 'newyear') {
          confetti({
            particleCount: 36,
            spread: 65,
            origin: { y: 0.7 },
            colors: ['#ffd700', '#ffffff', '#ec4899', '#3b82f6', '#10b981'],
            disableForReducedMotion: true,
            zIndex: 35,
          });
        }
      } catch (e) {}
    }, 15000);

    return () => clearInterval(interval);
  }, [isEnabled, activeEffectId, previewSettings, isCartOrCheckout, reducedMotion]);

  // 9. Ambient Canvas Particle Simulation Engine
  useEffect(() => {
    if (!isEnabled || isCartOrCheckout) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = previewSettings ? (canvas.parentElement?.clientWidth || 600) : window.innerWidth);
    let height = (canvas.height = previewSettings ? (canvas.parentElement?.clientHeight || 320) : window.innerHeight);

    const isMobile = width < 768;
    if (isMobile && !enableOnMobile) {
      return;
    }

    let count = intensity === 'high' ? 120 : intensity === 'low' ? 35 : 70;
    if (isMobile) {
      count = Math.round(count * 0.5);
    }
    if (reducedMotion) {
      count = Math.round(count * 0.3);
    }

    // Particle initializers
    const initParticle = (initialY = null) => {
      const y = initialY !== null ? initialY : Math.random() * height;
      const x = Math.random() * width;

      if (activeEffectId === 'snow' || activeEffectId === 'christmas') {
        const rand = Math.random();
        let layer = 'mid';
        let radius = Math.random() * 2.2 + 2.0;
        let speedY = (Math.random() * 1.3 + 1.1) * speedMultiplier;
        let opacity = Math.random() * 0.4 + 0.6;
        let isCrystal = Math.random() > 0.45;

        if (rand < 0.12) {
          layer = 'bokeh';
          radius = Math.random() * 7.0 + 8.5;
          speedY = (Math.random() * 1.6 + 2.4) * speedMultiplier;
          opacity = Math.random() * 0.22 + 0.12;
          isCrystal = false;
        } else if (rand > 0.72) {
          layer = 'mist';
          radius = Math.random() * 1.0 + 0.8;
          speedY = (Math.random() * 0.6 + 0.55) * speedMultiplier;
          opacity = Math.random() * 0.35 + 0.22;
          isCrystal = false;
        }

        return {
          x,
          y,
          layer,
          radius,
          speedY,
          opacity,
          isCrystal,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 0.03 - 0.015) * speedMultiplier,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.024 + 0.014,
          swayWidth: Math.random() * 1.6 + 0.8,
        };
      } else if (activeEffectId === 'diwali' || activeEffectId === 'dussehra') {
        const isSparks = Math.random() > 0.75;
        const colors = [
          { core: '#ffffff', mid: '#fef08a', edge: '#f59e0b' },
          { core: '#fffbeb', mid: '#fbbf24', edge: '#ea580c' },
          { core: '#ffffff', mid: '#fde047', edge: '#d97706' },
          { core: '#fed7aa', mid: '#f97316', edge: '#dc2626' },
        ];
        return {
          x,
          y: initialY !== null ? initialY : height + Math.random() * 80,
          radius: isSparks ? Math.random() * 1.6 + 0.8 : Math.random() * 3.2 + 1.8,
          speedY: isSparks ? -(Math.random() * 3.2 + 2.0) * speedMultiplier : -(Math.random() * 1.8 + 1.0) * speedMultiplier,
          speedX: (Math.random() * 1.4 - 0.7) * speedMultiplier,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.6 + 0.4,
          flickerAngle: Math.random() * Math.PI * 2,
          flickerSpeed: Math.random() * 0.12 + 0.04,
          life: 1.0,
          decay: Math.random() * 0.007 + 0.003,
        };
      } else if (activeEffectId === 'holi') {
        const gulalColors = ['#f43f5e', '#ec4899', '#eab308', '#06b6d4', '#8b5cf6', '#10b981', '#f97316'];
        return {
          x,
          y: initialY !== null ? initialY : Math.random() * height,
          radius: Math.random() * 5.0 + 2.5,
          color: gulalColors[Math.floor(Math.random() * gulalColors.length)],
          speedY: (Math.random() * 1.4 + 0.8) * speedMultiplier,
          speedX: (Math.random() * 1.8 - 0.9) * speedMultiplier,
          alpha: Math.random() * 0.45 + 0.35,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.015,
        };
      } else if (activeEffectId === 'eid' || activeEffectId === 'ramadan') {
        const isCrescent = Math.random() > 0.92;
        return {
          x,
          y: initialY !== null ? initialY : Math.random() * height,
          radius: isCrescent ? 7.5 : Math.random() * 2.2 + 1.0,
          isCrescent,
          color: '#fbbf24',
          speedY: -(Math.random() * 0.7 + 0.4) * speedMultiplier,
          speedX: (Math.random() * 0.6 - 0.3) * speedMultiplier,
          alpha: Math.random() * 0.5 + 0.4,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.015,
        };
      } else if (activeEffectId === 'ganesh' || activeEffectId === 'durga_puja' || activeEffectId === 'navratri') {
        const petalColors = ['#e11d48', '#f97316', '#fbbf24', '#f43f5e', '#ea580c'];
        return {
          x,
          y: initialY !== null ? initialY : Math.random() * -height,
          w: Math.random() * 7 + 7,
          h: Math.random() * 13 + 11,
          color: petalColors[Math.floor(Math.random() * petalColors.length)],
          speedY: (Math.random() * 1.6 + 1.0) * speedMultiplier,
          speedX: (Math.random() * 1.4 - 0.7) * speedMultiplier,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 0.04 - 0.02) * speedMultiplier,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.015,
          alpha: Math.random() * 0.4 + 0.5,
        };
      } else if (activeEffectId === 'valentine') {
        const heartColors = ['#f43f5e', '#fb7185', '#fda4af', '#e11d48'];
        return {
          x,
          y: initialY !== null ? initialY : height + Math.random() * 50,
          size: Math.random() * 12 + 10,
          color: heartColors[Math.floor(Math.random() * heartColors.length)],
          speedY: -(Math.random() * 1.2 + 0.8) * speedMultiplier,
          speedX: (Math.random() * 0.8 - 0.4) * speedMultiplier,
          angle: Math.random() * 0.4 - 0.2,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.025 + 0.015,
          alpha: Math.random() * 0.45 + 0.35,
        };
      } else {
        // Confetti / Tricolor for New Year, Independence, Halloween
        let colors = [
          { main: '#ffd700', dark: '#b45309' },
          { main: '#ec4899', dark: '#9d174d' },
          { main: '#06b6d4', dark: '#0e7490' },
          { main: '#3b82f6', dark: '#1d4ed8' },
        ];
        if (activeEffectId === 'independence') {
          colors = [
            { main: '#ff9933', dark: '#c2410c' },
            { main: '#ffffff', dark: '#94a3b8' },
            { main: '#138808', dark: '#14532d' },
          ];
        } else if (activeEffectId === 'halloween') {
          colors = [
            { main: '#ea580c', dark: '#7c2d12' },
            { main: '#84cc16', dark: '#3f6212' },
          ];
        }
        return {
          x,
          y: initialY !== null ? initialY : Math.random() * -height,
          w: Math.random() * 7 + 6,
          h: Math.random() * 12 + 8,
          scheme: colors[Math.floor(Math.random() * colors.length)],
          speedY: (Math.random() * 2.2 + 1.4) * speedMultiplier,
          speedX: (Math.random() * 1.2 - 0.6) * speedMultiplier,
          rotationX: Math.random() * 360,
          rotationY: Math.random() * 360,
          speedRotX: (Math.random() * 3.5 + 1.5) * speedMultiplier,
          speedRotY: (Math.random() * 4.0 + 2.0) * speedMultiplier,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.02,
        };
      }
    };

    particlesRef.current = Array.from({ length: count }, () => initParticle());

    const handleResize = () => {
      width = canvas.width = previewSettings ? (canvas.parentElement?.clientWidth || 600) : window.innerWidth;
      height = canvas.height = previewSettings ? (canvas.parentElement?.clientHeight || 320) : window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let isTabVisible = !document.hidden;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Animation Loop
    const render = () => {
      if (!isTabVisible) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cursor deflection physics
        if (mouse.active && !reducedMotion) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110 && dist > 0) {
            const force = (110 - dist) / 110;
            p.x += (dx / dist) * force * 3.2;
            p.y += (dy / dist) * force * 2.2;
          }
        }

        // Snow rendering
        if (activeEffectId === 'snow' || activeEffectId === 'christmas') {
          p.swayAngle += p.swaySpeed;
          p.y += p.speedY;
          p.x += Math.sin(p.swayAngle) * p.swayWidth + 0.35;
          p.angle += p.rotationSpeed;

          if (p.y > height + 20) {
            Object.assign(p, initParticle(-20));
          }
          if (p.x < -30) p.x = width + 20;
          if (p.x > width + 30) p.x = -20;

          if (p.layer === 'bokeh') {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
            grad.addColorStop(0.5, `rgba(224, 242, 254, ${p.opacity * 0.45})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Diwali Embers
        else if (activeEffectId === 'diwali' || activeEffectId === 'dussehra') {
          p.y += p.speedY;
          p.x += p.speedX;
          p.flickerAngle += p.flickerSpeed;
          p.life -= p.decay;

          if (p.life <= 0 || p.y < -30) {
            Object.assign(p, initParticle(height + 20));
          }

          const currentAlpha = Math.max(0, p.alpha * p.life * (0.8 + 0.2 * Math.sin(p.flickerAngle)));
          const rad = Math.max(0.1, p.radius * p.life);

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 2.2);
          grad.addColorStop(0, p.color.core);
          grad.addColorStop(0.4, p.color.mid);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.save();
          ctx.globalAlpha = currentAlpha;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad * 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        // General confetti / petals
        else {
          p.y += p.speedY || 1.5;
          p.x += (p.speedX || 0) + Math.sin(p.swayAngle || 0) * 0.5;
          if (p.swayAngle !== undefined) p.swayAngle += p.swaySpeed || 0.02;

          if (p.y > height + 30) {
            Object.assign(p, initParticle(-20));
          }

          ctx.save();
          ctx.globalAlpha = p.alpha || 0.6;
          ctx.fillStyle = p.color || (p.scheme ? p.scheme.main : '#fbbf24');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius || 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isEnabled, isCartOrCheckout, activeEffectId, intensity, enableOnMobile, speedMultiplier, previewSettings, reducedMotion]);

  // Don't render anything if disabled or during cart/checkout
  if (!isEnabled || isCartOrCheckout) {
    return null;
  }

  // Determine Lottie position class
  const placement = activePreset.lottiePlacement || 'bottom-right';
  let placementClass = 'bottom-6 right-6';
  if (placement === 'bottom-left') placementClass = 'bottom-6 left-6';
  if (placement === 'top-right') placementClass = 'top-20 right-6';
  if (placement === 'top-left') placementClass = 'top-20 left-6';
  if (placement === 'bottom-center') placementClass = 'bottom-6 left-1/2 -translate-x-1/2';
  if (placement === 'center-float') placementClass = 'bottom-16 right-8 sm:bottom-20 sm:right-16';

  const showGreetingPill =
    Boolean(settings?.greetingEnabled) &&
    Boolean(settings?.greetingText?.trim()) &&
    !bannerDismissed;

  return (
    <>
      {/* Ambient Particle Canvas Layer (pointer-events-none, z-30) */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={
          previewSettings
            ? 'absolute inset-0 pointer-events-none z-10 w-full h-full'
            : 'fixed inset-0 pointer-events-none z-30 w-full h-full'
        }
      />

      {/* Floating Hero Lottie Vector Animation (pointer-events-none, z-35) */}
      {lottieData && (
        <div
          ref={heroLottieContainerRef}
          aria-hidden="true"
          className={
            previewSettings
              ? `absolute ${placementClass} z-20 pointer-events-none select-none max-w-[130px] max-h-[130px]`
              : `fixed ${placementClass} z-35 pointer-events-none select-none w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44`
          }
          style={{
            filter: `drop-shadow(0 0 24px ${activePreset.accentColor}40)`,
          }}
        >
          <Lottie
            animationData={lottieData}
            loop={!reducedMotion}
            autoplay={!reducedMotion}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      {/* Floating Festive Greeting Banner Pill */}
      {showGreetingPill && !previewSettings && (
        <aside
          role="region"
          aria-label="Festive Greeting"
          className="fixed bottom-6 left-6 z-40 max-w-sm sm:max-w-md pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0a0d14]/90 backdrop-blur-xl border border-white/15 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
              style={{ backgroundColor: activePreset.accentColor }}
            />
            <p className="text-xs sm:text-[13px] font-medium text-white/90 leading-tight truncate">
              {settings.greetingText}
            </p>
            <button
              type="button"
              onClick={handleDismissBanner}
              aria-label="Dismiss greeting"
              className="ml-auto p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
