import Phaser from "phaser";
import { ThrowParams, InputMode } from "../types";
import { Projectile } from "../objects/Projectile";
import {
  BALL_PICKUP_RADIUS_PCT,
  BALL_TOUCH_SCALE,
  BALL_TOUCH_PULSE_MS,
  LAUNCH_ANGLE_MAX,
  SWIPE_MIN_SPEED,
  SWIPE_MAX_SAMPLES,
} from "../constants";

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export class SwipeInput implements InputMode {
  private scene: Phaser.Scene;
  private projectile: Projectile;
  private trail: TrailPoint[] = [];
  private tracking = false;
  private enabled = false;
  private pulseTween: Phaser.Tweens.Tween | null = null;

  public onThrow: ((params: ThrowParams) => void) | null = null;

  constructor(scene: Phaser.Scene, projectile: Projectile) {
    this.scene = scene;
    this.projectile = projectile;
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;

    this.scene.input.on("pointerdown", this.onPointerDown, this);
    this.scene.input.on("pointermove", this.onPointerMove, this);
    this.scene.input.on("pointerup", this.onPointerUp, this);
  }

  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    this.tracking = false;

    this.scene.input.off("pointerdown", this.onPointerDown, this);
    this.scene.input.off("pointermove", this.onPointerMove, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
  }

  destroy(): void {
    this.disable();
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.tracking) return;

    // Only start if touch is near the ball
    const ballX = this.projectile.sprite.x;
    const ballY = this.projectile.sprite.y;
    const pickupRadius = this.scene.scale.height * BALL_PICKUP_RADIUS_PCT;
    if (
      Math.abs(pointer.x - ballX) > pickupRadius ||
      Math.abs(pointer.y - ballY) > pickupRadius
    )
      return;

    this.tracking = true;
    this.trail = [];
    this.addPoint(pointer);

    // Brief pulse feedback — ball does NOT follow finger
    this.pulseTween?.stop();
    this.pulseTween = this.scene.tweens.add({
      targets: this.projectile.sprite,
      scaleX: BALL_TOUCH_SCALE,
      scaleY: BALL_TOUCH_SCALE,
      duration: BALL_TOUCH_PULSE_MS,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.tracking) return;
    this.addPoint(pointer);
  }

  private onPointerUp(_pointer: Phaser.Input.Pointer): void {
    if (!this.tracking) return;
    this.tracking = false;

    // Need enough points to compute direction
    if (this.trail.length < 2) return;

    // Check gesture is upward (last point above first)
    const first = this.trail[0];
    const last = this.trail[this.trail.length - 1];
    if (last.y >= first.y) return; // not upward

    // Check speed threshold
    const speed = this.computeSpeed();
    if (speed < SWIPE_MIN_SPEED) return;

    // Valid flick — kill pulse tween, fire throw
    this.pulseTween?.stop();
    this.projectile.sprite.setScale(1);

    const params = this.computeThrow();
    console.log(
      `Throw! angle=${Phaser.Math.RadToDeg(params.angle).toFixed(1)}° speed=${speed.toFixed(0)}px/s`,
    );
    this.onThrow?.(params);
  }

  private addPoint(pointer: Phaser.Input.Pointer): void {
    if (this.trail.length >= SWIPE_MAX_SAMPLES) {
      this.trail.shift();
    }
    this.trail.push({
      x: pointer.x,
      y: pointer.y,
      time: pointer.event.timeStamp,
    });
  }

  private computeSpeed(): number {
    if (this.trail.length < 2) return 0;
    const recent = this.trail.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dt = (last.time - first.time) / 1000;
    return dt > 0 ? dist / dt : 0;
  }

  private computeThrow(): ThrowParams {
    const recent = this.trail.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const rawAngle = Math.atan2(dx, -dy);
    const angle = Phaser.Math.Clamp(
      rawAngle,
      -LAUNCH_ANGLE_MAX,
      LAUNCH_ANGLE_MAX,
    );

    // v1: fixed center launch
    const { width } = this.scene.scale;
    const launchX = width / 2;

    return { angle, launchX };
  }
}
