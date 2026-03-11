/**
 * Juice intensity override — when enabled, juiceIntensity() returns
 * the fixed value instead of computing from streak.
 */
export const juiceOverride = {
  enabled: true,
  value: 1.0,       // 0–1, maps to the full juice range
};

/**
 * Runtime toggles for individual juice effects.
 * Checked by each effect's trigger point — false = skip the effect.
 * Mutated directly by the dev panel in SettingsOverlay.
 */
export const juiceFlags = {
  windParticles: true,
  speedLines: true,
  flightTrail: true,
  flightWeight: true,
  ballFade: true,
  impactRings: true,
  targetReaction: true,
  cameraFx: true,
  glitch: true,
  scorePop: true,
  feedbackText: true,
};

/** Human-readable labels for the dev panel. */
export const juiceFlagLabels: Record<keyof typeof juiceFlags, string> = {
  windParticles: "Wind Particles",
  speedLines: "Speed Lines",
  flightTrail: "Flight Trail",
  flightWeight: "Flight Weight",
  ballFade: "Ball Fade",
  impactRings: "Impact Rings",
  targetReaction: "Target Reaction",
  cameraFx: "Camera FX",
  glitch: "Glitch",
  scorePop: "Score Pop",
  feedbackText: "Feedback Text",
};
