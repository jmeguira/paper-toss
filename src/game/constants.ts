// ---------------------------------------------------------------------------
// Projection
// ---------------------------------------------------------------------------
export const FOCAL_LENGTH = 225;
export const GROUND_MAX_Z = 2000; // back wall depth

// ---------------------------------------------------------------------------
// Layout — fractions of screen height/width, top to bottom.
// Everything above VANISH_Y_PCT is UI; everything below is playable space.
// ---------------------------------------------------------------------------
export const LAYOUT = {
  NAV_PCT: 0.07,
  NAV_PAD_X_PCT: 0.04, // horizontal padding for nav bar icons
  HUD_PCT: 0.2,
  BUFFER_PCT: 0.08,
  get VANISH_Y_PCT() {
    return this.NAV_PCT + this.HUD_PCT + this.BUFFER_PCT;
  },
} as const;

export const BALL_REST_Y_PCT = 0.85;
export const ANGLE_BOUNDS_LENGTH_PCT = 0.28;

// ---------------------------------------------------------------------------
// Flight — physics + animation
// ---------------------------------------------------------------------------
export const FLIGHT_FORWARD_SPEED = 810;
export const FLIGHT_SPEED = 1100;
export const FLIGHT_LATERAL_MULT = 2.0;
export const FLIGHT_GRAVITY = 2000;

// Cosmetic only — never affects landing result
export const ARC_SCALE = 1.2; // visual height multiplier on the arc
export const DIVE_EXPONENT = 1.7; // >1 = hang at peak, dive into target

/** Flight duration for a given target distance.
 *  Distance is the single difficulty knob — everything else derives. */
export function flightTime(targetZ: number): number {
  return targetZ / FLIGHT_FORWARD_SPEED;
}

// ---------------------------------------------------------------------------
// Difficulty
// ---------------------------------------------------------------------------
export const DIFFICULTIES = [
  { id: "EASY", label: "Easy", targetZ: 600 },
  { id: "MEDIUM", label: "Medium", targetZ: 1000 },
  { id: "HARD", label: "Hard", targetZ: 1400 },
] as const;
export type DifficultyId = (typeof DIFFICULTIES)[number]["id"];
export const DEFAULT_DIFFICULTY = DIFFICULTIES[1]; // Medium

// ---------------------------------------------------------------------------
// Target & scoring
// ---------------------------------------------------------------------------
export const TARGET_Y = 200; // world-space elevation (cosmetic, not hit detection)
export const TARGET_RADIUS = 260;
export const LANDING_TIERS = [
  { id: "PERFECT", label: "PERFECT", pct: 0.1, scores: true },
  { id: "HIT", label: "HIT", pct: 0.7, scores: true },
  { id: "NEAR_HIT", label: "HIT", pct: 1, scores: true },
  { id: "NEAR_MISS", label: "MISS", pct: 1.3, scores: false },
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
    throw new Error("LANDING_TIERS: last tier must have pct = Infinity (catch-all)");
  }
})();

export const LANDING_PAUSE_MS = 600;

// ---------------------------------------------------------------------------
// Juice intensity — logarithmic curve from streak count to 0–1 multiplier.
// All juice effects scale by this value. Ceiling is tunable.
// ---------------------------------------------------------------------------
export const JUICE_STREAK_CEILING = 5;

import { juiceOverride } from "./systems/juiceFlags";

/** Returns 0–1 intensity based on current streak. Logarithmic curve.
 *  When dev override is enabled, ignores streak and returns the fixed value. */
export function juiceIntensity(streak: number): number {
  if (juiceOverride.enabled) return juiceOverride.value;
  if (streak <= 0) return 0;
  return Math.min(1, Math.log(1 + streak) / Math.log(1 + JUICE_STREAK_CEILING));
}
export const MISS_BUFFER = 150; // clear-miss space beyond near-miss zone, both sides

// ---------------------------------------------------------------------------
// Wind
// ---------------------------------------------------------------------------
export const WIND_MIN = 250;
export const WIND_FORCE_MAX = 2500; // approx max for normalization

// ---------------------------------------------------------------------------
// Ball
// ---------------------------------------------------------------------------
export const BALL_RADIUS = 35;
export const BALL_PICKUP_RADIUS_PCT = 0.15;

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

// Swipe
export const SWIPE_MIN_SPEED = 300;
export const SWIPE_MAX_SAMPLES = 60;
export const SWIPE_TRIM_END = 2; // discard last N points (finger-lift noise)
export const SWIPE_FIT_POINTS = 12; // points used for angle/speed calculation

// Shared launch bounds
export const LAUNCH_ANGLE_MAX = (60 * Math.PI) / 180; // ±60° from vertical

// Mechanical mode
export const MECH_LAUNCH_SIZE = 80;
export const MECH_ANGLE_SWEEP_SPEED = 2.0;
export const MECH_INDICATOR_RADIUS = 80;

// ---------------------------------------------------------------------------
// Rendering & dev
// ---------------------------------------------------------------------------
export const DEV_MODE = true;

// Z-ordering layers — higher draws on top
// Components offset within their tier as needed (e.g. Depth.DEV + 1)
export const enum Depth {
  GRID = 0, // ground plane / wall grid lines (furthest back)
  WALL = 1, // wall-mounted panel (above grid, behind game objects)
  GAME = 10, // projectile, target, flight trail, angle indicators
  HUD = 100, // start screen UI
  DEV = 200, // dev overlay graphics + buttons
  CONTROLS = 300, // hamburger
  OVERLAY = 500, // modal overlays (backdrop, panel, contents)
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------
export const WALL_PANEL_W_PCT = 0.88; // HUD panel width
export const DEV_BUTTON_GAP_PCT = 0.02; // gap between ball and dev buttons
