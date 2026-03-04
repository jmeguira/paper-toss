import Phaser from "phaser";
import {
  FOCAL_LENGTH,
  VANISH_Y_PCT,
  GROUND_LINE_COLOR,
  GROUND_LINE_ALPHA,
  GROUND_LINE_COUNT,
  GROUND_MAX_Z,
  GROUND_VERTICAL_COUNT,
} from "../constants";

export class GroundPlane {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.draw();
  }

  draw(): void {
    const { width, height } = this.scene.scale;
    const vanishX = width / 2;
    const vanishY = height * VANISH_Y_PCT;

    this.graphics.clear();
    this.graphics.lineStyle(1, GROUND_LINE_COLOR, GROUND_LINE_ALPHA);

    // Horizontal lines — recede toward vanishing point
    for (let i = 0; i < GROUND_LINE_COUNT; i++) {
      const t = i / (GROUND_LINE_COUNT - 1);
      const z = t * GROUND_MAX_Z;
      const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z);
      const y = vanishY + (height - vanishY) * scale;

      this.graphics.lineBetween(0, y, width, y);
    }

    // Vertical lines — converge toward vanishing point
    for (let i = 1; i <= GROUND_VERTICAL_COUNT; i++) {
      const spread = (i / GROUND_VERTICAL_COUNT) * (width / 2);

      this.graphics.lineBetween(vanishX - spread, height, vanishX, vanishY);
      this.graphics.lineBetween(vanishX + spread, height, vanishX, vanishY);
    }
  }
}
