import Phaser from "phaser";
import {
  THROW_LINE_Y_PCT,
  THROW_LINE_COLOR,
  THROW_LINE_ALPHA,
  THROW_LINE_DASH,
  THROW_LINE_GAP,
} from "../constants";

export class ThrowLine {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.draw();
  }

  /** The y coordinate of the throw line in screen space */
  get y(): number {
    return this.scene.scale.height * THROW_LINE_Y_PCT;
  }

  show(): void {
    this.graphics.setVisible(true);
  }

  hide(): void {
    this.graphics.setVisible(false);
  }

  private draw(): void {
    const { width } = this.scene.scale;
    const y = this.y;

    this.graphics.clear();
    this.graphics.lineStyle(2, THROW_LINE_COLOR, THROW_LINE_ALPHA);

    let x = 0;
    while (x < width) {
      const dashEnd = Math.min(x + THROW_LINE_DASH, width);
      this.graphics.lineBetween(x, y, dashEnd, y);
      x += THROW_LINE_DASH + THROW_LINE_GAP;
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
