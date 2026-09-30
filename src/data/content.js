export const PROMPTS = [
  {
    id: 'cinematic-65mm-night',
    title: 'Arri Alexa 65mm Nocturnal Wet Pavement',
    category: 'Director Reference',
    engine: 'Midjourney v6 / Flux.1',
    description: 'Anamorphic frame still with authentic tungsten reflections, oval bokeh, and subtle 35mm grain.',
    promptText: 'Cinematic film still, 65mm anamorphic lens, Arri Alexa Mini LF, nocturnal neon alleyway in Tokyo reflecting on wet asphalt, atmospheric steam, shallow depth of field, natural skin texture, Kodak 5219 35mm grain, subdued saturation, moody blue and amber tones, photorealistic --ar 2.39:1 --style raw --v 6.0',
    notes: 'Produces clean 2.39:1 director treatment references without cartoonish AI gloss.'
  },
  {
    id: 'commercial-fluted-glass',
    title: 'Architectural Fluted Glass & Titanium',
    category: 'Commercial Treatment',
    engine: 'Midjourney v6',
    description: 'Minimalist product framing with caustic light refractions and brushed metal textures.',
    promptText: 'Commercial product photography, minimalist architectural fluted glass bottle resting on black brushed titanium surface, caustic sunlight patterns cast on matte slate background, macro probe lens, sharp focus on embossed typography, 8k resolution, Hasselblad H6D-100c --ar 16:9 --style raw --v 6.0',
    notes: 'Designed for luxury cosmetic and beverage pitch decks.'
  },
  {
    id: 'analog-35mm-portrait',
    title: '1970s Milanese Editorial on Kodak Portra',
    category: 'Color & Tone Reference',
    engine: 'Midjourney v6',
    description: 'Warm afternoon raking sunlight with natural skin texture and authentic halation.',
    promptText: '1970s Italian Vogue editorial portrait, model seated in modernist Milan apartment, warm afternoon sunlight slicing through venetian blinds, Kodak Portra 400 film grain, subtle red halation along high contrast edges, unretouched texture, analog color grade --ar 4:5 --style raw --v 6.0',
    notes: 'Ideal for costume designers, cinematographers, and colorists establishing lookbooks.'
  },
  {
    id: 'technical-hud-telemetry',
    title: 'Aerospace Telemetry HUD Overlay',
    category: 'Motion Graphics Reference',
    engine: 'Runway / Midjourney',
    description: 'Fine coordinate grids, vector telemetry lines, and luminescence on OLED black.',
    promptText: 'Technical aerospace telemetry HUD display, ultra fine vector grid lines, dark amber and slate cyan luminescence on black OLED backdrop, optical distortion from curved cockpit glass, clean typography, military grade aviation instruments, cinematic UI --ar 16:9 --style raw',
    notes: 'Clean asset for UI screen replacement references.'
  }
];

export const GEAR_PICKS = [
  {
    id: 'monitor-flanders',
    name: 'Flanders Scientific XMP310',
    role: 'Mastering Reference Display',
    price: '$10,995',
    category: 'Display',
    notes: '31.5-inch QD-OLED. True 1,000 nits peak luminance with zero blooming and infinite black levels. The display we calibrate our DCTLs and PowerGrades against.'
  },
  {
    id: 'panel-blackmagic-micro',
    name: 'Blackmagic Micro Color Panel',
    role: 'Grading Surface',
    price: '$509',
    category: 'Hardware Control',
    notes: 'Weighted trackballs for lift, gamma, and gain. Bluetooth and USB-C connectivity make it our daily transport surface for on-location and desktop grading.'
  },
  {
    id: 'storage-sandisk-pro',
    name: 'SanDisk Professional PRO-BLADE 4TB',
    role: 'NVMe Transport Storage',
    price: '$479',
    category: 'Data Storage',
    notes: 'Modular NVMe SSD mag system delivering up to 3,000 MB/s read speed. Handles simultaneous multi-stream 8K RAW scrubbing without cache generation.'
  }
];

export const TUTORIALS = [
  {
    id: 'tut-node-tree',
    title: 'The Non-Destructive 12-Node Tree for Commercial Grading',
    duration: '24 min',
    software: 'DaVinci Resolve 19',
    summary: 'Our standard node structure separating exposure, technical balance, split-toning, subtractive density, and film emulation without color clipping.',
    breakdown: [
      'Nodes 01-03: Exposure trim, white balance, and contrast curve',
      'Nodes 04-06: Color Space Transform (CST) and primary tonal adjustments',
      'Nodes 07-09: Skin tone isolation, split-toning, and subtractive density DCTL',
      'Nodes 10-12: Optical halation, 35mm grain, and output color transform'
    ]
  },
  {
    id: 'tut-aces-dwg',
    title: 'DaVinci Wide Gamut vs ACES 1.3: Practical Tradeoffs',
    duration: '18 min',
    software: 'Color Management',
    summary: 'A direct comparison of tone mapping curves, highlight roll-off, and skin tone fidelity between ACEScc and DaVinci YRGB Color Managed.',
    breakdown: [
      'Why ACES can occasionally skew saturated magenta highlights',
      'How DWG Intermediate preserves smoother skin roll-off on Sony and RED sensors',
      'Correct CST input and output settings for web and theatrical delivery'
    ]
  },
  {
    id: 'tut-custom-dctl',
    title: 'Writing Custom Color Matrices in DCTL',
    duration: '31 min',
    software: 'DaVinci Color Transform Language',
    summary: 'Step-by-step walkthrough of writing C-based DCTL shaders to manipulate RGB channel cross-talk and film density directly on the GPU.',
    breakdown: [
      'Basic DCTL syntax and entry-point functions',
      'Building 3x3 color matrix transformations',
      'Compiling and hot-reloading shaders in DaVinci Resolve without restarting'
    ]
  }
];

export const FAQS = [
  {
    q: 'How do I download free assets?',
    a: 'Click Download Free on any free asset card or modal to immediately get the clean .ZIP archive. No account creation, payment details, or subscriptions required.'
  },
  {
    q: 'How do paid assets work?',
    a: 'Paid products are perpetual licenses. You pay once and own the asset forever. You receive an instant high-speed download link and free access to all future updates for that major version.'
  },
  {
    q: 'Where will I receive my purchase?',
    a: 'A direct download link appears immediately in your browser on completion, and a backup link containing your invoice and license key is sent to your email.'
  },
  {
    q: 'Which software is supported?',
    a: 'All assets specify compatibility on their preview cards. Our core tools are built natively for DaVinci Resolve Studio & Free (versions 17, 18, and 19). Select transitions and templates also support Premiere Pro and After Effects.'
  },
  {
    q: 'Are updates included?',
    a: 'Yes. Compatibility patches for new DaVinci Resolve updates and minor version enhancements are provided at no additional cost.'
  },
  {
    q: 'How do I install a plugin or DCTL?',
    a: 'Every archive contains a step-by-step installation guide. OFX plugins go into your system OFX folder, while DCTL files and PowerGrades go into your DaVinci Resolve LUT / PowerGrade galleries.'
  },
  {
    q: 'Can I use these assets for client and commercial work?',
    a: 'Yes. Both free and paid assets include a worldwide commercial license. You can use them in client projects, commercials, YouTube videos, and theatrical releases.'
  },
  {
    q: 'What happens if I lose my download?',
    a: 'Email us with the email address you used at checkout, and our automated system will regenerate fresh download links for your purchased products.'
  },
  {
    q: 'How can I contact support?',
    a: 'You can write directly to support@davinciwalebhaiya.com or submit a request through the Studio contact form. We answer technical questions within 24 hours on business days.'
  }
];
