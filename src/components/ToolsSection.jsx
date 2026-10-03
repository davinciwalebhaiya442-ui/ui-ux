'use client';

import { useState } from 'react';
import ExportSettingsFinder from '@/components/ExportSettingsFinder';
import MediaDownloader from '@/components/MediaDownloader';

export default function ToolsSection() {
  const [activeTool, setActiveTool] = useState('export-settings');

  // Tool 2: Aspect Ratio Calculator States
  const [baseWidth, setBaseWidth] = useState(3840);
  const [aspectPreset, setAspectPreset] = useState('2.39');

  // Tool 3: Timecode Math States
  const [fps, setFps] = useState(24);
  const [seconds, setSeconds] = useState(72);

  const calculatedHeight = Math.round(baseWidth / parseFloat(aspectPreset));
  const totalFrames = Math.round(seconds * fps);
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const timecodeString = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:00`;

  return (
    <section id="tools" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 gap-6 pb-8 border-b border-white/[0.08]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-2">
            03 / Editorial Utilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Technical Workspace
          </h2>
        </div>
        <p className="max-w-md text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
          In-browser utilities for export settings, YouTube & Instagram video reference extraction, optical framing math, and timeline conform.
        </p>
      </div>

      {/* Tool Mode Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/[0.08] mb-12 text-xs font-mono overflow-x-auto scrollbar-none pb-0.5">
        {[
          { id: 'export-settings', label: 'Best Export Settings Finder' },
          { id: 'downloader', label: 'YouTube & Instagram Downloader' },
          { id: 'aspect', label: 'Cinema Aspect Ratio & Blanking' },
          { id: 'timecode', label: 'SMPTE Timecode Calculator' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`pb-3 border-b-2 transition-all -mb-px whitespace-nowrap cursor-pointer ${
              activeTool === tool.id
                ? 'border-blue-400 text-blue-300 font-semibold'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* TOOL 01: BEST EXPORT SETTINGS FINDER */}
      {activeTool === 'export-settings' && (
        <ExportSettingsFinder />
      )}

      {/* TOOL 02: YOUTUBE & INSTAGRAM REFERENCE DOWNLOADER */}
      {activeTool === 'downloader' && (
        <MediaDownloader />
      )}

      {/* TOOL 03: ASPECT RATIO CALCULATOR */}
      {activeTool === 'aspect' && (
        <div className="border border-white/[0.12] rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] max-w-4xl">
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  Utility 03
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">100% Free</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Cinematic Aspect Ratio & Blanking
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed font-sans">
                Calculate pixel heights, output blanking mattes, and letterboxing for theatrical DCI and web deliverables.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                    Timeline Base Width (Pixels)
                  </label>
                  <input
                    type="number"
                    value={baseWidth}
                    onChange={(e) => setBaseWidth(Number(e.target.value))}
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                    Aspect Ratio Preset
                  </label>
                  <select
                    value={aspectPreset}
                    onChange={(e) => setAspectPreset(e.target.value)}
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner cursor-pointer"
                  >
                    <option value="2.39">2.39:1 — Theatrical CinemaScope</option>
                    <option value="1.85">1.85:1 — DCI Flat Standard</option>
                    <option value="1.777">16:9 (1.78:1) — Standard UHD Broadcast</option>
                    <option value="1.333">4:3 (1.33:1) — Academy Standard</option>
                    <option value="0.5625">9:16 (0.56:1) — Vertical Mobile Delivery</option>
                  </select>
                </div>
              </div>

              {/* Output Display */}
              <div className="p-6 rounded-xl bg-[#070b15] border border-white/[0.1] flex flex-col justify-between shadow-inner">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold">
                  Calculated Output Matte
                </span>
                <div className="my-4">
                  <div className="text-3xl font-bold font-mono text-white">
                    {baseWidth} &times; {calculatedHeight}
                  </div>
                  <div className="text-xs font-mono text-white/60 mt-1">
                    Aspect Ratio: {aspectPreset}:1
                  </div>
                </div>
                <div className="text-[10px] font-mono text-white/50 pt-3 border-t border-white/[0.08]">
                  Top/Bottom Letterbox: {Math.max(0, Math.round((2160 - calculatedHeight) / 2))}px per edge on 2160p timeline
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 04: SMPTE TIMECODE CALCULATOR */}
      {activeTool === 'timecode' && (
        <div className="border border-white/[0.12] rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] max-w-4xl">
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  Utility 04
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">100% Free</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                SMPTE Frame Rate & Duration Math
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed font-sans">
                Translate runtime durations into exact frame numbers across cinema standard frame rates without rounding drift.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                    Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    value={seconds}
                    onChange={(e) => setSeconds(Number(e.target.value))}
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1.5 font-semibold">
                    Project Timebase (FPS)
                  </label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner cursor-pointer"
                  >
                    <option value={24}>24.000 fps — Standard Theatrical Cinema</option>
                    <option value={23.976}>23.976 fps — NTSC Film Standard</option>
                    <option value={25}>25.000 fps — PAL Broadcast Standard</option>
                    <option value={29.97}>29.970 fps — NTSC Broadcast</option>
                    <option value={60}>60.000 fps — High Frame Rate</option>
                  </select>
                </div>
              </div>

              {/* Output Display */}
              <div className="p-6 rounded-xl bg-[#070b15] border border-white/[0.1] flex flex-col justify-between shadow-inner">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold">
                  SMPTE Timecode String
                </span>
                <div className="my-4">
                  <div className="text-3xl font-bold font-mono text-white">
                    {timecodeString}
                  </div>
                  <div className="text-xs font-mono text-white/60 mt-1">
                    Absolute Frames: {totalFrames.toLocaleString()} frames
                  </div>
                </div>
                <div className="text-[10px] font-mono text-white/50 pt-3 border-t border-white/[0.08]">
                  Format: Non-Drop Frame (NDF)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
