// Camera / fake-3D projection
export const FOCAL_LENGTH = 300;
export const VANISH_Y_PCT = 0.35;
export const TARGET_Z = 1200;

// Flight physics
export const FLIGHT_SPEED = 1100;
export const FLIGHT_LATERAL_MULT = 2.0;
export const FLIGHT_LAUNCH_VY = 1400;
export const FLIGHT_GRAVITY = 2000;

/** Actual flight time accounting for starting height above ground.
 *  Solves: 0 = startHeight + vy·t − ½g·t² for the positive root. */
export function flightTime(startHeight: number): number {
  return (
    (FLIGHT_LAUNCH_VY +
      Math.sqrt(FLIGHT_LAUNCH_VY ** 2 + 2 * FLIGHT_GRAVITY * startHeight)) /
    FLIGHT_GRAVITY
  );
}

// Hit detection — five landing tiers (perfect ⊂ hit ⊂ near-hit ⊂ near-miss ⊂ miss)
export const TARGET_RADIUS = 250;
export const PERFECT_PCT = 0.05; // perfect = dead-center 5% of target
export const HIT_PCT = 0.6; // clean hit = inner 60% of target
export const PERFECT_RADIUS = TARGET_RADIUS * PERFECT_PCT;
export const HIT_RADIUS = TARGET_RADIUS * HIT_PCT;
export const NEAR_MISS_RADIUS = TARGET_RADIUS * (2 - HIT_PCT); // mirrors near-hit band outward
export const LANDING_PAUSE_MS = 600;

// Wind
export const WIND_MIN = 1250;
export const MISS_BUFFER = 150; // clear-miss space beyond near-miss zone, both sides

// Ground plane
export const GROUND_LINE_COLOR = 0x3a3a5c;
export const GROUND_LINE_ALPHA = 0.4;
export const GROUND_LINE_COUNT = 12;
export const GROUND_MAX_Z = 4000;
export const GROUND_VERTICAL_COUNT = 8;

// Dev mode
export const DEV_MODE = true;

// Projectile texture
export const PROJECTILE_RADIUS = 45;
export const PROJECTILE_COLOR = 0xf5f5f5;

// Swipe input
export const SWIPE_MIN_SPEED = 300;
export const SWIPE_MAX_SAMPLES = 60;

// Target texture
export const TARGET_TEXTURE_RADIUS = 360;
export const TARGET_COLOR = 0xff4444;
export const TARGET_RING_WIDTH = 4;

// Shared launch bounds
export const LAUNCH_ANGLE_MAX = (60 * Math.PI) / 180; // ±60° from vertical

// Ball
export const BALL_PICKUP_RADIUS_PCT = 0.15;
export const BALL_REST_Y_PCT = 0.85;

// Flick pulse feedback (v1 swipe mode)
export const BALL_TOUCH_SCALE = 1.08;
export const BALL_TOUCH_PULSE_MS = 80;

// Angle bounds cone
export const ANGLE_BOUNDS_LENGTH_PCT = 0.35;
export const ANGLE_BOUNDS_COLOR = 0xffffff;
export const ANGLE_BOUNDS_ALPHA = 0.08;

// Mechanical mode
export const MECH_LAUNCH_SIZE = 80;
export const MECH_ANGLE_SWEEP_SPEED = 2.0;
export const MECH_INDICATOR_RADIUS = 80;

// Mode toggle
export const MODE_TOGGLE_SIZE = 40;
export const MODE_TOGGLE_MARGIN = 16;
