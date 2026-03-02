import Phaser from "phaser";
import {
  PROJECTILE_RADIUS,
  PROJECTILE_COLOR,
  TARGET_RADIUS,
  TARGET_COLOR,
  TARGET_RING_WIDTH,
} from "../constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    this.generateProjectileTexture();
    this.generateTargetTexture();
    this.scene.start("Game");
  }

  private generateProjectileTexture(): void {
    const gfx = this.add.graphics();
    gfx.fillStyle(PROJECTILE_COLOR);
    gfx.fillCircle(PROJECTILE_RADIUS, PROJECTILE_RADIUS, PROJECTILE_RADIUS);
    gfx.generateTexture("projectile", PROJECTILE_RADIUS * 2, PROJECTILE_RADIUS * 2);
    gfx.destroy();
  }

  private generateTargetTexture(): void {
    const size = TARGET_RADIUS * 2;
    const gfx = this.add.graphics();
    gfx.lineStyle(TARGET_RING_WIDTH, TARGET_COLOR);
    gfx.strokeCircle(TARGET_RADIUS, TARGET_RADIUS, TARGET_RADIUS);
    gfx.strokeCircle(TARGET_RADIUS, TARGET_RADIUS, TARGET_RADIUS * 0.6);
    gfx.strokeCircle(TARGET_RADIUS, TARGET_RADIUS, TARGET_RADIUS * 0.3);
    gfx.generateTexture("target", size, size);
    gfx.destroy();
  }
}
