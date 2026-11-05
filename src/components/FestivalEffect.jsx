'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFAULT_FESTIVAL_SETTINGS } from '@/lib/festival';

export default function FestivalEffect({ previewSettings = null }) {
  // Read from previewSettings or localStorage instant cache to prevent any startup delay
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

  // Sync settings when previewSettings prop changes (for Admin Simulator)
  useEffect(() => {
    if (previewSettings) {
      setSettings(previewSettings);
    }
  }, [previewSettings]);

  // Live client-side fetch & sub-5ms instant multi-channel sync
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

    // 1. Cross-tab BroadcastChannel (< 1ms instant sync)
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

    // 3. Custom event for same-window triggers
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
  const speedMultiplier = settings?.customSpeed === 2 ? 1.55 : settings?.customSpeed === 0 ? 0.65 : 1.0;

  // Track cursor for organic fluid breeze deflection
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

  // Periodic celebration burst for New Year or Independence Day
  useEffect(() => {
    if (!isEnabled || previewSettings) return;
    if (effectType !== 'newyear' && effectType !== 'independence') return;

    // Small ambient celebratory blast every 12 seconds
    const interval = setInterval(() => {
      if (document.hidden) return;
      try {
        if (effectType === 'independence') {
          confetti({
            particleCount: 30,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.85 },
            colors: ['#ff9933', '#ffffff', '#138808'],
            disableForReducedMotion: true,
            zIndex: 85,
          });
          confetti({
            particleCount: 30,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.85 },
            colors: ['#ff9933', '#ffffff', '#138808'],
            disableForReducedMotion: true,
            zIndex: 85,
          });
        } else if (effectType === 'newyear') {
          confetti({
            particleCount: 40,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#ffd700', '#ffffff', '#ec4899', '#3b82f6', '#10b981'],
            disableForReducedMotion: true,
            zIndex: 85,
          });
        }
      } catch (e) {}
    }, 14000);

    return () => clearInterval(interval);
  }, [isEnabled, effectType, previewSettings]);

  // Main High-End Canvas Particle Simulation Engine
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

    // Determine particle count based on intensity
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
        const branchOffset = radius * 0.55;
        const branchSize = radius * 0.32;
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

    // Helper: Draw smooth Bezier Flower Petal (for Ganesh / Durga Puja)
    const drawPetal = (context, x, y, w, h, angle, color, alpha) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.globalAlpha = alpha;
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(0, -h / 2);
      context.bezierCurveTo(w / 2, -h / 4, w / 2, h / 4, 0, h / 2);
      context.bezierCurveTo(-w / 2, h / 4, -w / 2, -h / 4, 0, -h / 2);
      context.fill();
      context.restore();
    };

    // Helper: Draw Smooth Glowing Heart (for Valentine)
    const drawHeart = (context, x, y, size, angle, color, alpha) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.globalAlpha = alpha;
      context.fillStyle = color;
      context.shadowBlur = 8;
      context.shadowColor = color;
      context.beginPath();
      const topCurveHeight = size * 0.3;
      context.moveTo(0, topCurveHeight);
      context.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      context.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 1.3, 0, size);
      context.bezierCurveTo(0, (size + topCurveHeight) / 1.3, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      context.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      context.fill();
      context.restore();
    };

    // Initialize individual particle according to active festival preset
    const initParticle = (initialY = null) => {
      const y = initialY !== null ? initialY : Math.random() * height;
      const x = Math.random() * width;

      // -----------------------------------------------------------------
      // 1. WINTER SNOWFALL (Ultra-Premium 4-Layer 3D Bokeh Simulation)
      // -----------------------------------------------------------------
      if (effectType === 'snow' || effectType === 'christmas') {
        const rand = Math.random();
        let layer = 'mid';
        let radius = Math.random() * 2.2 + 2.0;
        let speedY = (Math.random() * 1.3 + 1.1) * speedMultiplier;
        let opacity = Math.random() * 0.4 + 0.6;
        let isCrystal = Math.random() > 0.42;

        if (rand < 0.12) {
          // Macro Camera Bokeh Snowball (Lens Foreground)
          layer = 'bokeh';
          radius = Math.random() * 7.0 + 8.5; // Big soft bokeh (up to 15.5px)
          speedY = (Math.random() * 1.6 + 2.4) * speedMultiplier;
          opacity = Math.random() * 0.22 + 0.12;
          isCrystal = false;
        } else if (rand > 0.72) {
          // Atmospheric Background Snow Mist
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
          sparkleOffset: Math.random() * 10,
          isChristmasStar: effectType === 'christmas' && Math.random() > 0.85,
        };
      }

      // -----------------------------------------------------------------
      // 2. DIWALI & GOLDEN EMBERS / DUSSEHRA
      // -----------------------------------------------------------------
      else if (effectType === 'diwali' || effectType === 'dussehra') {
        const isSparks = Math.random() > 0.75;
        const colors = [
          { core: '#ffffff', mid: '#fef08a', edge: '#f59e0b' }, // Bright Gold
          { core: '#fffbeb', mid: '#fbbf24', edge: '#ea580c' }, // Amber Flame
          { core: '#ffffff', mid: '#fde047', edge: '#d97706' }, // Warm Yellow
          { core: '#fed7aa', mid: '#f97316', edge: '#dc2626' }, // Molten Cinder
        ];
        const colorScheme = colors[Math.floor(Math.random() * colors.length)];

        return {
          x,
          y: initialY !== null ? initialY : height + Math.random() * 80,
          radius: isSparks ? Math.random() * 1.6 + 0.8 : Math.random() * 3.2 + 1.8,
          speedY: isSparks
            ? -(Math.random() * 3.4 + 2.2) * speedMultiplier
            : -(Math.random() * 1.8 + 1.0) * speedMultiplier,
          speedX: (Math.random() * 1.4 - 0.7) * speedMultiplier,
          color: colorScheme,
          alpha: Math.random() * 0.6 + 0.4,
          flickerAngle: Math.random() * Math.PI * 2,
          flickerSpeed: Math.random() * 0.12 + 0.04,
          life: 1.0,
          decay: Math.random() * 0.007 + 0.003,
        };
      }

      // -----------------------------------------------------------------
      // 3. HOLI COLORS (Organic Gulal Powder Splash)
      // -----------------------------------------------------------------
      else if (effectType === 'holi') {
        const gulalColors = ['#f43f5e', '#ec4899', '#eab308', '#06b6d4', '#8b5cf6', '#10b981', '#f97316'];
        const color = gulalColors[Math.floor(Math.random() * gulalColors.length)];

        return {
          x,
          y: initialY !== null ? initialY : Math.random() * height,
          radius: Math.random() * 5.0 + 2.5,
          color,
          speedY: (Math.random() * 1.4 + 0.8) * speedMultiplier,
          speedX: (Math.random() * 1.8 - 0.9) * speedMultiplier,
          alpha: Math.random() * 0.45 + 0.35,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.015,
        };
      }

      // -----------------------------------------------------------------
      // 4. EID & RAMADAN (Golden Crescent & Lantern Stars)
      // -----------------------------------------------------------------
      else if (effectType === 'eid') {
        const isCrescent = Math.random() > 0.88;
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
          angle: Math.random() * 0.4 - 0.2,
        };
      }

      // -----------------------------------------------------------------
      // 5. GANESH CHATURTHI & DURGA PUJA (Sacred Petals & Dhunuchi Sparks)
      // -----------------------------------------------------------------
      else if (effectType === 'ganesh' || effectType === 'durga_puja') {
        const petalColors = ['#e11d48', '#f97316', '#fbbf24', '#f43f5e', '#ea580c'];
        const color = petalColors[Math.floor(Math.random() * petalColors.length)];

        return {
          x,
          y: initialY !== null ? initialY : Math.random() * -height,
          w: Math.random() * 7 + 7,
          h: Math.random() * 13 + 11,
          color,
          speedY: (Math.random() * 1.6 + 1.0) * speedMultiplier,
          speedX: (Math.random() * 1.4 - 0.7) * speedMultiplier,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 0.04 - 0.02) * speedMultiplier,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.015,
          alpha: Math.random() * 0.4 + 0.5,
        };
      }

      // -----------------------------------------------------------------
      // 6. VALENTINE'S DAY (Floating Hearts)
      // -----------------------------------------------------------------
      else if (effectType === 'valentine') {
        const heartColors = ['#f43f5e', '#fb7185', '#fda4af', '#e11d48'];
        const color = heartColors[Math.floor(Math.random() * heartColors.length)];

        return {
          x,
          y: initialY !== null ? initialY : height + Math.random() * 50,
          size: Math.random() * 12 + 10,
          color,
          speedY: -(Math.random() * 1.2 + 0.8) * speedMultiplier,
          speedX: (Math.random() * 0.8 - 0.4) * speedMultiplier,
          angle: Math.random() * 0.4 - 0.2,
          rotationSpeed: (Math.random() * 0.01 - 0.005) * speedMultiplier,
          swayAngle: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.025 + 0.015,
          alpha: Math.random() * 0.45 + 0.35,
        };
      }

      // -----------------------------------------------------------------
      // 7. NEW YEAR & INDEPENDENCE DAY (3D Metallic Confetti Ribbons)
      // -----------------------------------------------------------------
      else {
        let colors = [
          { main: '#ffd700', dark: '#b45309' }, // Gold
          { main: '#ec4899', dark: '#9d174d' }, // Foil Pink
          { main: '#06b6d4', dark: '#0e7490' }, // Electric Cyan
          { main: '#3b82f6', dark: '#1d4ed8' }, // Sapphire
          { main: '#10b981', dark: '#047857' }, // Emerald
        ];

        if (effectType === 'independence') {
          colors = [
            { main: '#ff9933', dark: '#c2410c' }, // Saffron
            { main: '#ffffff', dark: '#94a3b8' }, // White
            { main: '#138808', dark: '#14532d' }, // Green
            { main: '#000080', dark: '#1e1b4b' }, // Navy Blue
          ];
        } else if (effectType === 'halloween') {
          colors = [
            { main: '#ea580c', dark: '#7c2d12' }, // Pumpkin Orange
            { main: '#84cc16', dark: '#3f6212' }, // Eerie Slime
            { main: '#78716c', dark: '#292524' }, // Charcoal Ash
          ];
        }

        const scheme = colors[Math.floor(Math.random() * colors.length)];

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
      }
    };

    particlesRef.current = Array.from({ length: count }, () => initParticle());

    const handleResize = () => {
      width = canvas.width = previewSettings ? (canvas.parentElement?.clientWidth || 600) : window.innerWidth;
      height = canvas.height = previewSettings ? (canvas.parentElement?.clientHeight || 320) : window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 60 FPS Render Loop
    let isRunning = true;
    let startTime = performance.now();

    const render = (currentTime) => {
      if (!isRunning) return;

      const elapsed = (currentTime - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const len = particles.length;
      const mouse = mouseRef.current;

      // Natural Atmospheric Breeze
      const globalWind = Math.sin(elapsed * 0.6) * 0.95 + Math.cos(elapsed * 0.25) * 0.55;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // ----------------------------------------------------
        // 1. WINTER SNOWFALL & CHRISTMAS
        // ----------------------------------------------------
        if (effectType === 'snow' || effectType === 'christmas') {
          p.swayAngle += p.swaySpeed;
          p.angle += p.rotationSpeed;
          p.y += p.speedY;
          p.x += Math.sin(p.swayAngle) * p.swayWidth + globalWind * (p.layer === 'bokeh' ? 1.5 : 0.85);

          // Interactive organic mouse swirl
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 && dist > 0) {
              const force = (100 - dist) / 100;
              p.x += (dx / dist) * force * 4.0;
              p.y += (dy / dist) * force * 2.2;
            }
          }

          // Recycle seamlessly
          if (p.y > height + 25) {
            particles[i] = initParticle(-15);
            continue;
          }
          if (p.x > width + 30) p.x = -25;
          if (p.x < -30) p.x = width + 25;

          // Twinkle shimmer
          const twinkle = Math.sin(elapsed * 3.5 + p.sparkleOffset) * 0.12;
          const currentAlpha = Math.max(0.08, Math.min(1, p.opacity + twinkle));

          if (p.layer === 'bokeh') {
            // Ultra-Realistic 3D Bokeh Snowball
            const bokehGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            bokehGrad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha * 0.95})`);
            bokehGrad.addColorStop(0.45, `rgba(255, 255, 255, ${currentAlpha * 0.35})`);
            bokehGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = bokehGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.isCrystal && p.layer === 'mid') {
            // Detailed Hexagonal Ice Dendrite
            drawIceCrystal(ctx, p.x, p.y, p.radius * 1.55, p.angle, currentAlpha);
          } else {
            // Soft Fluffy Snowball with subtle glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
            ctx.shadowBlur = p.radius > 2.2 ? 6 : 0;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // ----------------------------------------------------
        // 2. DIWALI & DUSSEHRA (Molten Gold Embers & Sparks)
        // ----------------------------------------------------
        else if (effectType === 'diwali' || effectType === 'dussehra') {
          p.flickerAngle += p.flickerSpeed;
          p.life -= p.decay;

          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.flickerAngle * 0.8 + elapsed) * 0.75;

          if (p.y < -30 || p.life <= 0) {
            particles[i] = initParticle(height + 15);
            continue;
          }

          const currentAlpha = Math.max(0.05, Math.min(1, p.alpha * p.life + Math.sin(p.flickerAngle) * 0.2));
          const rad = p.radius * 2.5;
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

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.6, p.radius * 0.4), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // ----------------------------------------------------
        // 3. HOLI COLORS (Organic Gulal Powder Clouds)
        // ----------------------------------------------------
        else if (effectType === 'holi') {
          p.swayAngle += p.swaySpeed;
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.swayAngle) * 0.8;

          if (p.y > height + 20) {
            particles[i] = initParticle(-15);
            continue;
          }

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.2);
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.5, p.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // ----------------------------------------------------
        // 4. EID & RAMADAN (Crescent & Starlight)
        // ----------------------------------------------------
        else if (effectType === 'eid') {
          p.pulse += p.pulseSpeed;
          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y < -30) {
            particles[i] = initParticle(height + 20);
            continue;
          }

          const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          if (p.isCrescent) {
            // Draw Golden Crescent Moon
            ctx.fillStyle = '#fef08a';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#eab308';
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0.4, Math.PI * 1.6);
            ctx.bezierCurveTo(p.radius * 0.5, p.radius * 0.2, p.radius * 0.5, -p.radius * 0.2, 0, -p.radius * 0.8);
            ctx.fill();
          } else {
            // Golden 4-point Star
            ctx.fillStyle = '#fde047';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ca8a04';
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // ----------------------------------------------------
        // 5. GANESH CHATURTHI & DURGA PUJA (Flower Petals)
        // ----------------------------------------------------
        else if (effectType === 'ganesh' || effectType === 'durga_puja') {
          p.swayAngle += p.swaySpeed;
          p.angle += p.rotationSpeed;
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.swayAngle) * 1.4;

          if (p.y > height + 25) {
            particles[i] = initParticle(-20);
            continue;
          }

          drawPetal(ctx, p.x, p.y, p.w, p.h, p.angle, p.color, p.alpha);
        }

        // ----------------------------------------------------
        // 6. VALENTINE'S DAY (Glowing Hearts)
        // ----------------------------------------------------
        else if (effectType === 'valentine') {
          p.swayAngle += p.swaySpeed;
          p.angle += p.rotationSpeed;
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.swayAngle) * 0.8;

          if (p.y < -30) {
            particles[i] = initParticle(height + 25);
            continue;
          }

          drawHeart(ctx, p.x, p.y, p.size, p.angle, p.color, p.alpha);
        }

        // ----------------------------------------------------
        // 7. CONFETTI / NEW YEAR / INDEPENDENCE / HALLOWEEN
        // ----------------------------------------------------
        else {
          p.swayAngle += p.swaySpeed;
          p.rotationX += p.speedRotX;
          p.rotationY += p.speedRotY;
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.swayAngle) * 0.95;

          if (p.y > height + 30) {
            particles[i] = initParticle(-20);
            continue;
          }

          const cosX = Math.cos((p.rotationX * Math.PI) / 180);
          const cosY = Math.cos((p.rotationY * Math.PI) / 180);
          const isFront = cosX * cosY > 0;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotationZ * Math.PI) / 180);
          ctx.scale(cosX, cosY);

          ctx.fillStyle = isFront ? p.scheme.main : p.scheme.dark;
          ctx.shadowBlur = 4;
          ctx.shadowColor = p.scheme.main;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

          // Metallic foil reflection
          if (isFront && Math.abs(cosX) > 0.6) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w * 0.35, p.h);
          }
          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Auto-pause on inactive tab to ensure 0 CPU & preserve battery
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
      {/* 60 FPS Canvas — Pointer events none ensures clicks pass straight through */}
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
