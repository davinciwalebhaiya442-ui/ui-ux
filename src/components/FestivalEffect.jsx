'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_FESTIVAL_SETTINGS } from '@/lib/festival';

export default function FestivalEffect({ previewSettings = null }) {
  const [settings, setSettings] = useState(previewSettings || DEFAULT_FESTIVAL_SETTINGS);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const particlesRef = useRef([]);

  // Sync settings when previewSettings prop changes (for Admin Live Preview)
  useEffect(() => {
    if (previewSettings) {
      setSettings(previewSettings);
    }
  }, [previewSettings]);

  // Fetch live settings on mount (unless controlled via previewSettings)
  useEffect(() => {
    if (previewSettings) return;

    let isMounted = true;
    const fetchSettings = () => {
      fetch('/api/festival')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.festival && isMounted) {
            setSettings(data.festival);
          }
        })
        .catch(() => {});
    };

    fetchSettings();

    // Cross-tab broadcast listener (0 Vercel CPU)
    let bc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('dwb_festival_channel');
        bc.onmessage = (event) => {
          if (event.data?.festival) {
            setSettings(event.data.festival);
          } else {
            fetchSettings();
          }
        };
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'dwb_festival_updated') {
        fetchSettings();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [previewSettings]);

  const isEnabled = Boolean(settings?.enabled);
  const effectType = settings?.effect || 'snow';
  const intensity = settings?.intensity || 'medium';
  const enableOnMobile = settings?.enableOnMobile !== false;
  const speedMultiplier = settings?.customSpeed === 2 ? 1.6 : settings?.customSpeed === 0 ? 0.6 : 1.0;

  // Setup and run canvas particle animation
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = previewSettings ? (canvas.parentElement?.clientWidth || 600) : window.innerWidth);
    let height = (canvas.height = previewSettings ? (canvas.parentElement?.clientHeight || 320) : window.innerHeight);

    const isMobile = width < 768;
    if (isMobile && !enableOnMobile) {
      return;
    }

    // Determine particle count based on intensity
    let baseCount = intensity === 'high' ? 120 : intensity === 'low' ? 35 : 70;
    if (isMobile) {
      baseCount = Math.round(baseCount * 0.55); // Optimize for mobile GPU
    }

    // Initialize particles depending on effect
    const initParticle = () => {
      if (effectType === 'snow') {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.5 + 1.2,
          speedY: (Math.random() * 1.2 + 0.8) * speedMultiplier,
          speedX: (Math.random() * 0.6 - 0.3) * speedMultiplier,
          opacity: Math.random() * 0.5 + 0.4,
          windAngle: Math.random() * Math.PI * 2,
          windSpeed: Math.random() * 0.02 + 0.01,
        };
      } else if (effectType === 'diwali') {
        const colors = ['#f59e0b', '#fbbf24', '#ea580c', '#fef08a', '#ffd700'];
        return {
          x: Math.random() * width,
          y: height + Math.random() * 100,
          radius: Math.random() * 2.2 + 0.8,
          speedY: -(Math.random() * 1.8 + 0.9) * speedMultiplier,
          speedX: (Math.random() * 1.2 - 0.6) * speedMultiplier,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.7 + 0.3,
          flickerSpeed: Math.random() * 0.08 + 0.03,
          flickerAngle: Math.random() * Math.PI * 2,
        };
      } else if (effectType === 'confetti') {
        const colors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
        return {
          x: Math.random() * width,
          y: Math.random() * height - height,
          width: Math.random() * 8 + 6,
          height: Math.random() * 5 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedY: (Math.random() * 2.0 + 1.2) * speedMultiplier,
          speedX: (Math.random() * 1.5 - 0.75) * speedMultiplier,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() * 4 - 2) * speedMultiplier,
          tilt: Math.random() * 10,
          tiltAngle: Math.random() * Math.PI * 2,
          tiltSpeed: Math.random() * 0.05 + 0.02,
        };
      } else {
        // fireflies
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.0 + 1.0,
          speedX: (Math.random() * 0.8 - 0.4) * speedMultiplier,
          speedY: (Math.random() * 0.8 - 0.4) * speedMultiplier,
          color: Math.random() > 0.4 ? '#34d399' : '#facc15',
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.015,
        };
      }
    };

    particlesRef.current = Array.from({ length: baseCount }, () => initParticle());

    const handleResize = () => {
      width = canvas.width = previewSettings ? (canvas.parentElement?.clientWidth || 600) : window.innerWidth;
      height = canvas.height = previewSettings ? (canvas.parentElement?.clientHeight || 320) : window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let isRunning = true;
    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const len = particles.length;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        if (effectType === 'snow') {
          p.windAngle += p.windSpeed;
          p.x += p.speedX + Math.sin(p.windAngle) * 0.6;
          p.y += p.speedY;

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width + 10) p.x = -10;
          if (p.x < -10) p.x = width + 10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.shadowBlur = p.radius > 2.5 ? 4 : 0;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
        } else if (effectType === 'diwali') {
          p.flickerAngle += p.flickerSpeed;
          const currentAlpha = Math.max(0.1, Math.min(1, p.alpha + Math.sin(p.flickerAngle) * 0.25));

          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.flickerAngle * 0.7) * 0.4;

          if (p.y < -20 || currentAlpha <= 0.05) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.alpha = Math.random() * 0.7 + 0.3;
          }

          ctx.save();
          ctx.globalAlpha = currentAlpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        } else if (effectType === 'confetti') {
          p.tiltAngle += p.tiltSpeed;
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.tiltAngle) * 0.5;
          p.rotation += p.rotationSpeed;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(1, Math.cos(p.tiltAngle));
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
          ctx.restore();
        } else {
          // fireflies
          p.pulse += p.pulseSpeed;
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;

          const alpha = 0.25 + 0.6 * ((Math.sin(p.pulse) + 1) / 2);

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Auto pause when tab is inactive to preserve battery & 0 CPU
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      } else {
        if (!animFrameIdRef.current) {
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
  }, [isEnabled, effectType, intensity, enableOnMobile, speedMultiplier]);

  if (!isEnabled) return null;

  return (
    <>
      {/* Canvas — Pointer events none ensures clicks pass straight through */}
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
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[85] max-w-lg w-[92%] sm:w-auto px-4 py-2 rounded-full bg-black/75 backdrop-blur-xl border border-white/15 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 text-xs font-sans animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="truncate text-white/90 font-medium">
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
