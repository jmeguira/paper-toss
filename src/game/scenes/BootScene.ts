import Phaser from "phaser";
import {
  PROJECTILE_RADIUS,
  TARGET_TEXTURE_RADIUS,
  TARGET_COLOR,
  TARGET_RADIUS,
} from "../constants";
import { theme } from "../theme";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    this.generateProjectileTexture();
    this.generateTargetTexture();
    this.scene.start("Start");
  }

  private generateProjectileTexture(): void {
    const r = PROJECTILE_RADIUS;
    const gfx = this.add.graphics();
    gfx.fillStyle(theme.ball.base);
    gfx.fillCircle(r, r, r);
    gfx.generateTexture("projectile", r * 2, r * 2);
    gfx.destroy();
  }

  private generateTargetTexture(): void {
    const size = TARGET_TEXTURE_RADIUS * 2;
    const cx = TARGET_TEXTURE_RADIUS;
    const cy = TARGET_TEXTURE_RADIUS;
    const gfx = this.add.graphics();

    // Filled circle — the scoring zone
    gfx.fillStyle(TARGET_COLOR, 0.4);
    gfx.fillCircle(cx, cy, TARGET_RADIUS);

    // Rim — centered on the near-hit / near-miss boundary (pct: 1.00 = TARGET_RADIUS)
    gfx.lineStyle(theme.target.rimWidth, TARGET_COLOR, 1);
    gfx.strokeCircle(cx, cy, TARGET_RADIUS);

    gfx.generateTexture("target", size, size);
    gfx.destroy();
  }
}
