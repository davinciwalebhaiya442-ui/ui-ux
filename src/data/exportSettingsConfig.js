/**
 * Centralized Configuration for Best Export Settings Finder
 * DavinciWaleBhaiya — Professional Technical Workspace
 */

export const DATA_CONFIG = {
  version: '2026.10',
  lastVerified: '03 Oct 2026',

  platforms: [
    {
      id: 'instagram-reels',
      name: 'Instagram Reels',
      badge: '1080x1920',
      description: 'Vertical 9:16 short-form feed and reels deliverable for Instagram mobile.',
      aspectRatio: '9:16',
      isVertical: true,
      maxFps: 60,
      recommendedFps: 30,
      targetResolution: { width: 1080, height: 1920, label: '1080 × 1920 (9:16 Vertical)' },
      container: 'MP4',
      codec: 'H.264 (AVC) / HEVC (H.265)',
      audio: 'AAC Stereo, 48000 Hz, 320 kbps',
      safeZones: 'Top 220px (account handle) & Bottom 380px (caption, sound, engagement icons) — keep critical typography within center 1080×1320 area.',
      notes: 'Instagram mobile compresses any video over 1080p aggressively on upload. Never upload 4K vertical; export strictly at native 1080×1920 for maximum sharpness.',
      bitrates: {
        '720p': { max: 15, balanced: 10, small: 7 },
        '1080p': { max: 22, balanced: 16, small: 10 },
        '1440p': { max: 22, balanced: 16, small: 10 },
        '4k': { max: 22, balanced: 16, small: 10 },
        '6k-8k': { max: 22, balanced: 16, small: 10 },
      },
    },
    {
      id: 'youtube-long',
      name: 'YouTube Long-form',
      badge: 'Native / 16:9',
      description: 'Standard widescreen horizontal video for YouTube desktop, TV, and mobile.',
      aspectRatio: '16:9',
      isVertical: false,
      maxFps: 60,
      supports4kBoost: true,
      container: 'MP4 or MOV',
      codec: 'H.264 / H.265 (HEVC) / Apple ProRes 422 (for master archives)',
      audio: 'AAC Stereo, 48000 Hz, 320-384 kbps (or 5.1 Surround 512 kbps)',
      safeZones: 'SMPTE Action Safe (5% margin) and Title Safe (10% margin). Watch bottom scrub timeline and right watermark.',
      notes: "YouTube transcodes every upload. 1440p and 4K uploads automatically receive YouTube's premium VP9/AV1 codec profile, which prevents macroblocking in shadows and motion scenes.",
      bitrates: {
        '720p': { max: 12, balanced: 8, small: 5 },
        '1080p': { max: 24, balanced: 16, small: 10 },
        '1440p': { max: 38, balanced: 26, small: 18 },
        '4k': { max: 68, balanced: 48, small: 30 },
        '6k-8k': { max: 75, balanced: 52, small: 32 },
      },
    },
    {
      id: 'youtube-shorts',
      name: 'YouTube Shorts',
      badge: '1080x1920',
      description: 'Vertical 9:16 short-form under 60 seconds with 60fps high-frame-rate support.',
      aspectRatio: '9:16',
      isVertical: true,
      maxFps: 60,
      targetResolution: { width: 1080, height: 1920, label: '1080 × 1920 (9:16 Vertical)' },
      container: 'MP4',
      codec: 'H.264 / H.265 (HEVC)',
      audio: 'AAC Stereo, 48000 Hz, 320 kbps',
      safeZones: 'Bottom 280px covered by title, channel info, and subscribe pill; right 120px covered by interaction icons. Keep focal graphics inside 1080×1420 box.',
      notes: 'YouTube Shorts transcodes high-bitrate uploads smoothly up to 60fps. H.264 or HEVC at ~20-25 Mbps provides pristine mobile playback.',
      bitrates: {
        '720p': { max: 14, balanced: 10, small: 7 },
        '1080p': { max: 24, balanced: 18, small: 12 },
        '1440p': { max: 24, balanced: 18, small: 12 },
        '4k': { max: 24, balanced: 18, small: 12 },
        '6k-8k': { max: 24, balanced: 18, small: 12 },
      },
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      badge: '1080x1920',
      description: 'Vertical mobile short-form video for TikTok Android, iOS, and Web clients.',
      aspectRatio: '9:16',
      isVertical: true,
      maxFps: 60,
      targetResolution: { width: 1080, height: 1920, label: '1080 × 1920 (9:16 Vertical)' },
      container: 'MP4',
      codec: 'H.264',
      audio: 'AAC Stereo, 48000 Hz, 320 kbps',
      safeZones: 'Top 150px (status bar), Bottom 320px (account handle, caption, song disc), and Right 140px (like/comment/share icons). Keep key elements in 1080×1260 safe canvas.',
      notes: 'TikTok restricts in-app file size to ~287.6 MB on iOS and 72 MB on Android Web. Standard H.264 encoding prevents color shifts and playback stutter.',
      bitrates: {
        '720p': { max: 12, balanced: 9, small: 6 },
        '1080p': { max: 20, balanced: 15, small: 9 },
        '1440p': { max: 20, balanced: 15, small: 9 },
        '4k': { max: 20, balanced: 15, small: 9 },
        '6k-8k': { max: 20, balanced: 15, small: 9 },
      },
    },
    {
      id: 'facebook',
      name: 'Facebook',
      badge: '1080p / Feed',
      description: 'Facebook timeline, newsfeed, and video reels with CFR stability.',
      aspectRatio: '16:9 / 1:1 / 4:5 / 9:16',
      isVertical: false,
      maxFps: 60,
      container: 'MP4',
      codec: 'H.264 (High Profile)',
      audio: 'AAC Stereo, 48000 Hz, 256-320 kbps',
      safeZones: '10% Title safe margin. In mobile feed, 16:9 is letterboxed; 4:5 and 1:1 occupy significantly more screen height without tap-through.',
      notes: 'Facebook rejects Variable Frame Rate (VFR) and compresses files > 4GB heavily. Constant Frame Rate (CFR) and closed GOP (Keyframes = 2x FPS) are strictly required.',
      bitrates: {
        '720p': { max: 10, balanced: 7, small: 4 },
        '1080p': { max: 18, balanced: 12, small: 8 },
        '1440p': { max: 25, balanced: 18, small: 12 },
        '4k': { max: 40, balanced: 28, small: 18 },
        '6k-8k': { max: 42, balanced: 30, small: 20 },
      },
    },
    {
      id: 'vimeo',
      name: 'Vimeo',
      badge: 'Native',
      description: 'High-fidelity cinematic master hosting for client reviews, portfolios, and OTT embeds.',
      aspectRatio: 'Native (matches timeline)',
      isVertical: false,
      maxFps: 60,
      container: 'MP4 or QuickTime MOV',
      codec: 'H.264 / H.265 / Apple ProRes 422 HQ',
      audio: 'AAC 320 kbps or Linear PCM 24-bit 48kHz Uncompressed',
      safeZones: 'Clean frame in embedded mode; standard SMPTE 5% action safe for web chrome.',
      notes: 'Vimeo retains the highest visual fidelity among streaming sites and preserves Rec.709 color tags accurately without shifting gamma on macOS browsers.',
      bitrates: {
        '720p': { max: 16, balanced: 12, small: 8 },
        '1080p': { max: 30, balanced: 20, small: 12 },
        '1440p': { max: 48, balanced: 32, small: 20 },
        '4k': { max: 75, balanced: 45, small: 25 },
        '6k-8k': { max: 85, balanced: 55, small: 30 },
      },
    },
    {
      id: 'whatsapp-status',
      name: 'WhatsApp Status',
      badge: '1080x1920 / 30fps cap / 16MB limit',
      description: 'Strict 16MB file limit, 30-second duration, and 30fps maximum framerate.',
      aspectRatio: '9:16',
      isVertical: true,
      maxFps: 30,
      recommendedFps: 30,
      targetResolution: { width: 1080, height: 1920, label: '1080 × 1920 (9:16 Vertical)' },
      container: 'MP4',
      codec: 'H.264 (Baseline or Main profile)',
      audio: 'AAC Stereo, 44100 / 48000 Hz, 128-192 kbps',
      safeZones: 'Top 120px and bottom 180px covered by status header and quick-reply action bar.',
      notes: 'Hard constraints: 16 MB maximum file size, 30 seconds max duration, and 30 fps cap. Videos exceeding 16MB are brutally crushed by WhatsApp servers.',
      bitrates: {
        '720p': { max: 3.5, balanced: 2.8, small: 1.8 },
        '1080p': { max: 4.2, balanced: 3.2, small: 2.2 },
        '1440p': { max: 4.2, balanced: 3.2, small: 2.2 },
        '4k': { max: 4.2, balanced: 3.2, small: 2.2 },
        '6k-8k': { max: 4.2, balanced: 3.2, small: 2.2 },
      },
      fileSizeLimitMb: 16,
    },
    {
      id: 'broadcast',
      name: 'Broadcast/TV',
      badge: 'ProRes / High-bitrate master',
      description: 'Linear broadcast deliverable (ATSC / EBU R95) and archival master files.',
      aspectRatio: '16:9',
      isVertical: false,
      maxFps: 60,
      container: 'QuickTime MOV or MXF OP1a',
      codec: 'Apple ProRes 422 HQ / Avid DNxHR HQX',
      audio: '24-bit 48kHz Linear PCM Uncompressed (Stereo or Multi-channel Split 5.1/8ch)',
      safeZones: 'EBU R95 / SMPTE RP 218 10% Title Safe (80% area) and 5% Action Safe (90% area).',
      notes: 'Requires 10-bit 4:2:2 color subsampling and strictly Video/Legal data levels (64-940 in 10-bit) to avoid clipping broadcast legal limits.',
      bitrates: {
        '720p': { max: 110, balanced: 75, small: 50 },
        '1080p': { max: 220, balanced: 147, small: 102 },
        '1440p': { max: 440, balanced: 295, small: 200 },
        '4k': { max: 880, balanced: 590, small: 410 },
        '6k-8k': { max: 920, balanced: 620, small: 430 },
      },
      isBroadcast: true,
    },
  ],

  resolutions: [
    { id: '720p', label: '720p (1280x720)', width: 1280, height: 720, vertical: { width: 720, height: 1280 } },
    { id: '1080p', label: '1080p (1920x1080)', width: 1920, height: 1080, vertical: { width: 1080, height: 1920 } },
    { id: '1440p', label: '1440p (2560x1440)', width: 2560, height: 1440, vertical: { width: 1440, height: 2560 } },
    { id: '4k', label: '4K (3840x2160)', width: 3840, height: 2160, vertical: { width: 2160, height: 3840 } },
    { id: '6k-8k', label: '6K/8K footage on 4K timeline', width: 3840, height: 2160, vertical: { width: 2160, height: 3840 }, isDownsample: true },
  ],

  frameRates: [
    { value: 23.976, label: '23.976 fps — Cinema NTSC', isHighFps: false },
    { value: 24, label: '24.000 fps — Standard Theatrical', isHighFps: false },
    { value: 25, label: '25.000 fps — PAL / Europe', isHighFps: false },
    { value: 29.97, label: '29.970 fps — NTSC Broadcast', isHighFps: false },
    { value: 30, label: '30.000 fps — Web Standard', isHighFps: false },
    { value: 50, label: '50.000 fps — PAL High Frame Rate', isHighFps: true },
    { value: 59.94, label: '59.940 fps — NTSC High Frame Rate', isHighFps: true },
    { value: 60, label: '60.000 fps — High Motion / Gaming', isHighFps: true },
  ],

  priorities: [
    { id: 'max', label: 'Max Quality', description: 'Highest bitrate targets and 2-pass encoding for optimal visual fidelity.' },
    { id: 'balanced', label: 'Balanced', description: 'Optimal sweet spot between crisp image clarity and fast export/upload times.' },
    { id: 'small', label: 'Small File Size', description: 'Reduced file sizes while retaining clean contrast without heavy blocking.' },
  ],

  editors: [
    { id: 'davinci', name: 'DaVinci Resolve', pageRef: 'Deliver Page' },
    { id: 'premiere', name: 'Premiere Pro', pageRef: 'File → Export → Media' },
    { id: 'fcp', name: 'Final Cut Pro', pageRef: 'File → Share → Export File → Settings' },
    { id: 'capcut', name: 'CapCut', pageRef: 'Export Panel' },
  ],
};

