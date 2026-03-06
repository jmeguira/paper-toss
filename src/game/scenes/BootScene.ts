import Phaser from "phaser";
import { PROJECTILE_RADIUS, TARGET_RADIUS } from "../constants";
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
    const gfx = this.add.graphics();
    gfx.fillStyle(theme.ball.base);
    gfx.fillCircle(PROJECTILE_RADIUS, PROJECTILE_RADIUS, PROJECTILE_RADIUS);
    gfx.generateTexture("projectile", PROJECTILE_RADIUS * 2, PROJECTILE_RADIUS * 2);
    gfx.destroy();
  }

  private generateTargetTexture(): void {
    const texR = TARGET_RADIUS + 20; // canvas padding so the circle isn't clipped
    const size = texR * 2;
    const gfx = this.add.graphics();

    gfx.fillStyle(theme.target.primary, theme.target.fillAlpha);
    gfx.fillCircle(texR, texR, TARGET_RADIUS);
    gfx.lineStyle(theme.target.ringWidth, theme.target.primary);
    gfx.strokeCircle(texR, texR, TARGET_RADIUS);

    gfx.generateTexture("target", size, size);
    gfx.destroy();
  }
}
