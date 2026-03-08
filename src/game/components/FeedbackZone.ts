import Phaser from "phaser";
import { theme } from "../theme";

/**
 * Bordered rectangle placeholder for landing feedback animations.
 * All game objects are added to the provided container.
 */
export class FeedbackZone {
  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    const fb = theme.wallPanel.feedbackZone;
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, fb.border, fb.borderAlpha);
    graphics.strokeRect(x, y, w, h);
    container.add(graphics);
  }
}
