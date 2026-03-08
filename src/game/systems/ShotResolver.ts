import {
  LandingTier,
  LANDING_TIERS,
  TARGET_RADIUS,
  TARGET_Y,
  FLIGHT_SPEED,
  FLIGHT_LATERAL_MULT,
  FLIGHT_GRAVITY,
  MISS_BUFFER,
  LAUNCH_ANGLE_MAX,
  flightTime,
} from "../constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Everything the animator needs to play the flight movie. */
export interface PathParams {
  wx0: number;
  wy0: number;
  vx0: number;
  vy0: number;
  vz: number;
  wind: number;
  duration: number;
}

/** Full outcome of a throw — tier known before animation starts. */
export interface ShotResult {
  landingX: number;
  landingZ: number;
  distance: number;
  tier: LandingTier;
  path: PathParams;
}

/** Angle boundaries for every landing zone (consumed by DevOverlay). */
export interface ZoneInfo {
  solvedAngle: number;
  edges: Map<LandingTier, [number, number]>;
  bufferAngleWidth: number;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Compute the left/right throw angles that land exactly ±radius from
 * the wind-adjusted center. Clamps to LAUNCH_ANGLE_MAX when the edge
 * falls outside the reachable cone.
 */
function channelEdges(
  radius: number,
  windDrift: number,
  ft: number,
  maxVx: number,
): [number, number] {
  const vxLeft = (-radius - windDrift) / ft;
  const vxRight = (radius - windDrift) / ft;

  const rawLeft = vxLeft / maxVx;
  const rawRight = vxRight / maxVx;

  const angleLeft =
    Math.abs(rawLeft) <= 1
      ? Math.asin(rawLeft)
      : Math.sign(rawLeft) * LAUNCH_ANGLE_MAX;
  const angleRight =
    Math.abs(rawRight) <= 1
      ? Math.asin(rawRight)
      : Math.sign(rawRight) * LAUNCH_ANGLE_MAX;

  return [angleLeft, angleRight];
}

function classifyTier(distance: number): LandingTier {
  for (const tier of LANDING_TIERS) {
    if (distance <= TARGET_RADIUS * tier.pct) return tier.id;
  }
  return "MISS";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Resolve the full outcome of a throw. Pure math, no Phaser dependency. */
export function resolveShot(
  angle: number,
  wx0: number,
  wy0: number,
  windForce: number,
  targetZ: number,
): ShotResult {
  const duration = flightTime(targetZ);
  const vx0 = FLIGHT_SPEED * FLIGHT_LATERAL_MULT * Math.sin(angle);
  const vy0 = 0.5 * FLIGHT_GRAVITY * duration + (TARGET_Y - wy0) / duration;
  const vz = targetZ / duration;

  const landingX = vx0 * duration + 0.5 * windForce * duration ** 2;
  const landingZ = targetZ;
  const distance = Math.abs(landingX);
  const tier = classifyTier(distance);

  return {
    landingX,
    landingZ,
    distance,
    tier,
    path: { wx0, wy0, vx0, vy0, vz, wind: windForce, duration },
  };
}

/** Compute angle boundaries for every finite-radius landing tier. */
export function resolveZones(targetZ: number, windForce: number): ZoneInfo {
  const ft = flightTime(targetZ);
  const maxVx = FLIGHT_SPEED * FLIGHT_LATERAL_MULT;
  const windDrift = 0.5 * windForce * ft * ft;

  const solvedAngle = Math.asin(
    Math.max(-1, Math.min(1, -windDrift / ft / maxVx)),
  );

  const edges = new Map<LandingTier, [number, number]>();
  for (const tier of LANDING_TIERS) {
    if (!isFinite(tier.pct)) continue;
    edges.set(tier.id, channelEdges(TARGET_RADIUS * tier.pct, windDrift, ft, maxVx));
  }

  const bufferAngleWidth =
    LAUNCH_ANGLE_MAX -
    Math.asin(Math.sin(LAUNCH_ANGLE_MAX) - MISS_BUFFER / (maxVx * ft));

  return { solvedAngle, edges, bufferAngleWidth };
}

