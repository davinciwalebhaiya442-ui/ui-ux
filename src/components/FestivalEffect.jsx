'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_FESTIVAL_SETTINGS } from '@/lib/festival';

export default function FestivalEffect({ previewSettings = null }) {
  // Initialize from previewSettings, or localStorage instant cache to eliminate any delay
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

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  // Sync settings when previewSettings prop changes (for Admin Live Simulator)
  useEffect(() => {
    if (previewSettings) {
      setSettings(previewSettings);
    }
  }, [previewSettings]);

  // Live client-side fetch & multi-channel instant sync (< 5ms)
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

    // 1. Cross-tab BroadcastChannel (< 1ms instant update)
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

    // 2. Storage event for cross-window sync
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

    // 3. Custom event for same-tab instant triggers
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

  const isEnabled = Boolean(settings?.enabled);
  const effectType = settings?.effect || 'snow';
  const intensity = settings?.intensity || 'medium';
  const enableOnMobile = settings?.enableOnMobile !== false;
  const speedMultiplier = settings?.customSpeed === 2 ? 1.5 : settings?.customSpeed === 0 ? 0.65 : 1.0;

  // Track mouse for organic interactive particle drift
  useEffect(() => {
    if (!isEnabled) return;
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, active: false };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isEnabled]);

  // Main High-End Canvas Engine
  useEffect(() => {
    if (!isEnabled) {
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

    // Particle density calculation
    let count = intensity === 'high' ? 140 : intensity === 'low' ? 45 : 85;
    if (isMobile) {
      count = Math.round(count * 0.55);
    }

    // Helper: Draw detailed 6-point star ice crystal
    const drawIceCrystal = (context, x, y, radius, angle, alpha) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      context.lineWidth = 1;
      context.lineCap = 'round';
      context.beginPath();

      for (let i = 0; i < 3; i++) {
        context.rotate(Math.PI / 3);
        context.moveTo(-radius, 0);
        context.lineTo(radius, 0);
        // tiny crystal cross-branches
        const branchOffset = radius * 0.55;
        const branchSize = radius * 0.3;
        context.moveTo(branchOffset, 0);
        context.lineTo(branchOffset + branchSize * 0.7, branchSize);
        context.moveTo(branchOffset, 0);
        context.lineTo(branchOffset + branchSize * 0.7, -branchSize);
        context.moveTo(-branchOffset, 0);
        context.lineTo(-branchOffset - branchSize * 0.7, branchSize);
        context.moveTo(-branchOffset, 0);
        context.lineTo(-branchOffset - branchSize * 0.7, -branchSize);
      }
      context.stroke();
      context.restore();
    };

    // Initialize individual particle with rich 3D layers
    const initParticle = (initialY = null) => {
      const y = initialY !== null ? initialY : Math.random() * height;
      const x = Math.random() * width;

      if (effectType === 'snow') {
        const rand = Math.random();
        // 3 Layers: Foreground Bokeh (15%), Midground Crystal (55%), Background Mist (30%)
        let layer = 'mid';
        let radius = Math.random() * 2.2 + 2.0;
        let speedY = (Math.random() * 1.2 + 1.1) * speedMultiplier;
        let opacity = Math.random() * 0.4 + 0.6;
        let isCrystal = Math.random() > 0.45;

        if (rand < 0.15) {
          // Foreground Bokeh
          layer = 'fore';
          radius = Math.random() * 6.0 + 7.0;
          speedY = (Math.random() * 1.5 + 2.2) * speedMultiplier;
          opacity = Math.random() * 0.18 + 0.14;
          isCrystal = false;
        } else if (rand > 0.70) {
          // Background Mist
          layer = 'back';
          radius = Math.random() * 1.0 + 0.9;
          speedY = (Math.random() * 0.6 + 0.6) * speedMultiplier;
          opacity = Math.random() * 0.35 + 0.25;
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
          swaySpeed: Math.random() * 0.025 + 0.015,
          swayWidth: Math.random() * 1.5 + 0.8,
          sparkleOffset: Math.random() * 10,
        };
      } else if (effectType === 'diwali') {
        const isSparks = Math.random() > 0.75;
        const colors = [
          { core: '#ffffff', mid: '#fef08a', edge: '#f59e0b' }, // Bright Gold
          { core: '#fffbeb', mid: '#fbbf24', edge: '#ea580c' }, // Amber Fire
          { core: '#ffffff', mid: '#fde047', edge: '#d97706' }, // Warm Yellow
          { core: '#fed7aa', mid: '#f97316', edge: '#dc2626' }, // Molten Flame
        ];
        const colorScheme = colors[Math.floor(Math.random() * colors.length)];

        return {
          x,
          y: initialY !== null ? initialY : height + Math.random() * 80,
          radius: isSparks ? Math.random() * 1.5 + 0.8 : Math.random() * 3.0 + 1.8,
          speedY: isSparks
            ? -(Math.random() * 3.2 + 2.0) * speedMultiplier
            : -(Math.random() * 1.8 + 1.0) * speedMultiplier,
          speedX: (Math.random() * 1.4 - 0.7) * speedMultiplier,
          color: colorScheme,
          alpha: Math.random() * 0.6 + 0.4,
          flickerAngle: Math.random() * Math.PI * 2,
          flickerSpeed: Math.random() * 0.12 + 0.04,
          life: 1.0,
          decay: Math.random() * 0.006 + 0.003,
          turbulenceOffset: Math.random() * 100,
        };
      } else if (effectType === 'confetti') {
        const festiveColors = [
          { main: '#ffd700', dark: '#b45309' }, // Gold Metallic
          { main: '#ec4899', dark: '#9d174d' }, // Foil Pink
          { main: '#06b6d4', dark: '#0e7490' }, // Electric Cyan
          { main: '#3b82f6', dark: '#1d4ed8' }, // Sapphire
          { main: '#10b981', dark: '#047857' }, // Emerald
          { main: '#a855f7', dark: '#6b21a8' }, // Violet
          { main: '#ef4444', dark: '#991b1b' }, // Ruby Red
        ];
        const scheme = festiveColors[Math.floor(Math.random() * festiveColors.length)];

        return {
          x,
          y: initialY !== null ? initialY : Math.random() * -height,
          w: Math.random() * 7 + 6,
          h: Math.random() * 12 + 8,
          scheme,
          speedY: (Math.random() * 2.2 + 1.4) * speedMultiplier,
          speedX: (Math.random() * 1.2 - 0.6) * speedMultiplier,
          rotationX: Math.random() * 360,
          rotationY: Math.random() * 360,
          rotationZ: Math.random() * 360,
          speedRotX: (Math.random() * 3.5 + 1.5) * speedMultiplier,
          speedRotY: (Math.random() * 4.0 + 2.0) * speedMultiplier,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.02,
        };
      } else {
        // Magic Fireflies
        const colors = ['#34d399', '#facc15', '#67e8f9', '#a7f3d0'];
        return {
          x,
          y,
          radius: Math.random() * 2.4 + 1.4,
          speedX: (Math.random() * 0.9 - 0.45) * speedMultiplier,
          speedY: (Math.random() * 0.9 - 0.45) * speedMultiplier,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.015,
          glowSize: Math.random() * 14 + 10,
        };
      }
    };

    particlesRef.current = Array.from({ length: count }, () => initParticle());

    const handleResize = () => {
      width = canvas.width = previewSettings ? (canvas.parentElement?.clientWidth || 600) : window.innerWidth;
      height = canvas.height = previewSettings ? (canvas.parentElement?.clientHeight || 320) : window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop (60 FPS)
    let isRunning = true;
    let startTime = performance.now();

    const render = (currentTime) => {
      if (!isRunning) return;

      const elapsed = (currentTime - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const len = particles.length;
      const mouse = mouseRef.current;

      // Natural Atmospheric Breeze / Wind
      const globalWind = Math.sin(elapsed * 0.6) * 0.9 + Math.cos(elapsed * 0.25) * 0.5;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // ----------------------------------------------------
        // 1. WINTER SNOWFALL
        // ----------------------------------------------------
        if (effectType === 'snow') {
          p.swayAngle += p.swaySpeed;
          p.angle += p.rotationSpeed;
          p.y += p.speedY;
          p.x += Math.sin(p.swayAngle) * p.swayWidth + globalWind * (p.layer === 'fore' ? 1.4 : 0.8);

          // Interactive organic mouse swirl
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 90 && dist > 0) {
              const force = (90 - dist) / 90;
              p.x += (dx / dist) * force * 3.5;
              p.y += (dy / dist) * force * 2.0;
            }
          }

          // Recycle seamlessly
          if (p.y > height + 20) {
            particles[i] = initParticle(-15);
            continue;
          }
          if (p.x > width + 25) p.x = -20;
          if (p.x < -25) p.x = width + 20;

          // Twinkle shimmer
          const twinkle = Math.sin(elapsed * 3.5 + p.sparkleOffset) * 0.12;
          const currentAlpha = Math.max(0.08, Math.min(1, p.opacity + twinkle));

          if (p.layer === 'fore') {
            // High-End Out-of-Focus Bokeh Snowball
            const bokehGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            bokehGrad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha * 0.9})`);
            bokehGrad.addColorStop(0.5, `rgba(255, 255, 255, ${currentAlpha * 0.35})`);
            bokehGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = bokehGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.isCrystal && p.layer === 'mid') {
            // Delicate Star Crystal
            drawIceCrystal(ctx, p.x, p.y, p.radius * 1.5, p.angle, currentAlpha);
          } else {
            // Soft Fluffy Snowball with subtle glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
            ctx.shadowBlur = p.radius > 2 ? 6 : 0;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // ----------------------------------------------------
        // 2. DIWALI & GOLDEN CINEMA EMBERS
        // ----------------------------------------------------
        else if (effectType === 'diwali') {
          p.flickerAngle += p.flickerSpeed;
          p.life -= p.decay;

          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.flickerAngle * 0.8 + elapsed) * 0.7;

          // Mouse convection draft
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80 && dist > 0) {
              p.x += (dx / dist) * 2.5;
            }
          }

          if (p.y < -30 || p.life <= 0) {
            particles[i] = initParticle(height + 15);
            continue;
          }

          const currentAlpha = Math.max(0.05, Math.min(1, p.alpha * p.life + Math.sin(p.flickerAngle) * 0.2));

          // Multi-layer glowing molten ember
          const rad = p.radius * 2.4;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
          grad.addColorStop(0, p.color.core);
          grad.addColorStop(0.25, p.color.mid);
          grad.addColorStop(0.65, p.color.edge);
          grad.addColorStop(1, 'rgba(234, 88, 12, 0)');

          ctx.save();
          ctx.globalAlpha = currentAlpha;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.fill();

          // Hot pin-point center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.6, p.radius * 0.4), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // ----------------------------------------------------
        // 3. CELEBRATION CONFETTI (3D Foil Tumbling)
        // ----------------------------------------------------
        else if (effectType === 'confetti') {
          p.swayAngle += p.swaySpeed;
          p.rotationX += p.speedRotX;
          p.rotationY += p.speedRotY;
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.swayAngle) * 0.9;

          if (p.y > height + 30) {
            particles[i] = initParticle(-20);
            continue;
          }

          // 3D Matrix Perspective Projection
          const cosX = Math.cos((p.rotationX * Math.PI) / 180);
          const cosY = Math.cos((p.rotationY * Math.PI) / 180);
          const isFront = cosX * cosY > 0;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotationZ * Math.PI) / 180);
          ctx.scale(cosX, cosY);

          // Specular metallic sheen on face
          ctx.fillStyle = isFront ? p.scheme.main : p.scheme.dark;
          ctx.shadowBlur = 4;
          ctx.shadowColor = p.scheme.main;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

          // Shiny metallic foil reflection highlight
          if (isFront && Math.abs(cosX) > 0.6) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w * 0.35, p.h);
          }
          ctx.restore();
        }

        // ----------------------------------------------------
        // 4. MAGIC FIREFLIES
        // ----------------------------------------------------
        else {
          p.pulse += p.pulseSpeed;
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;

          const alpha = 0.2 + 0.7 * ((Math.sin(p.pulse) + 1) / 2);

          // Soft ambient halo
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowSize);
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.3, p.color);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Bright center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Auto-pause when tab is inactive to preserve 0 CPU
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      } else {
        if (!animFrameIdRef.current) {
          startTime = performance.now();
          animFrameIdRef.current = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnabled, effectType, intensity, enableOnMobile, speedMultiplier, previewSettings]);

  if (!isEnabled) return null;

  return (
    <>
      {/* High Performance Canvas — Pointer events none ensures clicks pass straight through */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={
          previewSettings
            ? 'absolute inset-0 w-full h-full pointer-events-none z-[10] overflow-hidden select-none'
            : 'fixed inset-0 pointer-events-none z-[80] overflow-hidden select-none'
        }
      />

      {/* Optional Festive Greeting Pill at top (dismissable) */}
      {settings.greetingEnabled && settings.greetingText && !bannerDismissed && !previewSettings && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[85] max-w-lg w-[92%] sm:w-auto px-4 py-2 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3 text-xs font-sans animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="truncate text-white/95 font-medium">
            {settings.greetingText}
          </span>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss greeting"
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
