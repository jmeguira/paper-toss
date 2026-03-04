import Phaser from "phaser";
import {
  BALL_REST_Y_PCT,
  LAUNCH_ANGLE_MAX,
  ANGLE_BOUNDS_LENGTH_PCT,
  ANGLE_BOUNDS_COLOR,
  ANGLE_BOUNDS_ALPHA,
} from "../constants";

export class AngleBounds {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.draw();
  }

  show(): void {
    this.graphics.setVisible(true);
  }

  hide(): void {
    this.graphics.setVisible(false);
  }

  destroy(): void {
    this.graphics.destroy();
  }

  private draw(): void {
    const { width, height } = this.scene.scale;
    const originX = width / 2;
    const originY = height * BALL_REST_Y_PCT;
    const length = height * ANGLE_BOUNDS_LENGTH_PCT;

    this.graphics.clear();
    this.graphics.lineStyle(1, ANGLE_BOUNDS_COLOR, ANGLE_BOUNDS_ALPHA);

    // Left bound: -LAUNCH_ANGLE_MAX from vertical
    const lx = originX + Math.sin(-LAUNCH_ANGLE_MAX) * length;
    const ly = originY + -Math.cos(-LAUNCH_ANGLE_MAX) * length;
    this.graphics.lineBetween(originX, originY, lx, ly);

    // Right bound: +LAUNCH_ANGLE_MAX from vertical
    const rx = originX + Math.sin(LAUNCH_ANGLE_MAX) * length;
    const ry = originY + -Math.cos(LAUNCH_ANGLE_MAX) * length;
    this.graphics.lineBetween(originX, originY, rx, ry);
  }
}
