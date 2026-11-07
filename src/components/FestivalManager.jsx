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
  const secondaryLottieContainerRef = useRef(null);
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
        const res = await fetch('/api/festival');
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

  // Cinematic Ambient Lighting Vignette tailored for each festive atmosphere
  const ambientVignetteGradient = useMemo(() => {
    switch (activeEffectId) {
      case 'diwali':
      case 'dussehra':
        return 'radial-gradient(circle at 92% 92%, rgba(245, 158, 11, 0.22) 0%, transparent 55%), radial-gradient(circle at 8% 8%, rgba(217, 119, 6, 0.16) 0%, transparent 50%), radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.10) 0%, transparent 40%)';
      case 'christmas':
        return 'radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.18) 0%, transparent 60%), radial-gradient(circle at 90% 90%, rgba(34, 197, 94, 0.12) 0%, transparent 45%)';
      case 'snow':
        return 'radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.20) 0%, transparent 65%), radial-gradient(circle at 90% 90%, rgba(147, 197, 253, 0.10) 0%, transparent 50%)';
      case 'eid':
      case 'ramadan':
        return 'radial-gradient(circle at 88% 12%, rgba(234, 179, 8, 0.22) 0%, transparent 55%), radial-gradient(circle at 12% 88%, rgba(16, 185, 129, 0.14) 0%, transparent 50%)';
      case 'newyear':
        return 'radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.20) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(234, 179, 8, 0.18) 0%, transparent 55%)';
      case 'independence':
        return 'radial-gradient(circle at 50% 0%, rgba(255, 153, 51, 0.18) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(19, 136, 8, 0.18) 0%, transparent 50%)';
      case 'holi':
        return 'radial-gradient(circle at 85% 85%, rgba(244, 63, 94, 0.22) 0%, transparent 50%), radial-gradient(circle at 15% 15%, rgba(6, 182, 212, 0.20) 0%, transparent 50%)';
      case 'valentine':
        return 'radial-gradient(circle at 90% 90%, rgba(244, 63, 94, 0.22) 0%, transparent 55%), radial-gradient(circle at 10% 10%, rgba(251, 113, 133, 0.16) 0%, transparent 50%)';
      default:
        return 'radial-gradient(circle at 90% 90%, rgba(245, 158, 11, 0.18) 0%, transparent 50%)';
    }
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

  // 5. Preload & Cache Lottie JSON Asset
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
    if (!heroLottieContainerRef.current || reducedMotion) return;

    const el = heroLottieContainerRef.current;
    
    if (heroGsapTimelineRef.current) {
      heroGsapTimelineRef.current.kill();
    }

    gsap.set(el, { opacity: 0, scale: 0.85, y: 25 });

    const tl = gsap.timeline();
    tl.to(el, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.4,
      ease: 'power3.out',
    });

    // Gentle floating breathing sway
    tl.to(el, {
      y: '+=8',
      duration: 3.4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    heroGsapTimelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [activeEffectId, reducedMotion]);

  // 7. Track cursor for organic breeze and mouse parallax deflection
  useEffect(() => {
    if (!isEnabled || isCartOrCheckout) return;

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };

      if (heroLottieContainerRef.current && !reducedMotion) {
        const deltaX = (e.clientX - window.innerWidth / 2) * 0.016;
        const deltaY = (e.clientY - window.innerHeight / 2) * 0.016;
        gsap.to(heroLottieContainerRef.current, {
          x: deltaX,
          y: deltaY,
          duration: 0.8,
          ease: 'power1.out',
          overwrite: 'auto',
        });
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, active: false };
      if (heroLottieContainerRef.current) {
        gsap.to(heroLottieContainerRef.current, { x: 0, y: 0, duration: 1, ease: 'power2.out' });
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
            particleCount: 35,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.85 },
            colors: ['#ff9933', '#ffffff', '#138808'],
            disableForReducedMotion: true,
            zIndex: 35,
          });
          confetti({
            particleCount: 35,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.85 },
            colors: ['#ff9933', '#ffffff', '#138808'],
            disableForReducedMotion: true,
            zIndex: 35,
          });
        } else if (activeEffectId === 'newyear') {
          confetti({
            particleCount: 45,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#ffd700', '#ffffff', '#ec4899', '#3b82f6', '#10b981'],
            disableForReducedMotion: true,
            zIndex: 35,
          });
        }
      } catch (e) {}
    }, 14000);

    return () => clearInterval(interval);
  }, [isEnabled, activeEffectId, previewSettings, isCartOrCheckout, reducedMotion]);

  // 9. HIGH-FIDELITY LUXURY VECTOR PARTICLE ENGINE (Real Crystals, Petals, Ribbons, Embers)
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

    let count = intensity === 'high' ? 90 : intensity === 'low' ? 28 : 55;
    if (isMobile) count = Math.round(count * 0.5);
    if (reducedMotion) count = Math.round(count * 0.25);

    // =========================================================================
    // LUXURY VECTOR DRAWING ROUTINES (True Craftsmanship, Zero Cheap Dots)
    // =========================================================================

    // A. 6-Point Intricate Hexagonal Ice Crystal Snowflake
    const drawIceCrystal = (c, x, y, radius, angle, alpha) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      c.lineWidth = 1.2;
      c.lineCap = 'round';
      c.beginPath();

      for (let i = 0; i < 3; i++) {
        c.rotate(Math.PI / 3);
        c.moveTo(-radius, 0);
        c.lineTo(radius, 0);
        const bOffset = radius * 0.55;
        const bSize = radius * 0.35;
        c.moveTo(bOffset, 0);
        c.lineTo(bOffset + bSize * 0.7, bSize);
        c.moveTo(bOffset, 0);
        c.lineTo(bOffset + bSize * 0.7, -bSize);
        c.moveTo(-bOffset, 0);
        c.lineTo(-bOffset - bSize * 0.7, bSize);
        c.moveTo(-bOffset, 0);
        c.lineTo(-bOffset - bSize * 0.7, -bSize);
      }
      c.stroke();
      c.restore();
    };

    // B. Real 3D Tumbling Flower Petal (Marigold & Hibiscus)
    const drawPetal = (c, x, y, w, h, angle, tilt, color, alpha) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.scale(Math.cos(tilt), 1);
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, -h / 2);
      c.bezierCurveTo(w / 2, -h / 4, w / 2, h / 4, 0, h / 2);
      c.bezierCurveTo(-w / 2, h / 4, -w / 2, -h / 4, 0, -h / 2);
      c.fill();
      c.restore();
    };

    // C. Real Floating Vector Heart (Valentine)
    const drawHeart = (c, x, y, size, angle, color, alpha) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.shadowBlur = 12;
      c.shadowColor = color;
      c.beginPath();
      const topCurve = size * 0.3;
      c.moveTo(0, topCurve);
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurve);
      c.bezierCurveTo(-size / 2, (size + topCurve) / 2, 0, (size + topCurve) / 1.3, 0, size);
      c.bezierCurveTo(0, (size + topCurve) / 1.3, size / 2, (size + topCurve) / 2, size / 2, topCurve);
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurve);
      c.fill();
      c.restore();
    };

    // D. 3D Metallic Tumbling Confetti Ribbon (New Year, Independence)
    const draw3DRibbon = (c, x, y, w, h, rotX, rotY, rotZ, scheme, alpha) => {
      c.save();
      c.translate(x, y);
      c.rotate(rotZ);
      const scaleX = Math.cos(rotX);
      const scaleY = Math.sin(rotY);
      c.scale(scaleX, scaleY);
      c.globalAlpha = alpha;
      // Metallic foil sheen: flip between bright highlight & rich foil shade
      c.fillStyle = scaleX > 0 ? scheme.main : scheme.dark;
      c.fillRect(-w / 2, -h / 2, w, h);
      c.restore();
    };

    // E. 8-Point Islamic Celestial Star (Eid & Ramadan)
    const drawIslamicStar = (c, x, y, size, alpha) => {
      c.save();
      c.translate(x, y);
      c.globalAlpha = alpha;
      c.fillStyle = '#fef08a';
      c.shadowBlur = 10;
      c.shadowColor = '#fbbf24';
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? size : size * 0.42;
        const a = (i * Math.PI) / 4;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.fill();
      c.restore();
    };

    // F. Organic Gulal Powder Cloud (Holi)
    const drawGulalCloud = (c, x, y, radius, color, alpha) => {
      c.save();
      c.globalAlpha = alpha;
      const grad = c.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, color + 'aa');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(x, y, radius, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    // G. Trailing Molten Ember with Spark Tail (Diwali & Dussehra)
    const drawEmberStreak = (c, x, y, radius, speedX, speedY, color, alpha) => {
      c.save();
      c.globalAlpha = alpha;
      // Luminous spark tail
      c.strokeStyle = color.mid;
      c.lineWidth = Math.max(1, radius * 0.85);
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - speedX * 4.5, y - speedY * 4.5);
      c.stroke();

      // Glowing fire cinder core
      const grad = c.createRadialGradient(x, y, 0, x, y, radius * 2.2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, color.core);
      grad.addColorStop(0.7, color.edge);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(x, y, radius * 2.2, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    // Particle initializer
    const initParticle = (initialY = null) => {
      const y = initialY !== null ? initialY : Math.random() * height;
      const x = Math.random() * width;

      // 1. Snow & Christmas
      if (activeEffectId === 'snow' || activeEffectId === 'christmas') {
        const rand = Math.random();
        const isBokeh = rand < 0.16;
        const isCrystal = rand > 0.42;
        return {
          type: 'snow',
          x,
          y,
          isBokeh,
          isCrystal,
          radius: isBokeh ? Math.random() * 9 + 8 : Math.random() * 2.5 + 2.0,
          speedY: (Math.random() * 1.3 + 1.1) * speedMultiplier,
          opacity: isBokeh ? Math.random() * 0.25 + 0.12 : Math.random() * 0.45 + 0.55,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 0.03 - 0.015) * speedMultiplier,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.024 + 0.014,
          swayWidth: Math.random() * 1.6 + 0.8,
        };
      }
      // 2. Diwali & Dussehra
      else if (activeEffectId === 'diwali' || activeEffectId === 'dussehra') {
        const colors = [
          { core: '#ffffff', mid: '#fef08a', edge: '#f59e0b' },
          { core: '#fffbeb', mid: '#fbbf24', edge: '#ea580c' },
          { core: '#ffffff', mid: '#fde047', edge: '#d97706' },
          { core: '#fed7aa', mid: '#f97316', edge: '#dc2626' },
        ];
        return {
          type: 'ember',
          x,
          y: initialY !== null ? initialY : height + Math.random() * 60,
          radius: Math.random() * 2.8 + 1.5,
          speedY: -(Math.random() * 2.5 + 1.3) * speedMultiplier,
          speedX: (Math.random() * 1.4 - 0.7) * speedMultiplier,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.6 + 0.4,
          flickerAngle: Math.random() * Math.PI * 2,
          flickerSpeed: Math.random() * 0.12 + 0.04,
          life: 1.0,
          decay: Math.random() * 0.007 + 0.003,
        };
      }
      // 3. Holi Gulal
      else if (activeEffectId === 'holi') {
        const gulalColors = ['#f43f5e', '#ec4899', '#eab308', '#06b6d4', '#8b5cf6', '#10b981', '#f97316'];
        return {
          type: 'gulal',
          x,
          y: initialY !== null ? initialY : Math.random() * height,
          radius: Math.random() * 26 + 18,
          color: gulalColors[Math.floor(Math.random() * gulalColors.length)],
          speedY: (Math.random() * 1.2 + 0.6) * speedMultiplier,
          speedX: (Math.random() * 1.6 - 0.8) * speedMultiplier,
          alpha: Math.random() * 0.35 + 0.25,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.015,
        };
      }
      // 4. Eid & Ramadan
      else if (activeEffectId === 'eid' || activeEffectId === 'ramadan') {
        return {
          type: 'star',
          x,
          y: initialY !== null ? initialY : Math.random() * height,
          size: Math.random() * 7 + 4,
          speedY: -(Math.random() * 0.6 + 0.3) * speedMultiplier,
          speedX: (Math.random() * 0.6 - 0.3) * speedMultiplier,
          alpha: Math.random() * 0.5 + 0.4,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.04 + 0.02,
        };
      }
      // 5. Flower Petals: Durga Puja, Navratri, Ganesh
      else if (activeEffectId === 'ganesh' || activeEffectId === 'durga_puja' || activeEffectId === 'navratri') {
        const petalColors = ['#f97316', '#fbbf24', '#e11d48', '#f43f5e', '#ea580c'];
        return {
          type: 'petal',
          x,
          y: initialY !== null ? initialY : Math.random() * -height,
          w: Math.random() * 8 + 8,
          h: Math.random() * 16 + 14,
          color: petalColors[Math.floor(Math.random() * petalColors.length)],
          speedY: (Math.random() * 1.6 + 1.0) * speedMultiplier,
          speedX: (Math.random() * 1.2 - 0.6) * speedMultiplier,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 0.03 - 0.015) * speedMultiplier,
          tilt: Math.random() * Math.PI * 2,
          tiltSpeed: Math.random() * 0.04 + 0.02,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.015,
          alpha: Math.random() * 0.4 + 0.55,
        };
      }
      // 6. Valentine
      else if (activeEffectId === 'valentine') {
        const heartColors = ['#f43f5e', '#fb7185', '#fda4af', '#e11d48'];
        return {
          type: 'heart',
          x,
          y: initialY !== null ? initialY : height + Math.random() * 50,
          size: Math.random() * 14 + 12,
          color: heartColors[Math.floor(Math.random() * heartColors.length)],
          speedY: -(Math.random() * 1.2 + 0.8) * speedMultiplier,
          speedX: (Math.random() * 0.8 - 0.4) * speedMultiplier,
          angle: Math.random() * 0.4 - 0.2,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.025 + 0.015,
          alpha: Math.random() * 0.45 + 0.35,
        };
      }
      // 7. 3D Metallic Ribbons: New Year, Independence Day, Halloween
      else {
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
          type: 'ribbon',
          x,
          y: initialY !== null ? initialY : Math.random() * -height,
          w: Math.random() * 8 + 7,
          h: Math.random() * 16 + 10,
          scheme: colors[Math.floor(Math.random() * colors.length)],
          speedY: (Math.random() * 2.2 + 1.4) * speedMultiplier,
          speedX: (Math.random() * 1.2 - 0.6) * speedMultiplier,
          rotX: Math.random() * Math.PI * 2,
          rotY: Math.random() * Math.PI * 2,
          rotZ: Math.random() * Math.PI * 2,
          speedRotX: (Math.random() * 0.06 + 0.03) * speedMultiplier,
          speedRotY: (Math.random() * 0.08 + 0.04) * speedMultiplier,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.02,
          alpha: Math.random() * 0.35 + 0.65,
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

    // =========================================================================
    // ANIMATION RENDER LOOP
    // =========================================================================
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

        // Cursor deflection breeze
        if (mouse.active && !reducedMotion) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = (120 - dist) / 120;
            p.x += (dx / dist) * force * 3.5;
            p.y += (dy / dist) * force * 2.5;
          }
        }

        // Render based on particle type
        if (p.type === 'snow') {
          p.swayAngle += p.swaySpeed;
          p.y += p.speedY;
          p.x += Math.sin(p.swayAngle) * p.swayWidth + 0.35;
          p.angle += p.rotationSpeed;

          if (p.y > height + 25) Object.assign(p, initParticle(-25));
          if (p.x < -30) p.x = width + 20;
          if (p.x > width + 30) p.x = -20;

          if (p.isBokeh) {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
            grad.addColorStop(0.5, `rgba(224, 242, 254, ${p.opacity * 0.4})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.isCrystal) {
            drawIceCrystal(ctx, p.x, p.y, p.radius * 2.8, p.angle, p.opacity);
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (p.type === 'ember') {
          p.y += p.speedY;
          p.x += p.speedX;
          p.flickerAngle += p.flickerSpeed;
          p.life -= p.decay;

          if (p.life <= 0 || p.y < -30) Object.assign(p, initParticle(height + 25));

          const curAlpha = Math.max(0, p.alpha * p.life * (0.8 + 0.2 * Math.sin(p.flickerAngle)));
          drawEmberStreak(ctx, p.x, p.y, p.radius, p.speedX, p.speedY, p.color, curAlpha);
        } else if (p.type === 'gulal') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.swayAngle) * 0.5;
          p.swayAngle += p.swaySpeed;

          if (p.y > height + 35) Object.assign(p, initParticle(-35));
          drawGulalCloud(ctx, p.x, p.y, p.radius, p.color, p.alpha);
        } else if (p.type === 'star') {
          p.y += p.speedY;
          p.x += p.speedX;
          p.pulse += p.pulseSpeed;

          if (p.y < -30) Object.assign(p, initParticle(height + 20));
          const currentAlpha = Math.max(0.2, p.alpha * (0.7 + 0.3 * Math.sin(p.pulse)));
          drawIslamicStar(ctx, p.x, p.y, p.size, currentAlpha);
        } else if (p.type === 'petal') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.swayAngle) * 0.6;
          p.angle += p.rotationSpeed;
          p.tilt += p.tiltSpeed;
          p.swayAngle += p.swaySpeed;

          if (p.y > height + 35) Object.assign(p, initParticle(-35));
          drawPetal(ctx, p.x, p.y, p.w, p.h, p.angle, p.tilt, p.color, p.alpha);
        } else if (p.type === 'heart') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.swayAngle) * 0.5;
          p.swayAngle += p.swaySpeed;

          if (p.y < -35) Object.assign(p, initParticle(height + 35));
          drawHeart(ctx, p.x, p.y, p.size, p.angle, p.color, p.alpha);
        } else if (p.type === 'ribbon') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.swayAngle) * 0.6;
          p.rotX += p.speedRotX;
          p.rotY += p.speedRotY;
          p.swayAngle += p.swaySpeed;

          if (p.y > height + 35) Object.assign(p, initParticle(-35));
          draw3DRibbon(ctx, p.x, p.y, p.w, p.h, p.rotX, p.rotY, p.rotZ, p.scheme, p.alpha);
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
      {/* 1. Cinematic Ambient Lighting & Vignette Layer (Awwwards / Apple-tier) */}
      <div
        aria-hidden="true"
        className={
          previewSettings
            ? 'absolute inset-0 pointer-events-none z-0 rounded-xl transition-all duration-1000'
            : 'fixed inset-0 pointer-events-none z-20 transition-all duration-1000 select-none'
        }
        style={{
          background: ambientVignetteGradient,
        }}
      />

      {/* 2. Ambient Particle Canvas Layer (pointer-events-none, z-30) */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={
          previewSettings
            ? 'absolute inset-0 pointer-events-none z-10 w-full h-full'
            : 'fixed inset-0 pointer-events-none z-30 w-full h-full'
        }
      />

      {/* 3. Luxury Floating Hero Festive Ornament (Lottie living vector with glassmorphism pedestal) */}
      {activePreset.lottieAsset && (
        <div
          ref={heroLottieContainerRef}
          aria-hidden="true"
          className={
            previewSettings
              ? `absolute ${placementClass} z-20 pointer-events-none select-none w-36 h-36 sm:w-44 sm:h-44`
              : `fixed ${placementClass} z-35 pointer-events-none select-none w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72`
          }
        >
          {/* Subtle warm backlight disc */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-60 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${activePreset.accentColor} 0%, transparent 70%)`,
            }}
          />

          <Lottie
            key={activeEffectId}
            src={lottieData || activePreset.lottieAsset}
            loop={!reducedMotion}
            autoplay={!reducedMotion}
            className="relative z-10 w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      {/* 4. Secondary Festive Accent (For Diwali: Left Diya / For Ramadan: Secondary Lantern) */}
      {!previewSettings && (activeEffectId === 'diwali' || activeEffectId === 'ramadan') && (
        <div
          ref={secondaryLottieContainerRef}
          aria-hidden="true"
          className="fixed bottom-6 left-6 z-35 pointer-events-none select-none w-32 h-32 sm:w-40 sm:h-40 hidden md:block opacity-85"
        >
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${activePreset.accentColor} 0%, transparent 70%)`,
            }}
          />
          <Lottie
            key={`${activeEffectId}-secondary`}
            src={lottieData || activePreset.lottieAsset}
            loop={!reducedMotion}
            autoplay={!reducedMotion}
            className="relative z-10 w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      {/* 5. Floating Luxury Frosted Glass Greeting Pill */}
      {showGreetingPill && !previewSettings && (
        <aside
          role="region"
          aria-label="Festive Greeting"
          className="fixed bottom-6 left-6 z-40 max-w-sm sm:max-w-md pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0a0d14]/90 backdrop-blur-2xl border border-white/20 text-white shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.25)]">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse shadow-[0_0_10px_currentColor]"
              style={{ backgroundColor: activePreset.accentColor, color: activePreset.accentColor }}
            />
            <p className="text-xs sm:text-[13px] font-medium text-white/95 leading-tight truncate">
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