/**
 * Calculates adjusted bitrate based on platform, resolution, fps, priority, and 4k boost.
 */
export function calculateBitrate(state) {
  const { platformId, resolutionId, fps, priorityId, youtube4kBoost } = state;
  const platform = DATA_CONFIG.platforms.find((p) => p.id === platformId) || DATA_CONFIG.platforms[0];

  let effectiveResId = resolutionId;
  if (platform.supports4kBoost && youtube4kBoost && (resolutionId === '1080p' || resolutionId === '1440p')) {
    effectiveResId = '4k';
  }

  const resBitrates = platform.bitrates[effectiveResId] || platform.bitrates['1080p'];
  let baseMbps = resBitrates[priorityId] || resBitrates.balanced;

  // Frame rate adjustment: 50/59.94/60 fps has ~25% more temporal information
  const isHighFps = fps >= 50;
  if (isHighFps && !platform.isBroadcast && platform.id !== 'whatsapp-status') {
    baseMbps = Math.round(baseMbps * 1.25);
  }

  const kbps = Math.round(baseMbps * 1000);
  return {
    mbps: baseMbps,
    kbps,
    display: `${baseMbps} Mbps (${kbps.toLocaleString()} Kb/s)`,
  };
}

/**
 * Derives target output resolution based on platform and state.
 */
