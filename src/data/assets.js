export const ASSETS = [
  {
    id: 'auto-tracer',
    slug: 'auto-tracer',
    name: 'Auto Tracer OFX',
    tagline: 'Point-cloud feature tracking and power window isolation for DaVinci Resolve.',
    category: 'Plugins',
    type: 'paid',
    price: 3999,
    priceUSD: 49,
    version: '2.4',
    fileSize: '142 MB',
    compatibility: ['DaVinci Resolve Studio 18/19'],
    os: 'macOS (Apple Silicon & Intel) / Windows 10/11',
    description: 'Tracks power windows and isolation mattes across fast pans, motion blur, and partial occlusions. Built directly on native OpenFX with GPU acceleration, eliminating the need for frame-by-frame rotoscoping in commercial color sessions.',
    included: [
      'AutoTracer.ofx binary (macOS & Windows)',
      '4 Pre-configured PowerGrade node trees (.drx)',
      '8 Specialized tracking profiles (Face, Eyes, Vehicles, Skin Tones)',
      'Installation guide & 4K test timeline (.dra)'
    ],
    installation: [
      'Copy AutoTracer.ofx to /Library/Application Support/Blackmagic Design/DaVinci Resolve/OFX (macOS) or C:\\Program Files\\Common Files\\OFX (Windows).',
      'Restart DaVinci Resolve. The plugin appears in the Color page OpenFX library under DavinciWale.',
      'Drop onto any corrector node and click Initialize Track.'
    ],
    specs: {
      acceleration: 'Metal / CUDA / OpenCL',
      maxResolution: 'Up to 12K DCI RAW',
      colorPipelines: 'ACEScc, DaVinci YRGB Color Managed, Rec.709, Apple Log'
    }
  },
  {
    id: 'ripple-effect',
    slug: 'ripple-effect',
    name: 'Fluid Ripple & Caustics',
    tagline: 'Volumetric light refraction and liquid surface displacement macro.',
    category: 'Effects',
    type: 'paid',
    price: 2499,
    priceUSD: 29,
    version: '1.8',
    fileSize: '89 MB',
    compatibility: ['DaVinci Resolve (Studio & Free)', 'After Effects 2023+'],
    os: 'Cross-platform',
    description: 'Calculates light refraction, surface tension ripples, and chromatic dispersion as light passes through liquid layers. Designed for title sequences, luxury product films, and abstract music video transitions.',
    included: [
      'DaVinci Resolve Fusion Macro (.setting)',
      'After Effects .aep Project Template',
      '24 4K 60fps ProRes 4444 displacement plates',
      'Custom DCTL for Color Page refraction grading'
    ],
    installation: [
      'DaVinci Resolve: Place .setting file into Fusion > Templates > Edit > Effects.',
      'After Effects: Open the included .aep or install the script into Support Files > Scripts.',
      'Add an Adjustment Clip above your footage and apply Fluid Ripple from the Effects library.'
    ],
    specs: {
      bitDepth: '32-bit floating point',
      controls: 'Viscosity, IOR index, wave frequency, chromatic aberration spread',
      playback: 'Real-time on M1 Pro / RTX 3070 and above'
    }
  },
  {
    id: 'yt-downloader',
    slug: 'yt-downloader',
    name: 'YouTube Stem & Reference Utility',
    tagline: 'Lossless 4K ProRes video, reference audio, and 4-stem extractor for timeline editors.',
    category: 'Tools',
    type: 'free',
    price: 0,
    priceUSD: 0,
    version: '3.1',
    fileSize: '34 MB',
    compatibility: ['Standalone App (macOS & Windows)'],
    os: 'macOS 12+ / Windows 10/11',
    description: 'A clean desktop tool built for offline editorial reference. Extracts high-bitrate video, 24-bit 48kHz WAV audio, and separates dialogue, music, drums, and bass stems without browser ads, popups, or quality throttling.',
    included: [
      'Standalone application for macOS (Universal) and Windows',
      'Direct drag-and-drop into DaVinci Resolve and Premiere Pro media pools',
      'AI stem separation model (runs locally on your machine)',
      'EDL chapter marker generator'
    ],
    installation: [
      'Download and run the installer for your operating system.',
      'Paste any YouTube video or audio link into the address field.',
      'Select your output format (Apple ProRes 422 Proxy, H.265, or WAV Stems) and click Extract.'
    ],
    specs: {
      audioQuality: '24-bit 48kHz uncompressed WAV',
      videoSupport: 'Up to 4K 60fps HDR',
      privacy: 'No telemetry, zero cloud tracking, runs entirely on your local machine'
    }
  },
  {
    id: 'metallic-liquid',
    slug: 'metallic-liquid',
    name: 'Molten Chrome Macro',
    tagline: 'Real-time liquid mercury displacement with studio HDRI specular reflection.',
    category: 'Effects',
    type: 'free',
    price: 0,
    priceUSD: 0,
    version: '1.2',
    fileSize: '112 MB',
    compatibility: ['DaVinci Resolve Fusion'],
    os: 'Cross-platform',
    description: 'Converts vector paths, typography, or video silhouettes into liquid chrome with anisotropic highlights. Built using native Fusion 3D nodes with zero third-party plugin dependencies.',
    included: [
      'DaVinci Resolve Fusion Composition (.comp)',
      '6 Studio Darkroom 8K HDRIs (.exr)',
      'Chrome, Obsidian, Mercury, and Raw Silver presets',
      'Node tree layout reference'
    ],
    installation: [
      'In DaVinci Resolve, navigate to the Fusion page.',
      'File > Import > Fusion Composition and choose MoltenChrome.comp.',
      'Connect your footage or text node into the Background input port.'
    ],
    specs: {
      rendering: 'Native Fusion 3D Software/OpenGL Renderer',
      colorCompatibility: 'ACEScg and DaVinci Wide Gamut compatible',
      dependencies: 'None (uses native Resolve tools)'
    }
  },
  {
    id: 'grid-effect-transition',
    slug: 'grid-effect-transition',
    name: 'Anamorphic Grid Wipe',
    tagline: 'Technical coordinate grid breakdown with optical phosphor chromatic offset.',
    category: 'Transitions',
    type: 'free',
    price: 0,
    priceUSD: 0,
    version: '2.0',
    fileSize: '45 MB',
    compatibility: ['DaVinci Resolve', 'Premiere Pro'],
    os: 'Cross-platform',
    description: 'A transition built around optical projector gate mechanics and technical coordinate grids. Collapses shot A along anamorphic laser lines before resolving cleanly into shot B.',
    included: [
      'DaVinci Resolve Edit Page Transition (.setting)',
      'Premiere Pro .mogrt template',
      '8 Mastered 48kHz sound effects (servo snaps, optical clicks)',
      'Frame timing documentation'
    ],
    installation: [
      'Copy .setting to Fusion > Templates > Edit > Transitions.',
      'In the Edit timeline, drag Anamorphic Grid across any cut point.',
      'Adjust duration (default: 14 frames).'
    ],
    specs: {
      aspectRatios: '16:9, 2.39:1, and 9:16 vertical auto-adapting',
      audioDesign: 'Includes synced 48kHz 24-bit mechanical SFX',
      duration: 'Customizable from 6 to 36 frames'
    }
  },
  {
    id: 'kodak-2383-print',
    slug: 'kodak-2383-print',
    name: 'Kodak 2383 Print DCTL',
    tagline: 'Photochemical spectral density curve match of genuine 35mm print film stock.',
    category: 'Color Grading',
    type: 'paid',
    price: 4499,
    priceUSD: 55,
    version: '4.0',
    fileSize: '210 MB',
    compatibility: ['DaVinci Resolve Studio & Free 17/18/19'],
    os: 'macOS / Windows / Linux',
    description: 'Built by measuring densitometer curves from Kodak 2383 prints struck from Vision3 5219 negatives. Preserves full 16-bit float dynamic range with genuine subtractive color density and highlight roll-off.',
    included: [
      'DavinciWale_Kodak2383.dctl (Runs in Color Page DCTL node)',
      '4 PowerGrades (.drx) for D55, D60, D65, and Tungsten balances',
      'Subtractive density node group with split-tone trim',
      '35mm 4-perf grain and halation setup guide'
    ],
    installation: [
      'Place .dctl files into your DaVinci Resolve LUT directory.',
      'In the Color page, open the PowerGrade gallery and import the .drx files.',
      'Apply to your pipeline immediately after your input Color Space Transform.'
    ],
    specs: {
      colorSpaces: 'DWG / ACEScc / Arri LogC3 & C4 / Sony S-Log3 / RED IPP2',
      precision: '32-bit floating point non-destructive',
      targetDeliverables: 'Rec.709 Gamma 2.4 & DCI-P3 D65'
    }
  },
  {
    id: 'halation-bloom-dctl',
    slug: 'halation-bloom-dctl',
    name: 'Optical Halation & Bloom DCTL',
    tagline: 'Physical light bleed simulation across red photographic emulsion layers.',
    category: 'Color Grading',
    type: 'paid',
    price: 1999,
    priceUSD: 24,
    version: '2.1',
    fileSize: '18 MB',
    compatibility: ['DaVinci Resolve Studio & Free 17/18/19'],
    os: 'macOS / Windows / Linux',
    description: 'Reconstructs photon scatter through the emulsion backing layer with adjustable threshold, scatter radius, and hue purity. Runs in real time without bogging down the color pipeline.',
    included: [
      'DavinciWale_Halation.dctl',
      'DavinciWale_Bloom.dctl',
      '3 Calibrated presets: 16mm Vintage, 35mm Clean, 70mm Subtle',
      'Technical parameter reference sheet'
    ],
    installation: [
      'Copy DCTL files to your DaVinci Resolve LUT directory.',
      'Add a DCTL node in the Color page and select DavinciWale_Halation.dctl.',
      'Adjust Threshold and Scatter to suit your shot.'
    ],
    specs: {
      performance: '< 1ms GPU compute time per 4K frame',
      compatibility: 'Runs on free DaVinci Resolve and DaVinci Resolve Studio'
    }
  }
];

export const CATEGORIES = [
  'All',
  'Color Grading',
  'Plugins',
  'Effects',
  'Transitions',
  'Tools',
  'Free'
];

export const SOFTWARE_OPTIONS = [
  'All Software',
  'DaVinci Resolve',
  'Premiere Pro',
  'After Effects'
];
