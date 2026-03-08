import Phaser from "phaser";
import { FOCAL_LENGTH, VANISH_Y_PCT, TARGET_RADIUS, TARGET_Y } from "../constants";
import { theme } from "../theme";

export class Target {
  public sprite: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, targetZ: number) {
    this.scene = scene;
    this.sprite = scene.add.graphics();

    // Draw at local origin — positioned/scaled via setDistance()
    this.sprite.fillStyle(theme.target.primary, theme.target.fillAlpha);
    this.sprite.fillCircle(0, 0, TARGET_RADIUS);
    this.sprite.lineStyle(theme.target.rimWidth, theme.target.primary, 1);
    this.sprite.strokeCircle(0, 0, TARGET_RADIUS);

    this.setDistance(targetZ);
  }

  setDistance(z: number): void {
    const { width, height } = this.scene.scale;
    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z);
    const vanishY = height * VANISH_Y_PCT;
    const groundY = vanishY + (height - vanishY) * scale;
    const y = groundY - TARGET_Y * scale;

    this.sprite.setPosition(width / 2, y);
    this.sprite.setScale(scale, scale * theme.target.squash);
  }
}