export function getOutputResolution(state) {
  const { platformId, resolutionId, youtube4kBoost } = state;
  const platform = DATA_CONFIG.platforms.find((p) => p.id === platformId) || DATA_CONFIG.platforms[0];
  const res = DATA_CONFIG.resolutions.find((r) => r.id === resolutionId) || DATA_CONFIG.resolutions[1];

  if (platform.supports4kBoost && youtube4kBoost && (resolutionId === '1080p' || resolutionId === '1440p')) {
    return {
      width: 3840,
      height: 2160,
      label: '3840 × 2160 (4K UHD Upscaled)',
      aspectRatio: '16:9',
      isUpscaled4k: true,
    };
  }

  if (platform.isVertical) {
    return {
      width: 1080,
      height: 1920,
      label: '1080 × 1920 (9:16 Vertical)',
      aspectRatio: '9:16',
      isVertical: true,
    };
  }

  return {
    width: res.width,
    height: res.height,
    label: `${res.width} × ${res.height} (${res.label.split(' ')[0]})`,
    aspectRatio: platform.aspectRatio || '16:9',
    isVertical: false,
  };
}

/**
 * Generates conditional warnings based on active configuration.
 */
export function getActiveWarnings(state) {
  const { platformId, resolutionId, fps, youtube4kBoost, priorityId } = state;
  const platform = DATA_CONFIG.platforms.find((p) => p.id === platformId);
  const warnings = [];

  // 1. YouTube 4K boost warning
  if (platform?.supports4kBoost && youtube4kBoost && (resolutionId === '1080p' || resolutionId === '1440p')) {
    warnings.push({
      id: 'yt-boost-warning',
      severity: 'warning',
      title: 'Increased Render & Upload Time',
      message: 'Export raster size is 3840×2160. Render time and upload payload will increase significantly.',
    });
  }

  // 2. 4K downscale penalty on vertical platforms
  if (platform?.isVertical && (resolutionId === '4k' || resolutionId === '6k-8k' || resolutionId === '1440p')) {
    warnings.push({
      id: 'vertical-4k-penalty',
      severity: 'caution',
      title: '4K Downscale Penalty on Mobile Platforms',
      message: `${platform.name} mobile engines downsample uploaded 4K files with aggressive bicubic filtering, causing blurriness. Exporting at exact native 1080×1920 gives sharper final quality.`,
    });
  }

  // 3. WhatsApp 16MB file limit
  if (platformId === 'whatsapp-status') {
    warnings.push({
      id: 'whatsapp-size-cap',
      severity: 'caution',
      title: 'WhatsApp 16 MB Hard Limit',
      message: 'WhatsApp Status videos must remain under 16 MB. At the calculated bitrate, keep total clip duration under 30-35 seconds to avoid server-side recompression artifacts.',
    });
  }

  // 4. WhatsApp 30fps limit
  if (platformId === 'whatsapp-status' && fps > 30) {
    warnings.push({
      id: 'whatsapp-fps-cap',
      severity: 'error',
      title: 'WhatsApp 30 FPS Cap Exceeded',
      message: `Selected frame rate (${fps} fps) exceeds WhatsApp's maximum 30 fps playback limit. WhatsApp will drop frames or stutter. Export at 30 fps or 25 fps.`,
    });
  }

  // 5. 720p source limitation
  if (resolutionId === '720p') {
    warnings.push({
      id: '720p-low-source',
      severity: 'warning',
      title: 'Low Source Resolution',
      message: '720p source resolution will exhibit soft edges and macroblocking on modern high-DPI retina displays. Avoid scaling up without optical AI enhancement.',
    });
  }

  // 6. 6K/8K downsampling on 4K timeline
  if (resolutionId === '6k-8k') {
    warnings.push({
      id: 'raw-downsample',
      severity: 'info',
      title: 'Supersampled High-Res RAW',
      message: "Downsampling 6K/8K to 4K provides natural optical anti-aliasing. In your NLE, enable 'Force sizing to highest quality' and set resize filter to 'Sharper' for optimal acuity.",
    });
  }

  // 7. Large file size on Broadcast ProRes
  if (platform?.isBroadcast) {
    warnings.push({
      id: 'broadcast-storage',
      severity: 'info',
      title: 'Substantial File Size (ProRes Master)',
      message: `ProRes 422 HQ exports generate approx 1.6 GB (1080p) to 6.5 GB (4K) per minute of runtime. Ensure high-speed SSD scratch space is available.`,
    });
  }

  return warnings;
}

