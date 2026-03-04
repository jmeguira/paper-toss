import Phaser from "phaser";
import { ThrowParams } from "../types";
import { Projectile } from "../objects/Projectile";
import {
  FOCAL_LENGTH,
  VANISH_Y_PCT,
  FLIGHT_SPEED,
  FLIGHT_LAUNCH_VY,
  FLIGHT_GRAVITY,
} from "../constants";

export interface LandingResult {
  x: number; // world x at landing
  z: number; // world z at landing
}

export class FlightSimulator {
  private scene: Phaser.Scene;
  private projectile: Projectile;

  // 3D world state
  private wx = 0;
  private wy = 0;
  private wz = 0;
  private vx = 0;
  private vy = 0;
  private vz = 0;

  private windForce = 0;
  private flying = false;

  public onLand: ((result: LandingResult) => void) | null = null;

  constructor(scene: Phaser.Scene, projectile: Projectile) {
    this.scene = scene;
    this.projectile = projectile;
  }

  launch(params: ThrowParams, windForce: number = 0): void {
    this.windForce = windForce;
    const { width, height } = this.scene.scale;
    const vanishY = height * VANISH_Y_PCT;

    // Derive world y from sprite's current screen position
    // At z=0: screenY = groundY - wy, groundY = vanishY + (height - vanishY) = height
    // So: wy = height - spriteY
    this.wx = params.launchX - width / 2;
    this.wy = height - this.projectile.sprite.y;
    this.wz = 0;

    // Initial velocity from angle
    this.vx = FLIGHT_SPEED * Math.sin(params.angle);
    this.vz = FLIGHT_SPEED * Math.cos(params.angle);
    this.vy = FLIGHT_LAUNCH_VY;

    this.flying = true;

    // Hide the ball sprite — we'll reposition it each frame
    this.projectile.sprite.setScale(1);
    this.projectile.sprite.setVisible(true);
  }

  update(delta: number): void {
    if (!this.flying) return;

    const dt = delta / 1000;

    // Euler integration — gravity on y, wind on x
    this.vy -= FLIGHT_GRAVITY * dt;
    this.vx += this.windForce * dt;
    this.wx += this.vx * dt;
    this.wy += this.vy * dt;
    this.wz += this.vz * dt;

    // Landing check
    if (this.wy <= 0 && this.wz > 0) {
      this.wy = 0;
      this.flying = false;
      this.project();
      this.onLand?.({ x: this.wx, z: this.wz });
      return;
    }

    this.project();
  }

  private project(): void {
    const { width, height } = this.scene.scale;
    const vanishY = height * VANISH_Y_PCT;

    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + this.wz);
    const screenX = width / 2 + this.wx * scale;
    const groundY = vanishY + (height - vanishY) * scale;
    const screenY = groundY - this.wy * scale;

    this.projectile.sprite.setPosition(screenX, screenY);
    this.projectile.sprite.setScale(scale);
  }

  get isFlying(): boolean {
    return this.flying;
  }
}
