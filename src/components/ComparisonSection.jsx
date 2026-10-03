'use client';

import { useState, useEffect } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { DEFAULT_COMPARISON_SETTINGS } from '@/app/api/comparison/route';
import { subscribeToProductUpdates } from '@/lib/events';

export default function ComparisonSection({ initialComparison = null }) {
  const [data, setData] = useState(() => initialComparison || DEFAULT_COMPARISON_SETTINGS);

  useEffect(() => {
    const fetchLatest = () => {
      fetch('/api/comparison')
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.comparison) {
            setData((prev) => ({
              ...prev,
              ...json.comparison,
              features: Array.isArray(json.comparison.features)
                ? json.comparison.features
                : prev.features || DEFAULT_COMPARISON_SETTINGS.features,
            }));
          }
        })
        .catch(() => {});
    };

    // If initialComparison was not provided by SSR, fetch client-side
    if (!initialComparison) {
      fetchLatest();
    }

    // Subscribe to admin updates across tabs
    const unsubscribe = subscribeToProductUpdates(() => {
      fetchLatest();
    });

    return () => unsubscribe();
  }, [initialComparison]);

  const features = Array.isArray(data.features)
    ? data.features
    : DEFAULT_COMPARISON_SETTINGS.features;

  const descriptionParagraphs = (data.description || DEFAULT_COMPARISON_SETTINGS.description)
    .split('\n\n')
    .filter(Boolean);

  return (
    <section
      id="comparison"
      className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 gap-6 pb-8 border-b border-white/[0.08]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-2">
            {data.badge || DEFAULT_COMPARISON_SETTINGS.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            {data.title || DEFAULT_COMPARISON_SETTINGS.title}
          </h2>
        </div>
        {data.subtitle && (
          <p className="max-w-md text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
            {data.subtitle}
          </p>
        )}
      </div>

      {/* Main Interactive Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <BeforeAfterSlider
            beforeSrc={data.beforeImage || ''}
            afterSrc={data.afterImage || ''}
            beforeLabel={data.beforeLabel || DEFAULT_COMPARISON_SETTINGS.beforeLabel}
            afterLabel={data.afterLabel || DEFAULT_COMPARISON_SETTINGS.afterLabel}
            aspectRatio="16/9"
          />
        </div>

        <div className="lg:col-span-4 border border-white/[0.12] rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              {data.cardBadge || DEFAULT_COMPARISON_SETTINGS.cardBadge}
            </span>
            <span className="text-[10px] font-mono text-white/50">
              {data.cardTag || DEFAULT_COMPARISON_SETTINGS.cardTag}
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm font-sans text-white/75 leading-relaxed">
            {descriptionParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="pt-4 border-t border-white/[0.08] space-y-2.5 text-xs font-mono text-white/70">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
