'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Download,
  Check,
  Video,
  Music,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Layers,
  Film,
  RefreshCw,
  Play,
  Share2,
} from 'lucide-react';

export default function MediaDownloader() {
  const [url, setUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('mp4-hd');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Real-time platform detection as user types
  const detectedPlatform = useMemo(() => {
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/(?:youtu\.be\/|youtube\.com)/i.test(trimmed)) {
      return {
        type: 'youtube',
        name: 'YouTube',
        color: 'text-red-400 bg-red-500/10 border-red-500/20',
        badge: 'YouTube Video & Shorts',
      };
    }
    if (/instagram\.com/i.test(trimmed)) {
      return {
        type: 'instagram',
        name: 'Instagram',
        color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
        badge: 'Instagram Reel & Post',
      };
    }
    return null;
  }, [url]);

  // Trigger download action
  const handleDownload = useCallback((format) => {
    if (!format || !format.downloadUrl) return;

    setDownloadSuccess(true);

    if (format.isDirect) {
      const streamUrl = `/api/tools/download-stream?url=${encodeURIComponent(
        format.downloadUrl
      )}&filename=${encodeURIComponent(format.filename || 'davinci_video.mp4')}`;

      const link = document.createElement('a');
      link.href = streamUrl;
      link.setAttribute('download', format.filename || 'davinci_video.mp4');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(format.downloadUrl, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => setDownloadSuccess(false), 8000);
  }, []);

  // Handle Extraction & Direct Download Trigger
  const handleExtract = useCallback(
    async (e) => {
      e?.preventDefault();
      const targetUrl = url.trim();
      if (!targetUrl) {
        setError('Please enter a YouTube video or Instagram reel link.');
        return;
      }

      setError('');
      setIsProcessing(true);
      setProgress(20);
      setResult(null);
      setDownloadSuccess(false);

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      try {
        const response = await fetch('/api/tools/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        });

        const data = await response.json();
        clearInterval(progressInterval);
        setProgress(100);

        if (!response.ok || data.error) {
          throw new Error(
            data.error || 'Failed to extract video. Please ensure the link is public.'
          );
        }

        setResult(data);
        setIsProcessing(false);

        // Auto trigger primary direct download if available
        const primaryDirect = data.formats?.find((f) => f.isDirect);
        if (primaryDirect) {
          handleDownload(primaryDirect);
        }
      } catch (err) {
        clearInterval(progressInterval);
        setIsProcessing(false);
        setError(
          err.message ||
            'Could not extract media. Please verify the URL and ensure the video is public.'
        );
      }
    },
    [url, handleDownload]
  );

  // Direct paste helper
  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          setError('');
        }
      }
    } catch {
      // Clipboard permission denied
    }
  };

  return (
    <div className="border border-white/[0.12] rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-[#0d1424]/95 via-[#090e1a]/95 to-[#060a12]/95 shadow-[0_12px_32px_rgba(0,0,0,0.45)] max-w-4xl">
      <div className="space-y-6">
        
        {/* Header Badges & Titles */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              Utility 02
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
              100% Free
            </span>
            {detectedPlatform && (
              <span
                className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded border animate-in fade-in ${detectedPlatform.color}`}
              >
                {detectedPlatform.badge} Detected
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
            Universal Video & Reference Downloader
          </h3>
          <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed font-sans max-w-2xl">
            Download high-resolution video streams from <strong className="text-white">YouTube</strong> (4K, Standard, Shorts) and <strong className="text-white">Instagram</strong> (Reels, Posts) directly for your edit timeline.
          </p>
        </div>

        {/* Input & Action Form */}
        <form onSubmit={handleExtract} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Paste YouTube or Instagram link (e.g. youtube.com/watch?v=... or instagram.com/reel/...)"
                className="w-full bg-[#070b15] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-inner pr-20"
              />
              {!url && (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/50 hover:text-white px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
                >
                  Paste
                </button>
              )}
              {url && (
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setResult(null);
                    setError('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/40 hover:text-white px-2 py-1 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing || !url.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching Stream ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Fetch & Download Video</span>
                </>
              )}
            </button>
          </div>

          {/* Inline Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-mono text-white/60">
              <span>Resolving video streams & audio stems...</span>
              <span className="text-blue-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Format Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            {
              id: 'mp4-hd',
              title: 'Full HD 1080p Video',
              desc: 'Original resolution video with sync stereo audio for grading',
              badge: 'Visual Master',
            },
            {
              id: 'prores',
              title: 'Apple ProRes Proxy',
              desc: 'High-speed edit proxy reference for smooth scrubbing',
              badge: 'Timeline Proxy',
            },
            {
              id: 'audio-stems',
              title: '48kHz Audio Stems',
              desc: 'High-bitrate isolated audio track (320kbps MP3 / WAV)',
              badge: 'Audio Track',
            },
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
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400">
                  {fmt.badge}
                </span>
                {selectedFormat === fmt.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
                )}
              </div>
              <div className="text-xs font-semibold text-white mb-1">{fmt.title}</div>
              <div className="text-[11px] text-white/60 leading-normal">{fmt.desc}</div>
            </div>
          ))}
        </div>

        {/* EXTRACTION RESULT PANEL */}
        {result && (
          <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-[#070b15] border border-blue-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-5 animate-in fade-in duration-300">
            
            {/* Video Header & Metadata Preview */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-white/[0.08]">
              {result.thumbnail && (
                <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0 shadow-md">
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white/90 drop-shadow" />
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
                    {result.platformLabel}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">
                    ID: {result.id}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
                  {result.title}
                </h4>
                <p className="text-xs text-white/50 font-mono">
                  Channel / Creator: <span className="text-white/80">{result.author}</span>
                </p>
              </div>
            </div>

            {/* Available Download Streams */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-semibold block">
                Select Rendered Deliverable:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.formats?.map((fmt) => (
                  <div
                    key={fmt.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] hover:border-blue-400/40 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                          {fmt.label}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                          {fmt.ext}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 leading-normal">
                        {fmt.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
                      <button
                        type="button"
                        onClick={() => handleDownload(fmt)}
                        className={`flex-1 py-2.5 px-3.5 text-xs font-semibold rounded-lg shadow transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                          fmt.isDirect
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{fmt.isDirect ? `Direct Download ${fmt.ext}` : `Open Download Mirror`}</span>
                      </button>

                      {fmt.directEngine && (
                        <a
                          href={fmt.directEngine}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Instant high-speed mirror"
                          className="p-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Instant Download Trigger Notification */}
            {downloadSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs font-mono text-emerald-200 flex items-center space-x-2.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold">Download Triggered!</span> The video file is being downloaded directly to your computer.
                </div>
              </div>
            )}

            {/* Timeline Import Note */}
            <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-white/40 flex items-center justify-between">
              <span>Import directly into DaVinci Resolve or Premiere Pro timeline</span>
              <span className="text-blue-400">100% Lossless Sync</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
