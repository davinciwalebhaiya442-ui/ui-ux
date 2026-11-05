export const DEFAULT_FESTIVAL_SETTINGS = {
  enabled: false,
  effect: 'snow', // 'snow' | 'diwali' | 'confetti' | 'fireflies'
  intensity: 'medium', // 'low' | 'medium' | 'high'
  enableOnMobile: true,
  greetingText: '',
  greetingEnabled: false,
  customSpeed: 1, // 0 = Gentle, 1 = Normal, 2 = Fast
};

export const FESTIVAL_EFFECT_OPTIONS = [
  {
    id: 'snow',
    label: 'Winter Snowfall',
    icon: '❄️',
    description: 'Realistic falling snowflakes with gentle wind drift. Perfect for Winter, Christmas & New Year.',
    recommendedGreeting: '❄️ Season Greetings & Happy Holidays from DavinciWaleBhaiya!',
    accentColor: '#60a5fa',
  },
  {
    id: 'diwali',
    label: 'Diwali & Golden Embers',
    icon: '🪔',
    description: 'Floating cinema-grade gold sparks and warm embers. Ultra-luxurious on pure dark mode.',
    recommendedGreeting: '🪔 Wishing you a Bright & Creative Diwali!',
    accentColor: '#f59e0b',
  },
  {
    id: 'confetti',
    label: 'Celebration Confetti',
    icon: '🎉',
    description: 'Multi-colored fluttering festive confetti ribbons for New Year, Product Drops & Special Sales.',
    recommendedGreeting: '🎉 Special Festive Offers Active! Upgrade your Color Grade.',
    accentColor: '#ec4899',
  },
  {
    id: 'fireflies',
    label: 'Magic Fireflies',
    icon: '✨',
    description: 'Subtle glowing bioluminescent particles drifting smoothly. Elegant year-round ambient magic.',
    recommendedGreeting: '✨ Premium Color Science for Filmmakers.',
    accentColor: '#10b981',
  },
];

