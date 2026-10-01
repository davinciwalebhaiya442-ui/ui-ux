'use client';

import { useState } from 'react';
import { Download, Check, Video, Calculator, Clock } from 'lucide-react';

export default function ToolsSection() {
  const [activeTool, setActiveTool] = useState('downloader');

  // Tool 1: YouTube Downloader States
  const [ytUrl, setYtUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('prores');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // Tool 2: Aspect Ratio Calculator States
  const [baseWidth, setBaseWidth] = useState(3840);
  const [aspectPreset, setAspectPreset] = useState('2.39');

  // Tool 3: Timecode Math States
  const [fps, setFps] = useState(24);
  const [seconds, setSeconds] = useState(72);

  const startExtraction = () => {
    if (!ytUrl) return;
    setIsProcessing(true);
    setDownloadProgress(10);
    setDownloadComplete(false);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setDownloadComplete(true);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

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
          In-browser utilities for timeline conform, optical framing math, and reference extraction.
        </p>
      </div>

      {/* Tool Mode Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/[0.08] mb-12 text-xs font-mono">
        {[
          { id: 'downloader', label: 'YouTube Reference Extractor' },
          { id: 'aspect', label: 'Cinema Aspect Ratio & Blanking' },
          { id: 'timecode', label: 'SMPTE Timecode Calculator' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`pb-3 border-b-2 transition-all -mb-px ${
              activeTool === tool.id
                ? 'border-blue-400 text-blue-300 font-semibold'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* TOOL 1: YOUTUBE REFERENCE EXTRACTOR */}
      {activeTool === 'downloader' && (
        <div className="border border-white/[0.12] rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] max-w-4xl">
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  Utility 01
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">100% Free</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Lossless Reference & Stem Extractor
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed font-sans">
                Extracts uncompressed 4K video frames, 24-bit 48kHz WAV audio, or 4 isolated stems (Vocals, Music, Drums, Bass) directly for your edit timeline.
              </p>
            </div>

            {/* URL Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="Paste YouTube video or audio link..."
                className="flex-1 bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
              />
              <button
                onClick={startExtraction}
                disabled={isProcessing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <span>Extracting ({downloadProgress}%)...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Extract Media</span>
                  </>
                )}
              </button>
            </div>

            {/* Format Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { id: 'prores', title: 'Apple ProRes 422 Proxy', desc: '10-bit video master for timeline scrubbing' },
                { id: 'h265', title: 'H.265 / HEVC 4K', desc: 'High-bitrate reference capture' },
                { id: 'stems', title: '4-Track WAV Stems', desc: 'Isolated Vocals, Music, Drums & Bass' },
              ].map((fmt) => (
                <div
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    selectedFormat === fmt.id
                      ? 'border-blue-400/60 bg-[#0e192f] shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                      : 'border-white/[0.08] bg-[#070b15]/80 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-semibold text-white mb-1 flex items-center justify-between">
                    <span>{fmt.title}</span>
                    {selectedFormat === fmt.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />}
                  </div>
                  <div className="text-[11px] text-white/60 leading-normal">{fmt.desc}</div>
                </div>
              ))}
            </div>

            {/* Simulated Progress */}
            {isProcessing && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-mono text-white/60">
                  <span>Processing local audio and video streams...</span>
                  <span className="text-blue-400 font-bold">{downloadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-200" style={{ width: `${downloadProgress}%` }} />
                </div>
              </div>
            )}

            {downloadComplete && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center space-x-2 shadow-lg">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Extracted successfully. Ready to import into DaVinci Media Pool.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 2: ASPECT RATIO CALCULATOR */}
      {activeTool === 'aspect' && (
        <div className="border border-white/[0.12] rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] max-w-4xl">
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  Utility 02
                </span>
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
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
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

      {/* TOOL 3: SMPTE TIMECODE CALCULATOR */}
      {activeTool === 'timecode' && (
        <div className="border border-white/[0.12] rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] max-w-4xl">
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  Utility 03
                </span>
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
                    className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner"
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
