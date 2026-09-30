'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeSrc = '',
  afterSrc = '',
  beforeLabel = 'Before',
  afterLabel = 'After',
  aspectRatio = '16/9',
  className = '',
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  // Track container width for exact un-squashed image clipping
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    window.addEventListener('resize', updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Keyboard navigation accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  const hasRealAfter = Boolean(afterSrc);
  const hasRealBefore = Boolean(beforeSrc);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="slider"
      aria-label="Before and After visual comparison"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      onKeyDown={handleKeyDown}
      className={`relative select-none overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07090e] shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-ew-resize group focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${className}`}
      style={{ aspectRatio }}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* AFTER IMAGE (Bottom Layer - Graded / Result) */}
      <div className="absolute inset-0 w-full h-full">
        {hasRealAfter ? (
          <img
            src={afterSrc}
            alt={afterLabel}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Procedural high-grade cinematic visual canvas fallback */
          <div className="relative w-full h-full bg-[#0a0f1d] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0b172a] via-[#091834] to-[#1e1b4b] opacity-90" />
            <div className="absolute top-[20%] right-[15%] w-72 h-72 rounded-full bg-amber-500/20 blur-[90px]" />
            <div className="absolute bottom-[10%] left-[20%] w-80 h-80 rounded-full bg-cyan-600/20 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
            <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_60%)]" />

            <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
              <div className="w-full max-w-lg h-44 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-400/90 tracking-wider">
                  <span>SPECTRAL DENSITY: 35MM KODAK 2383</span>
                  <span className="text-white/40">DCI-P3 D65</span>
                </div>
                <div className="grid grid-cols-4 gap-2 h-20 items-end">
                  <div className="bg-gradient-to-t from-red-600/60 to-red-400 h-[80%] rounded-sm" />
                  <div className="bg-gradient-to-t from-green-600/60 to-green-400 h-[65%] rounded-sm" />
                  <div className="bg-gradient-to-t from-blue-600/60 to-blue-400 h-[92%] rounded-sm" />
                  <div className="bg-gradient-to-t from-amber-500/60 to-yellow-300 h-[74%] rounded-sm" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-white/50">
                  <span>SUBTRACTIVE SATURATION</span>
                  <span className="text-emerald-400 font-semibold">16-BIT HDR PRINT</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AFTER BADGE */}
        <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-[#0a0d14]/85 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-wider uppercase text-amber-400 flex items-center space-x-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          <span>{afterLabel}</span>
        </div>
      </div>

      {/* BEFORE IMAGE (Top Layer - Flat / Original Shot, clipped by slider position) */}
      <div
        className="absolute inset-0 h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div
          className="h-full relative overflow-hidden"
          style={{ width: containerWidth ? `${containerWidth}px` : '100%', maxWidth: 'none' }}
        >
          {hasRealBefore ? (
            <img
              src={beforeSrc}
              alt={beforeLabel}
              className="w-full h-full object-cover"
              style={{ maxWidth: 'none' }}
            />
          ) : hasRealAfter ? (
            /* If only afterSrc exists, render desaturated log version for comparison */
            <img
              src={afterSrc}
              alt={beforeLabel}
              className="w-full h-full object-cover grayscale contrast-75 brightness-110"
              style={{ maxWidth: 'none' }}
            />
          ) : (
            /* Procedural Flat Raw Log appearance fallback */
            <div className="absolute inset-0 bg-[#161a22] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1e28] via-[#202533] to-[#1e232e] opacity-95" />
              <div className="absolute inset-0 bg-white/[0.04]" />

              <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                <div className="w-full max-w-lg h-44 rounded-xl border border-white/[0.06] bg-[#13161f]/60 backdrop-blur-sm p-4 flex flex-col justify-between opacity-70">
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/40 tracking-wider">
                    <span>RAW CAMERA LOG (ARRI LOG-C / S-LOG3)</span>
                    <span>FLAT DYNAMIC RANGE</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 h-20 items-end">
                    <div className="bg-white/20 h-[45%] rounded-sm" />
                    <div className="bg-white/20 h-[45%] rounded-sm" />
                    <div className="bg-white/20 h-[45%] rounded-sm" />
                    <div className="bg-white/20 h-[45%] rounded-sm" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-white/30">
                    <span>UNPROCESSED LINEAR SENSOR DATA</span>
                    <span>REC.709 OFF</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BEFORE BADGE */}
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-wider uppercase text-white/70 flex items-center space-x-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>{beforeLabel}</span>
          </div>
        </div>
      </div>

      {/* LIQUID GLASS DIVIDER LINE & TACTILE DRAG HANDLE */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-gradient-to-b from-blue-400 via-white to-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)] pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0a0d14]/95 backdrop-blur-xl border border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center text-white/90 group-hover:scale-110 active:scale-95 transition-transform pointer-events-auto">
          <SlidersHorizontal className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}