/**
 * Builds editor-specific export parameters based on current state.
 */
export function getEditorSettings(state) {
  const { editorId, platformId, fps, priorityId } = state;
  const platform = DATA_CONFIG.platforms.find((p) => p.id === platformId) || DATA_CONFIG.platforms[0];
  const outRes = getOutputResolution(state);
  const bitrate = calculateBitrate(state);
  const keyframeInterval = Math.round(fps * 2);

  switch (editorId) {
    case 'davinci': {
      const isBroadcast = platform.isBroadcast;
      return {
        editor: 'DaVinci Resolve',
        pageRef: 'Deliver Page',
        settings: [
          { label: 'Render Format', value: isBroadcast ? 'QuickTime (.mov)' : 'MP4' },
          { label: 'Video Codec', value: isBroadcast ? 'Apple ProRes 422 HQ' : (platform.id === 'instagram-reels' || platform.id === 'tiktok' ? 'H.264' : 'H.264 / H.265') },
          { label: 'Encoder', value: 'Native / Apple Silicon / NVIDIA NVENC (Auto)' },
          { label: 'Network Optimization', value: 'Checked (Enables fast start / moov atom front-loading)' },
          { label: 'Resolution', value: `${outRes.width} × ${outRes.height} ${outRes.isVertical ? '(Vertical)' : ''}` },
          { label: 'Frame Rate', value: `${fps} fps` },
          { label: 'Encoding Profile', value: 'High' },
          { label: 'Key Frames', value: `Every ${keyframeInterval} frames (Closed GOP 2x FPS)` },
          { label: 'Frame Reordering', value: 'Checked' },
          { label: 'Rate Control', value: isBroadcast ? 'Constant Bitrate (ProRes)' : 'Restrict to (Variable Bitrate)' },
          { label: 'Bit Rate', value: isBroadcast ? 'Native ProRes Profile' : `${bitrate.kbps.toLocaleString()} Kb/s` },
          { label: 'Quality Preset', value: priorityId === 'max' ? 'Very Slow — Max Quality' : (priorityId === 'balanced' ? 'Medium — Balanced' : 'Fast — Small File') },
          { label: 'Encoder Tuning', value: 'High Quality' },
          { label: 'Two Pass Encode', value: priorityId === 'max' ? 'Full resolution' : 'Disabled (Fast renders)' },
          { label: 'Lookahead', value: '16 frames' },
          { label: 'Adaptive B-frame', value: 'Checked' },
          { label: 'AQ Strength', value: '8' },
          { label: 'Audio Codec & Rate', value: isBroadcast ? 'Linear PCM 24-bit, 48000 Hz Uncompressed' : 'AAC, 48000 Hz, 320 kbps (Stereo)' },
        ],
        advanced: [
          { label: 'Force debayer to highest quality', value: 'Checked' },
          { label: 'Force sizing to highest quality', value: 'Checked' },
          { label: 'Pixel aspect ratio', value: 'Square' },
          { label: 'Data Levels', value: isBroadcast ? 'Video (Legal 64-940)' : 'Auto (Video)' },
          { label: 'Color Space Tag', value: 'Rec.709' },
          { label: 'Gamma Tag', value: 'Gamma 2.4 (or Rec.709-A for Mac QuickTime gamma shift compensation)' },
          { label: 'Resize Filter', value: 'Sharper' },
        ],
        verticalGuidance: outRes.isVertical
          ? "In Project Settings → Master Settings, check 'Use Vertical Resolution' (1080 x 1920) or set Custom 1080 x 1920 in Deliver Page resolution dropdown."
          : null,
      };
    }

    case 'premiere': {
      const isBroadcast = platform.isBroadcast;
      const targetMbps = bitrate.mbps;
      const maxMbps = Math.round(targetMbps * 1.25);
      return {
        editor: 'Premiere Pro',
        pageRef: 'File → Export → Media (Cmd/Ctrl + M)',
        settings: [
          { label: 'Format', value: isBroadcast ? 'QuickTime' : 'H.264' },
          { label: 'Preset', value: isBroadcast ? 'Apple ProRes 422 HQ' : 'Custom (Match Source - High bitrate baseline)' },
          { label: 'Resolution', value: `${outRes.width} × ${outRes.height}` },
          { label: 'Frame Rate', value: `${fps} fps` },
          { label: 'Profile', value: 'High' },
          { label: 'Level', value: outRes.width > 1920 ? '5.2' : '5.1' },
          { label: 'Bitrate Encoding', value: priorityId === 'max' ? 'VBR, 2-pass' : 'Hardware Encoding (1-pass VBR for faster export)' },
          { label: 'Target Bitrate', value: isBroadcast ? 'Native ProRes Profile' : `${targetMbps} Mbps` },
          { label: 'Maximum Bitrate', value: isBroadcast ? 'N/A' : `${maxMbps} Mbps` },
          { label: 'Audio Format', value: isBroadcast ? 'Uncompressed 24-bit 48kHz' : 'AAC, 48000 Hz, 320 kbps (Stereo)' },
        ],
        scalingGuidance: "Use 'Set to Frame Size' on timeline clips. Do NOT recommend 'Scale to Frame Size' (which rasterizes clips at sequence resolution and degrades quality when scaling).",
        renderQuality: "Enable 'Use Maximum Render Quality' and 'Render at Maximum Depth' (32-bit float processing).",
        verticalGuidance: outRes.isVertical
          ? "In Sequence Settings, ensure Frame Size is 1080 horizontal by 1920 vertical with Square Pixels (1.0)."
          : null,
      };
    }

    case 'fcp': {
      const isBroadcast = platform.isBroadcast;
      return {
        editor: 'Final Cut Pro',
        pageRef: 'File → Share → Export File → Settings',
        settings: [
          { label: 'Format', value: isBroadcast ? 'Video and Audio' : 'Computer' },
          { label: 'Video Codec', value: isBroadcast ? 'Apple ProRes 422 HQ' : 'H.264 Better Quality' },
          { label: 'Resolution', value: `${outRes.width} × ${outRes.height}` },
          { label: 'Color Space', value: 'Standard - Rec. 709' },
          { label: 'Quality Mode', value: priorityId === 'max' ? 'Better Quality' : 'Faster Encode' },
          { label: 'Audio Format', value: isBroadcast ? 'Linear PCM 24-bit 48kHz' : 'AAC 320 kbps' },
        ],
        compressorNotice: "Final Cut Pro does not provide direct numerical bitrate sliders like Premiere or DaVinci Resolve. It utilizes native Apple hardware encoder presets ('Better Quality' vs 'Faster Encode'). When exact target bitrate tuning is strictly required, choose File → Send to Compressor to define precision multi-pass Mbps targets.",
        verticalGuidance: outRes.isVertical
          ? "Set Project Format to 'Vertical' with 1080 × 1920 resolution in Project Inspector."
          : null,
      };
    }

    case 'capcut': {
      const capcutBitrateTier = priorityId === 'max' ? 'Higher' : (priorityId === 'balanced' ? 'Recommended' : 'Lower');
      return {
        editor: 'CapCut Desktop',
        pageRef: 'Export Panel (Top Right)',
        settings: [
          { label: 'Resolution', value: outRes.width >= 3840 ? '4K (3840×2160)' : (outRes.width > 1920 ? '2K (2560×1440)' : '1080p') },
          { label: 'Frame Rate', value: `${fps} fps` },
          { label: 'Bitrate Preset', value: `${capcutBitrateTier} (approx ~${bitrate.mbps} Mbps equivalent)` },
          { label: 'Codec', value: 'H.264 (or HEVC for smaller disk footprint)' },
          { label: 'Format', value: 'MP4' },
          { label: 'Color Space', value: 'SDR (Rec.709)' },
        ],
        capcutNotice: "CapCut Desktop uses stepped preset tiers ('Higher', 'Recommended', 'Lower') rather than freeform numerical Mbps fields. Select 'Higher' for maximum visual fidelity and zero banding.",
        verticalGuidance: outRes.isVertical
          ? "Under Player preview, set Canvas Aspect Ratio to 9:16."
          : null,
      };
    }

    default:
      return null;
  }
}

