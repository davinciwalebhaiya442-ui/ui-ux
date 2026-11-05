/**
 * Smart Calendar Auto-Activation System for Festivals
 * Automatically detects and schedules seasonal themes based on real-world dates.
 */

export const FESTIVAL_CALENDAR_SCHEDULE = [
  {
    id: 'newyear',
    label: 'New Year Fireworks & Confetti',
    // Dec 28 to Jan 05
    matches: (month, day) => (month === 12 && day >= 28) || (month === 1 && day <= 5),
  },
  {
    id: 'independence',
    label: 'Republic Day (Indian Tricolour)',
    // Jan 22 to Jan 28
    matches: (month, day) => month === 1 && day >= 22 && day <= 28,
  },
  {
    id: 'valentine',
    label: 'Valentine’s Day (Rose Petals & Love)',
    // Feb 07 to Feb 16
    matches: (month, day) => month === 2 && day >= 7 && day <= 16,
  },
  {
    id: 'holi',
    label: 'Holi Colors (Gulal Splash)',
    // March 10 to March 28
    matches: (month, day) => month === 3 && day >= 10 && day <= 28,
  },
  {
    id: 'ramadan',
    label: 'Ramadan Mubarak (Lanterns & Twilight)',
    // Mid-March to Mid-April (standard lunar window)
    matches: (month, day) => (month === 3 && day >= 25) || (month === 4 && day <= 12),
  },
  {
    id: 'eid',
    label: 'Eid & Ramadan Mubarak',
    // Mid-April festive window
    matches: (month, day) => month === 4 && day >= 10 && day <= 20,
  },
  {
    id: 'independence',
    label: 'Independence Day (Indian Tricolour)',
    // Aug 08 to Aug 18
    matches: (month, day) => month === 8 && day >= 8 && day <= 18,
  },
  {
    id: 'ganesh',
    label: 'Ganesh Chaturthi (Auspicious Blessings)',
    // Aug 26 to Sep 15
    matches: (month, day) => (month === 8 && day >= 26) || (month === 9 && day <= 15),
  },
  {
    id: 'navratri',
    label: 'Navratri Special (Traditional Garba)',
    // Sep 25 to Oct 12
    matches: (month, day) => (month === 9 && day >= 25) || (month === 10 && day <= 12),
  },
  {
    id: 'durga_puja',
    label: 'Durga Puja & Sacred Marigold',
    // Oct 05 to Oct 18
    matches: (month, day) => month === 10 && day >= 5 && day <= 18,
  },
  {
    id: 'dussehra',
    label: 'Dussehra (Vijayadashami)',
    // Oct 12 to Oct 22
    matches: (month, day) => month === 10 && day >= 12 && day <= 22,
  },
  {
    id: 'diwali',
    label: 'Diwali & Golden Embers',
    // Oct 20 to Nov 15
    matches: (month, day) => (month === 10 && day >= 20) || (month === 11 && day <= 15),
  },
  {
    id: 'halloween',
    label: 'Halloween (Atmospheric Spooky Bats)',
    // Oct 24 to Nov 02
    matches: (month, day) => (month === 10 && day >= 24) || (month === 11 && day <= 2),
  },
  {
    id: 'christmas',
    label: 'Christmas & Holiday Magic',
    // Dec 15 to Dec 27
    matches: (month, day) => month === 12 && day >= 15 && day <= 27,
  },
  {
    id: 'snow',
    label: 'Winter Snowfall (Ultra-Premium)',
    // Nov 15 to Feb 28 (Winter Season Fallback)
    matches: (month) => month === 11 || month === 12 || month === 1 || month === 2,
  },
];

/**
 * Resolves which festival should be active.
 * If effect is 'auto', automatically scans the schedule table.
 * If effect is a specific ID, returns that exact ID.
 */
export function resolveFestivalEffect(configuredEffect = 'snow', testDate = null) {
  if (configuredEffect !== 'auto') {
    return configuredEffect || 'snow';
  }

  const now = testDate ? new Date(testDate) : new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate(); // 1-31

  for (const item of FESTIVAL_CALENDAR_SCHEDULE) {
    if (item.matches(month, day)) {
      return item.id;
    }
  }

  return 'snow';
}
