import Phaser from "phaser";
import {
  PROJECTILE_RADIUS,
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
    const texRadius = Math.ceil(TARGET_RADIUS + theme.target.rimWidth / 2);
    const size = texRadius * 2;
    const cx = texRadius;
    const cy = texRadius;
    const gfx = this.add.graphics();

    // Filled circle — the scoring zone
    gfx.fillStyle(theme.target.primary, theme.target.fillAlpha);
    gfx.fillCircle(cx, cy, TARGET_RADIUS);

    // Rim — centered on the near-hit / near-miss boundary (pct: 1.00 = TARGET_RADIUS)
    gfx.lineStyle(theme.target.rimWidth, theme.target.primary, 1);
    gfx.strokeCircle(cx, cy, TARGET_RADIUS);

    gfx.generateTexture("target", size, size);
    gfx.destroy();
  }
}
