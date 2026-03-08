// Camera / fake-3D projection
export const FOCAL_LENGTH = 225;
export const VANISH_Y_PCT = 0.35;

// Flight physics
export const FORWARD_SPEED = 810;
export const FLIGHT_SPEED = 1100;
export const FLIGHT_LATERAL_MULT = 2.0;
export const FLIGHT_GRAVITY = 2000;

// Flight animation (cosmetic only — never affects landing result)
export const ARC_SCALE = 1.5; // visual height multiplier on the arc
export const DIVE_EXPONENT = 1.7; // >1 = hang at peak, dive into target

/** Flight duration for a given target distance.
 *  Distance is the single difficulty knob — everything else derives. */
export function flightTime(targetZ: number): number {
  return targetZ / FORWARD_SPEED;
}

// Difficulty presets — targetZ is the only knob
export const DIFFICULTIES = [
  { id: "EASY", label: "Easy", targetZ: 600 },
  { id: "MEDIUM", label: "Medium", targetZ: 1000 },
  { id: "HARD", label: "Hard", targetZ: 1400 },
] as const;
export type DifficultyId = (typeof DIFFICULTIES)[number]["id"];
export const DEFAULT_DIFFICULTY = DIFFICULTIES[1]; // Medium

// Target elevation (world-space Y height — cosmetic, does not affect hit detection)
export const TARGET_Y = 200;

// Hit detection — landing tiers ordered innermost → outermost
// Single source of truth: add/remove/rename tiers here, everything else derives.
export const TARGET_RADIUS = 260;
export const LANDING_TIERS = [
  { id: "PERFECT", label: "PERFECT", pct: 0.1, scores: true },
  { id: "HIT", label: "HIT", pct: 0.7, scores: true },
  { id: "NEAR_HIT", label: "NEAR HIT", pct: 1, scores: true },
  { id: "NEAR_MISS", label: "NEAR MISS", pct: 1.3, scores: false },
  { id: "MISS", label: "MISS", pct: Infinity, scores: false },
] as const;
export type LandingTier = (typeof LANDING_TIERS)[number]["id"];
export function tierInfo(tier: LandingTier) {
  return LANDING_TIERS.find((t) => t.id === tier)!;
}

// Sanity check — runs once at module load, costs nothing in prod
(function validateTiers() {
  for (let i = 1; i < LANDING_TIERS.length; i++) {
    const prev = LANDING_TIERS[i - 1];
    const curr = LANDING_TIERS[i];
    if (curr.pct <= prev.pct) {
      throw new Error(
        `LANDING_TIERS: "${curr.id}" pct (${curr.pct}) must be > "${prev.id}" pct (${prev.pct})`,
      );
    }
  }
  if (isFinite(LANDING_TIERS[LANDING_TIERS.length - 1].pct)) {
    throw new Error(
      "LANDING_TIERS: last tier must have pct = Infinity (catch-all)",
    );
  }
})();

export const LANDING_PAUSE_MS = 600;

// Wind
export const WIND_MIN = 250;
export const MISS_BUFFER = 150; // clear-miss space beyond near-miss zone, both sides

// Ground plane / back wall depth
export const GROUND_MAX_Z = 2000;

// Dev mode
export const DEV_MODE = true;

// Projectile
export const PROJECTILE_RADIUS = 50;

// Swipe input
export const SWIPE_MIN_SPEED = 300;
export const SWIPE_MAX_SAMPLES = 60;
export const SWIPE_TRIM_END = 2; // discard last N points (finger-lift noise)
export const SWIPE_FIT_POINTS = 12; // points used for angle/speed calculation

// Shared launch bounds
export const LAUNCH_ANGLE_MAX = (60 * Math.PI) / 180; // ±60° from vertical

// Ball
export const BALL_PICKUP_RADIUS_PCT = 0.15;
export const BALL_REST_Y_PCT = 0.85;

// Flick pulse feedback (v1 swipe mode)
export const BALL_TOUCH_SCALE = 1.08;
export const BALL_TOUCH_PULSE_MS = 80;

// Angle bounds cone
export const ANGLE_BOUNDS_LENGTH_PCT = 0.28;

// Mechanical mode
export const MECH_LAUNCH_SIZE = 80;
export const MECH_ANGLE_SWEEP_SPEED = 2.0;
export const MECH_INDICATOR_RADIUS = 80;

// Mode toggle
export const MODE_TOGGLE_SIZE = 40;
export const MODE_TOGGLE_MARGIN = 16;

// Z-ordering layers — higher draws on top
// Components offset within their tier as needed (e.g. Depth.DEV + 1)
export const enum Depth {
  HUD = 100, // score, wind indicator, start screen UI
  DEV = 200, // dev overlay graphics + buttons
  CONTROLS = 300, // difficulty label, hamburger
  OVERLAY = 500, // modal overlays (backdrop, panel, contents)
}

// Settings overlay
export const OVERLAY_PANEL_W_PCT = 0.8; // fraction of screen width
export const OVERLAY_PANEL_H_PCT = 0.4; // fraction of screen height
