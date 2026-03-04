import {
  WIND_MIN,
  BALL_REST_Y_PCT,
  MISS_BUFFER,
  FLIGHT_SPEED,
  FLIGHT_LATERAL_MULT,
  LAUNCH_ANGLE_MAX,
  LANDING_TIERS,
  TARGET_RADIUS,
  flightTime,
} from "../constants";

/** Outermost finite tier radius — wind cap keeps this + buffer inside the cone. */
const finiteTiers = LANDING_TIERS.filter(t => isFinite(t.pct));
const OUTER_RADIUS = TARGET_RADIUS * finiteTiers[finiteTiers.length - 1].pct;

export class WindSystem {
  /** Current wind force — positive = right, negative = left */
  public force = 0;
  private screenHeight: number;

  constructor(screenHeight: number) {
    this.screenHeight = screenHeight;
  }

  /** Max wind that guarantees solvability (clear miss space on both flanks). */
  get maxWind(): number {
    const wy0 = this.screenHeight * (1 - BALL_REST_Y_PCT);
    const ft = flightTime(wy0);
    const maxPlayerVx =
      FLIGHT_SPEED * FLIGHT_LATERAL_MULT * Math.sin(LAUNCH_ANGLE_MAX);
    const maxPlayerDrift = maxPlayerVx * ft;
    const windDriftPerForce = 0.5 * ft * ft;
    return (maxPlayerDrift - (OUTER_RADIUS + MISS_BUFFER)) / windDriftPerForce;
  }

  /** Generate a new random wind for the next throw.
   *  ceilPct (0–1) controls how much of maxWind is reachable — difficulty knob. */
  generate(ceilPct: number = 1): void {
    const cap = this.maxWind * Math.min(ceilPct, 1);
    const floor = Math.min(WIND_MIN, cap);
    const strength = floor + Math.random() * (cap - floor);
    const direction = Math.random() < 0.5 ? -1 : 1;
    this.force = strength * direction;
  }
}
