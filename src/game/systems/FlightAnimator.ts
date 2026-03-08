import { Projectile } from "../objects/Projectile";
import { ShotResult } from "./ShotResolver";
import {
  FOCAL_LENGTH,
  VANISH_Y_PCT,
  FLIGHT_GRAVITY,
  ARC_SCALE,
  DIVE_EXPONENT,
  TARGET_Y,
} from "../constants";

export class FlightAnimator {
  private scene: Phaser.Scene;
  private projectile: Projectile;

  // Path parameters (set by play(), immutable during flight)
  private wx0 = 0;
  private wy0 = 0;
  private vx0 = 0;
  private vy0 = 0;
  private vz = 0;
  private wind = 0;
  private duration = 0;

  // Animation state
  private elapsed = 0;
  private flying = false;

  // The result we're animating — passed through to onComplete
  private result: ShotResult | null = null;

  public onComplete: ((result: ShotResult) => void) | null = null;

  constructor(scene: Phaser.Scene, projectile: Projectile) {
    this.scene = scene;
    this.projectile = projectile;
  }

  play(result: ShotResult): void {
    const { wx0, wy0, vx0, vy0, vz, wind, duration } = result.path;
    this.wx0 = wx0;
    this.wy0 = wy0;
    this.vx0 = vx0;
    this.vy0 = vy0;
    this.vz = vz;
    this.wind = wind;
    this.duration = duration;
    this.result = result;

    this.elapsed = 0;
    this.flying = true;

    this.projectile.sprite.setScale(1);
    this.projectile.sprite.setVisible(true);
  }

  update(delta: number): void {
    if (!this.flying) return;

    this.elapsed += delta / 1000;

    if (this.elapsed >= this.duration) {
      this.elapsed = this.duration;
      this.flying = false;
      this.evaluate(this.duration);
      this.onComplete?.(this.result!);
      return;
    }

    // Time warp: remap linear progress through a power curve.
    // Exponent > 1 = slow start, fast finish (hang then dive).
    const p = this.elapsed / this.duration;
    const warped = Math.pow(p, DIVE_EXPONENT) * this.duration;
    this.evaluate(warped);
  }

  /** Evaluate the parametric path at time t and project to screen. */
  private evaluate(t: number): void {
    const wx = this.wx0 + this.vx0 * t + 0.5 * this.wind * t * t;
    const wyRaw = this.wy0 + this.vy0 * t - 0.5 * FLIGHT_GRAVITY * t * t;
    // Scale only the arc hump, not the endpoints.
    // Baseline = straight line from wy0 to TARGET_Y over the flight.
    const p_t = t / this.duration;
    const baseline = this.wy0 * (1 - p_t) + TARGET_Y * p_t;
    const wy = baseline + (wyRaw - baseline) * ARC_SCALE;
    const wz = this.vz * t;

    const { width, height } = this.scene.scale;
    const vanishY = height * VANISH_Y_PCT;

    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + wz);
    const screenX = width / 2 + wx * scale;
    const groundY = vanishY + (height - vanishY) * scale;
    const screenY = groundY - wy * scale;

    this.projectile.sprite.setPosition(screenX, screenY);
    this.projectile.sprite.setScale(scale);
  }

  /** Abort the current flight without firing onComplete. */
  stop(): void {
    this.flying = false;
  }

  get isFlying(): boolean {
    return this.flying;
  }
}
