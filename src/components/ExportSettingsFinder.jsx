'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DATA_CONFIG,
  calculateBitrate,
  getOutputResolution,
  getActiveWarnings,
  getEditorSettings,
  formatFullExportSummary,
} from '@/data/exportSettingsConfig';
import {
  Copy,
  Check,
  Sliders,
  Film,
  Layers,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  Monitor,
  Volume2,
  ShieldAlert,
  Zap,
} from 'lucide-react';

const STORAGE_KEY = 'dwb_export_settings_v1';

const DEFAULT_STATE = {
  platformId: 'instagram-reels',
  resolutionId: '1080p',
  fps: 30,
  priorityId: 'balanced',
  editorId: 'davinci',
  youtube4kBoost: false,
};

export default function ExportSettingsFinder() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Core state with local storage hydration
  const [state, setState] = useState(DEFAULT_STATE);

  // Load from localStorage on mount safely
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          platformId: parsed.platformId || prev.platformId,
          resolutionId: parsed.resolutionId || prev.resolutionId,
          fps: typeof parsed.fps === 'number' ? parsed.fps : prev.fps,
          priorityId: parsed.priorityId || prev.priorityId,
          editorId: parsed.editorId || prev.editorId,
          youtube4kBoost: Boolean(parsed.youtube4kBoost),
        }));
      }
    } catch {
      // LocalStorage unavailable, fallback cleanly
    }
  }, []);

  // Save to localStorage on change safely
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // LocalStorage unavailable, do nothing
    }
  }, [state, mounted]);

  const updateState = useCallback((key, value) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Active configuration derived objects
  const activePlatform = useMemo(
    () => DATA_CONFIG.platforms.find((p) => p.id === state.platformId) || DATA_CONFIG.platforms[0],
    [state.platformId]
  );

  const activeResolution = useMemo(
    () => DATA_CONFIG.resolutions.find((r) => r.id === state.resolutionId) || DATA_CONFIG.resolutions[1],
    [state.resolutionId]
  );

  const activeEditor = useMemo(
    () => DATA_CONFIG.editors.find((e) => e.id === state.editorId) || DATA_CONFIG.editors[0],
    [state.editorId]
  );

  const outputRes = useMemo(() => getOutputResolution(state), [state]);
  const bitrate = useMemo(() => calculateBitrate(state), [state]);
  const warnings = useMemo(() => getActiveWarnings(state), [state]);
  const editorConfig = useMemo(() => getEditorSettings(state), [state]);

  // YouTube 4K boost applicability
  const canShowYoutubeBoost =
    state.platformId === 'youtube-long' &&
    (state.resolutionId === '1080p' || state.resolutionId === '1440p');

  // Copy handler with feedback
  const handleCopy = useCallback(async () => {
    const summary = formatFullExportSummary(state);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  }, [state]);

  return (
    <div className="border border-white/[0.12] rounded-2xl p-5 sm:p-8 lg:p-10 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      
      {/* 01: Top Utility Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/[0.08] gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              UTILITY 01
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
              100% Free
            </span>
            <span className="text-[10px] font-mono text-white/40 hidden sm:inline-block">
              &bull; Client-Side Realtime Engine
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            Best Export Settings Finder
          </h3>
          <p className="text-xs sm:text-sm text-white/70 mt-1.5 leading-relaxed font-sans max-w-2xl">
            Precision render parameters and mastering targets calculated instantly for your target platform, timeline resolution, frame rate, priority, and NLE.
          </p>
        </div>

        {/* Global Copy Button on Header for Quick Access */}
        <button
          onClick={handleCopy}
          type="button"
          className={`shrink-0 self-start sm:self-center px-4 py-2 text-xs font-mono rounded-xl border transition-all flex items-center space-x-2 ${
            copied
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.12] text-white hover:border-white/30'
          }`}
          aria-label="Copy Generated Settings"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-white/60" />
              <span>Copy Settings</span>
            </>
          )}
        </button>
      </div>

      {/* 02: Compact Two-Column Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Input Selectors (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 pb-2 border-b border-white/[0.06]">
            <Sliders className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-semibold">Render Configuration</span>
          </div>

          {/* 1. Target Platform */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1.5 font-semibold">
              1. Delivery Platform
            </label>
            <select
              value={state.platformId}
              onChange={(e) => updateState('platformId', e.target.value)}
              className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all cursor-pointer"
            >
              {DATA_CONFIG.platforms.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0b101c] text-white">
                  {p.name} ({p.badge})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-white/40 mt-1 font-mono">
              {activePlatform.description}
            </p>
          </div>

          {/* 2. Timeline Resolution */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1.5 font-semibold">
              2. Timeline Resolution
            </label>
            <select
              value={state.resolutionId}
              onChange={(e) => updateState('resolutionId', e.target.value)}
              className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all cursor-pointer"
            >
              {DATA_CONFIG.resolutions.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#0b101c] text-white">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Frame Rate */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1.5 font-semibold">
              3. Frame Rate (FPS)
            </label>
            <select
              value={state.fps}
              onChange={(e) => updateState('fps', Number(e.target.value))}
              className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all cursor-pointer"
            >
              {DATA_CONFIG.frameRates.map((f) => (
                <option key={f.value} value={f.value} className="bg-[#0b101c] text-white">
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Priority */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1.5 font-semibold">
              4. Export Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DATA_CONFIG.priorities.map((p) => {
                const isSelected = state.priorityId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateState('priorityId', p.id)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium transition-all text-center ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-[#070b15] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Video Editor Selection */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1.5 font-semibold">
              5. Video Editor (NLE)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DATA_CONFIG.editors.map((ed) => {
                const isSelected = state.editorId === ed.id;
                return (
                  <button
                    key={ed.id}
                    type="button"
                    onClick={() => updateState('editorId', ed.id)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between text-left ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-400/70 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-[#070b15] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{ed.name}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional: YouTube 4K Upscale Boost */}
          {canShowYoutubeBoost && (
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>YouTube 4K VP9/AV1 Upscale Boost</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                    Forces YouTube to allocate its premium VP9/AV1 codec profile, minimizing artifacting in dark scenes and fast motion.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={state.youtube4kBoost}
                    onChange={(e) => updateState('youtube4kBoost', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {state.youtube4kBoost && (
                <div className="pt-2 border-t border-blue-500/20 text-[10px] font-mono text-amber-300/90 flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Upscaling does not add real detail. Expect larger files and longer export/upload times.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Summary Pill Bar */}
          <div className="p-3.5 rounded-xl bg-[#070b15]/90 border border-white/[0.08] text-[11px] font-mono text-white/50 space-y-1">
            <div className="flex justify-between">
              <span>Raster Output:</span>
              <span className="text-white font-semibold">{outputRes.width} &times; {outputRes.height}</span>
            </div>
            <div className="flex justify-between">
              <span>Target Bitrate:</span>
              <span className="text-blue-300 font-semibold">{bitrate.display}</span>
            </div>
            <div className="flex justify-between">
              <span>Calculated GOP:</span>
              <span className="text-white font-semibold">{Math.round(state.fps * 2)} frames (Closed)</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Generated Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Output Header with Copy Button */}
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center space-x-2 text-xs font-mono text-blue-400">
              <Film className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider font-semibold">Generated Specifications</span>
            </div>
            <button
              onClick={handleCopy}
              type="button"
              className="text-xs font-mono text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* PART 1 — GENERAL PLATFORM SPECIFICATIONS */}
          <div className="p-5 rounded-xl bg-[#070b15] border border-white/[0.1] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-semibold">
                Part 1 &bull; Platform Delivery Specs
              </span>
              <span className="text-[10px] font-mono text-blue-400 px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800/40">
                {activePlatform.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05]">
                <div className="text-[10px] font-mono text-white/40">Export Resolution</div>
                <div className="text-xs font-mono font-semibold text-white mt-0.5">
                  {outputRes.width} &times; {outputRes.height}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05]">
                <div className="text-[10px] font-mono text-white/40">Aspect Ratio</div>
                <div className="text-xs font-mono font-semibold text-white mt-0.5">
                  {outputRes.aspectRatio}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05]">
                <div className="text-[10px] font-mono text-white/40">Frame Rate</div>
                <div className="text-xs font-mono font-semibold text-white mt-0.5">
                  {state.fps} fps
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05]">
                <div className="text-[10px] font-mono text-white/40">Target Bitrate</div>
                <div className="text-xs font-mono font-semibold text-emerald-300 mt-0.5">
                  {bitrate.mbps} Mbps
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05]">
                <div className="text-[10px] font-mono text-white/40">Container</div>
                <div className="text-xs font-mono font-semibold text-white mt-0.5">
                  {activePlatform.container}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05]">
                <div className="text-[10px] font-mono text-white/40">Recommended Codec</div>
                <div className="text-xs font-mono font-semibold text-white mt-0.5 truncate">
                  {activePlatform.codec.split('/')[0]}
                </div>
              </div>
            </div>

            {/* Audio specifications */}
            <div className="p-3 rounded-lg bg-black/30 border border-white/[0.05] flex items-center gap-2.5 text-xs font-mono text-white/70">
              <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span><strong className="text-white">Audio:</strong> {activePlatform.audio}</span>
            </div>

            {/* Safe zones & platform notes */}
            <div className="space-y-2 text-xs font-sans text-white/70 pt-1">
              <div className="p-3 rounded-lg bg-black/20 border border-white/[0.04]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-blue-300 font-semibold block mb-0.5">
                  Safe Zones Guidance
                </span>
                <p className="text-[11px] leading-relaxed text-white/60">{activePlatform.safeZones}</p>
              </div>

              <div className="p-3 rounded-lg bg-black/20 border border-white/[0.04]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 font-semibold block mb-0.5">
                  Platform Delivery Notes
                </span>
                <p className="text-[11px] leading-relaxed text-white/60">{activePlatform.notes}</p>
              </div>
            </div>
          </div>

          {/* PART 2 — EXACT EDITOR EXPORT SETTINGS */}
          {editorConfig && (
            <div className="p-5 rounded-xl bg-[#070b15] border border-white/[0.1] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-semibold">
                    Part 2 &bull; Exact NLE Setup
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
                    <span>{editorConfig.editor}</span>
                    <span className="text-[10px] font-mono font-normal text-white/40">({editorConfig.pageRef})</span>
                  </h4>
                </div>
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              </div>

              {/* Primary Settings Table */}
              <div className="divide-y divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden text-xs font-mono">
                {editorConfig.settings.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-black/30 hover:bg-black/50 transition-colors gap-1">
                    <span className="text-white/50">{item.label}</span>
                    <span className="text-white font-medium text-right sm:max-w-xs truncate">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* DaVinci Advanced Settings */}
              {editorConfig.advanced && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300/80 font-semibold block">
                    Advanced Color & Quality Parameters:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    {editorConfig.advanced.map((adv, idx) => (
                      <div key={idx} className="p-2 rounded bg-black/40 border border-white/[0.04] flex items-center justify-between">
                        <span className="text-white/50">{adv.label}:</span>
                        <span className="text-white font-medium ml-2">{adv.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Premiere Scaling & Render Quality Guidance */}
              {editorConfig.scalingGuidance && (
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/20 text-xs font-sans text-blue-200 space-y-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider font-semibold text-blue-300">
                    Important Premiere Scaling Rule:
                  </div>
                  <p className="text-[11px] leading-relaxed">{editorConfig.scalingGuidance}</p>
                  <p className="text-[11px] leading-relaxed font-mono text-white/60">{editorConfig.renderQuality}</p>
                </div>
              )}

              {/* Final Cut Pro Notice */}
              {editorConfig.compressorNotice && (
                <div className="p-3 rounded-lg bg-black/30 border border-white/[0.08] text-xs font-sans text-white/70 space-y-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider font-semibold text-white/40">
                    Final Cut Pro Bitrate Architecture:
                  </div>
                  <p className="text-[11px] leading-relaxed">{editorConfig.compressorNotice}</p>
                </div>
              )}

              {/* CapCut Notice */}
              {editorConfig.capcutNotice && (
                <div className="p-3 rounded-lg bg-black/30 border border-white/[0.08] text-xs font-sans text-white/70 space-y-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider font-semibold text-white/40">
                    CapCut Desktop Stepped Bitrate:
                  </div>
                  <p className="text-[11px] leading-relaxed">{editorConfig.capcutNotice}</p>
                </div>
              )}

              {/* Vertical Resolution Guidance */}
              {editorConfig.verticalGuidance && (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs font-sans text-emerald-200">
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-emerald-300 block mb-0.5">
                    Vertical Timeline Setup:
                  </span>
                  <p className="text-[11px] leading-relaxed">{editorConfig.verticalGuidance}</p>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE WARNINGS & NOTICES */}
          {warnings.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-1.5 text-xs font-mono text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider font-semibold">Quality & Delivery Warnings</span>
              </div>
              {warnings.map((w) => (
                <div
                  key={w.id}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                    w.severity === 'error'
                      ? 'bg-red-950/30 border-red-500/40 text-red-200'
                      : w.severity === 'caution'
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-blue-950/30 border-blue-500/30 text-blue-200'
                  }`}
                >
                  <div className="font-mono text-[11px] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{w.title}</span>
                  </div>
                  <p className="text-[11px] opacity-85">{w.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Specifications Verification Line */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-white/40 gap-2">
            <span>Specs last verified: {DATA_CONFIG.lastVerified}</span>
            <span className="text-white/30">DavinciWaleBhaiya &bull; Color & Video Standards</span>
          </div>

        </div>

      </div>

    </div>
  );
}
