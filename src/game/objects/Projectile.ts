import Phaser from "phaser";
import {
  BALL_PICKUP_SCALE,
  BALL_REST_Y_PCT,
  BALL_RESET_DURATION_MS,
  LAUNCH_X_MIN_PCT,
  LAUNCH_X_MAX_PCT,
  THROW_LINE_Y_PCT,
} from "../constants";

export class Projectile {
  public sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private held = false;
  private restX: number;
  private restY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.restX = width / 2;
    this.restY = height * BALL_REST_Y_PCT;

    this.sprite = scene.add.sprite(this.restX, this.restY, "projectile");
    this.sprite.setScale(1);
  }

  // ── v1: ball-in-hand methods disabled (kept for v2 lateral movement) ──

  /** Visually "pick up" the ball — bump scale to indicate grab */
  pickup(): void {
    this.held = true;
    this.sprite.setScale(BALL_PICKUP_SCALE);
  }

  /** Track finger position while held, clamped to launch bounds */
  follow(x: number, y: number): void {
    if (!this.held) return;
    const { width } = this.scene.scale;
    const clampedX = Phaser.Math.Clamp(
      x,
      width * LAUNCH_X_MIN_PCT,
      width * LAUNCH_X_MAX_PCT,
    );
    const { height } = this.scene.scale;
    const minY = height * THROW_LINE_Y_PCT;
    const clampedY = Phaser.Math.Clamp(y, minY, this.restY);
    this.sprite.setPosition(clampedX, clampedY);
  }

  /** Set x position directly (for mechanical mode), clamped to launch x bounds */
  setX(x: number): void {
    const { width } = this.scene.scale;
    const clampedX = Phaser.Math.Clamp(
      x,
      width * LAUNCH_X_MIN_PCT,
      width * LAUNCH_X_MAX_PCT,
    );
    this.sprite.x = clampedX;
  }

  /** Animated snap-back to rest position with slight overshoot ease */
  resetShot(): void {
    this.held = false;
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.restX,
      y: this.restY,
      scaleX: 1,
      scaleY: 1,
      duration: BALL_RESET_DURATION_MS,
      ease: "Back.easeOut",
    });
  }

  // ── end v1-disabled section ──

  /** Hard reset — no animation, used on resize or mode switch */
  resetPosition(width: number, height: number): void {
    this.held = false;
    this.restX = width / 2;
    this.restY = height * BALL_REST_Y_PCT;
    this.sprite.setPosition(this.restX, this.restY);
    this.sprite.setScale(1);
    this.sprite.setVisible(true);
  }

  get isHeld(): boolean {
    return this.held;
  }
}
