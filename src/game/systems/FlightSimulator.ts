import { ThrowParams } from "../types";
import { Projectile } from "../objects/Projectile";
import {
  FOCAL_LENGTH,
  VANISH_Y_PCT,
  FLIGHT_SPEED,
  FLIGHT_LATERAL_MULT,
  FLIGHT_LAUNCH_VY,
  FLIGHT_GRAVITY,
  TARGET_Z,
  flightTime,
} from "../constants";

export interface LandingResult {
  x: number; // world x at landing
  z: number; // world z at landing
}

export class FlightSimulator {
  private scene: Phaser.Scene;
  private projectile: Projectile;

  // Path parameters (set at launch, immutable during flight)
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

  // Pre-computed landing result (known at launch time)
  private landingX = 0;

  public onLand: ((result: LandingResult) => void) | null = null;

  constructor(scene: Phaser.Scene, projectile: Projectile) {
    this.scene = scene;
    this.projectile = projectile;
  }

  launch(params: ThrowParams, windForce: number = 0): void {
    const { width, height } = this.scene.scale;

    // Starting world position (z=0, x from center, y from sprite height)
    this.wx0 = params.launchX - width / 2;
    this.wy0 = height - this.projectile.sprite.y;

    // Flight duration and velocities
    this.duration = flightTime(this.wy0);
    this.vx0 = FLIGHT_SPEED * FLIGHT_LATERAL_MULT * Math.sin(params.angle);
    this.vy0 = FLIGHT_LAUNCH_VY;
    this.vz = TARGET_Z / this.duration;
    this.wind = windForce;

    // Landing result — known now, delivered when animation finishes
    this.landingX = this.vx0 * this.duration + 0.5 * windForce * this.duration ** 2;

    this.elapsed = 0;
    this.flying = true;

    this.projectile.sprite.setScale(1);
    this.projectile.sprite.setVisible(true);
  }

  update(delta: number): void {
    if (!this.flying) return;

    this.elapsed += delta / 1000;

    if (this.elapsed >= this.duration) {
      // Animation complete — snap to landing position
      this.elapsed = this.duration;
      this.flying = false;
      this.evaluate(this.duration);
      this.onLand?.({ x: this.landingX, z: TARGET_Z });
      return;
    }

    this.evaluate(this.elapsed);
  }

  /** Evaluate the parametric path at time t and project to screen. */
  private evaluate(t: number): void {
    const wx = this.wx0 + this.vx0 * t + 0.5 * this.wind * t * t;
    const wy = this.wy0 + this.vy0 * t - 0.5 * FLIGHT_GRAVITY * t * t;
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

  get isFlying(): boolean {
    return this.flying;
  }
}
