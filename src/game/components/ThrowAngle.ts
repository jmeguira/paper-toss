import Phaser from "phaser";
import { BALL_REST_Y_PCT, ANGLE_BOUNDS_LENGTH_PCT } from "../constants";
import { theme } from "../theme";

export class ThrowAngle {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setVisible(false);
  }

  /** Draw an arrow showing the actual throw angle. */
  show(angle: number): void {
    const { width, height } = this.scene.scale;
    const originX = width / 2;
    const originY = height * BALL_REST_Y_PCT;
    const length = height * ANGLE_BOUNDS_LENGTH_PCT;

    this.graphics.clear();
    this.graphics.lineStyle(theme.throwAngle.width, theme.throwAngle.color, theme.throwAngle.alpha);

    const tipX = originX + Math.sin(angle) * length;
    const tipY = originY - Math.cos(angle) * length;
    this.graphics.lineBetween(originX, originY, tipX, tipY);

    // Arrowhead
    const headLen = length * 0.1;
    const headAngle = 0.4; // ~23° spread
    for (const side of [-1, 1]) {
      const a = angle + Math.PI + side * headAngle;
      const hx = tipX + Math.sin(a) * headLen;
      const hy = tipY - Math.cos(a) * headLen;
      this.graphics.lineBetween(tipX, tipY, hx, hy);
    }

    this.graphics.setVisible(true);
  }

  hide(): void {
    this.graphics.clear();
    this.graphics.setVisible(false);
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
