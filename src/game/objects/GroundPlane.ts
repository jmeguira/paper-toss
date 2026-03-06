import Phaser from "phaser";
import {
  FOCAL_LENGTH,
  VANISH_Y_PCT,
  GROUND_LINE_COUNT,
  GROUND_MAX_Z,
  GROUND_VERTICAL_COUNT,
} from "../constants";
import { theme } from "../theme";

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
    const { lineColor, alphaFar, alphaNear } = theme.ground;

    this.graphics.clear();

    // Horizontal lines — recede toward vanishing point, alpha fades with distance
    for (let i = 0; i < GROUND_LINE_COUNT; i++) {
      const t = i / (GROUND_LINE_COUNT - 1);
      const z = t * GROUND_MAX_Z;
      const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z);
      const y = vanishY + (height - vanishY) * scale;
      const alpha = alphaNear + (alphaFar - alphaNear) * t;

      this.graphics.lineStyle(1, lineColor, alpha);
      this.graphics.lineBetween(0, y, width, y);
    }

    // Vertical lines — converge toward vanishing point, use midpoint alpha
    const vertAlpha = (alphaFar + alphaNear) / 2;
    this.graphics.lineStyle(1, lineColor, vertAlpha);
    for (let i = 1; i <= GROUND_VERTICAL_COUNT; i++) {
      const spread = (i / GROUND_VERTICAL_COUNT) * (width / 2);

      this.graphics.lineBetween(vanishX - spread, height, vanishX, vanishY);
      this.graphics.lineBetween(vanishX + spread, height, vanishX, vanishY);
    }
  }
}
