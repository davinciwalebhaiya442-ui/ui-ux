'use client';

import FestivalManager from './FestivalManager';

/**
 * Backward-compatible wrapper for the Centralized Festival Animation Manager.
 * Handles Lottie vector animations, canvas particle fields, smart date auto-schedule,
 * checkout protection, reduced-motion accessibility, and admin preview simulator.
 */
export default function FestivalEffect(props) {
  return <FestivalManager {...props} />;
}
