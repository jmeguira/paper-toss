import Phaser from "phaser";
import { LAUNCH_ANGLE_MAX, MECH_INDICATOR_RADIUS } from "../constants";
import { theme } from "../theme";

export class AngleIndicator {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private _angle = 0; // current angle in radians
  private sweepTime = 0;
  private sweepSpeed: number;
  private centerX = 0;
  private centerY = 0;

  constructor(scene: Phaser.Scene, sweepSpeed: number) {
    this.scene = scene;
    this.sweepSpeed = sweepSpeed;
    this.graphics = scene.add.graphics();
  }

  /** Current oscillator angle in radians (±LAUNCH_ANGLE_MAX) */
  get angle(): number {
    return this._angle;
  }

  /** Reposition the indicator center (call when ball moves) */
  setPosition(x: number, y: number): void {
    this.centerX = x;
    this.centerY = y;
  }

  /** Advance the oscillator — call from scene update() */
  update(delta: number): void {
    this.sweepTime += (delta / 1000) * this.sweepSpeed;
    this._angle = Math.sin(this.sweepTime) * LAUNCH_ANGLE_MAX;
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
    this.graphics.clear();

    // Draw arc background (the sweep range)
    this.graphics.lineStyle(2, theme.angleIndicator.arcColor, theme.angleIndicator.arcAlpha);
    // Arc from -LAUNCH_ANGLE_MAX to +LAUNCH_ANGLE_MAX, measured from 12 o'clock
    // Phaser arcs use standard math angles (0 = right, CCW positive)
    // We want: straight up = -π/2, left of up = -π/2 - LAUNCH_ANGLE_MAX, right = -π/2 + LAUNCH_ANGLE_MAX
    const startAngle = -Math.PI / 2 - LAUNCH_ANGLE_MAX;
    const endAngle = -Math.PI / 2 + LAUNCH_ANGLE_MAX;
    this.graphics.beginPath();
    this.graphics.arc(
      this.centerX,
      this.centerY,
      MECH_INDICATOR_RADIUS,
      startAngle,
      endAngle,
      false,
    );
    this.graphics.strokePath();

    // Draw needle at current angle
    // angle: 0 = straight up, positive = right
    const needleAngle = -Math.PI / 2 + this._angle;
    const needleX =
      this.centerX + Math.cos(needleAngle) * MECH_INDICATOR_RADIUS;
    const needleY =
      this.centerY + Math.sin(needleAngle) * MECH_INDICATOR_RADIUS;

    this.graphics.lineStyle(3, theme.angleIndicator.needleColor, theme.angleIndicator.needleAlpha);
    this.graphics.lineBetween(this.centerX, this.centerY, needleX, needleY);

    // Needle tip dot
    this.graphics.fillStyle(theme.angleIndicator.needleColor, 1);
    this.graphics.fillCircle(needleX, needleY, 4);
  }
}