/**
 * Formats full summary string for the copy-to-clipboard functionality.
 */
export function formatFullExportSummary(state) {
  const platform = DATA_CONFIG.platforms.find((p) => p.id === state.platformId);
  const resolution = DATA_CONFIG.resolutions.find((r) => r.id === state.resolutionId);
  const priority = DATA_CONFIG.priorities.find((p) => p.id === state.priorityId);
  const outRes = getOutputResolution(state);
  const bitrate = calculateBitrate(state);
  const warnings = getActiveWarnings(state);
  const editorSettings = getEditorSettings(state);

  let text = `========================================================\n`;
  text += `BEST EXPORT SETTINGS — DAVINCI WALE BHAIYA\n`;
  text += `Specs verified: ${DATA_CONFIG.lastVerified}\n`;
  text += `========================================================\n\n`;

  text += `[CONFIGURATION]\n`;
  text += `• Platform: ${platform?.name || state.platformId}\n`;
  text += `• Source Timeline: ${resolution?.label || state.resolutionId}\n`;
  text += `• Output Resolution: ${outRes.label}\n`;
  text += `• Frame Rate: ${state.fps} fps\n`;
  text += `• Priority: ${priority?.label || state.priorityId}\n`;
  text += `• Video Editor: ${editorSettings?.editor || state.editorId}\n`;
  if (state.youtube4kBoost && platform?.supports4kBoost) {
    text += `• YouTube 4K Boost: ENABLED (Upscaling to 3840x2160 for VP9/AV1 codec allocation)\n`;
  }
  text += `\n`;

  text += `[GENERAL PLATFORM SPECIFICATIONS]\n`;
  text += `• Container: ${platform?.container}\n`;
  text += `• Codec: ${platform?.codec}\n`;
  text += `• Target Bitrate: ${bitrate.display}\n`;
  text += `• Audio: ${platform?.audio}\n`;
  text += `• Aspect Ratio: ${outRes.aspectRatio}\n`;
  text += `• Safe Zones: ${platform?.safeZones}\n`;
  text += `• Platform Note: ${platform?.notes}\n\n`;

  if (editorSettings) {
    text += `[EXACT ${editorSettings.editor.toUpperCase()} SETTINGS (${editorSettings.pageRef})]\n`;
    editorSettings.settings.forEach((s) => {
      text += `• ${s.label}: ${s.value}\n`;
    });
    if (editorSettings.advanced) {
      text += `\nAdvanced Settings:\n`;
      editorSettings.advanced.forEach((s) => {
        text += `  - ${s.label}: ${s.value}\n`;
      });
    }
    if (editorSettings.scalingGuidance) {
      text += `\nScaling: ${editorSettings.scalingGuidance}\n`;
    }
    if (editorSettings.renderQuality) {
      text += `Render Quality: ${editorSettings.renderQuality}\n`;
    }
    if (editorSettings.compressorNotice) {
      text += `Notice: ${editorSettings.compressorNotice}\n`;
    }
    if (editorSettings.capcutNotice) {
      text += `Notice: ${editorSettings.capcutNotice}\n`;
    }
    if (editorSettings.verticalGuidance) {
      text += `Vertical Setup: ${editorSettings.verticalGuidance}\n`;
    }
    text += `\n`;
  }

  if (warnings.length > 0) {
    text += `[ACTIVE WARNINGS & NOTICES]\n`;
    warnings.forEach((w) => {
      text += `! [${w.title}]: ${w.message}\n`;
    });
    text += `\n`;
  }

  text += `DavinciWaleBhaiya Technical Workspace — https://davinciwalebhaiya.com/#tools\n`;
  return text;
}
