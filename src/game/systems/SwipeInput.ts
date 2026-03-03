import Phaser from "phaser";
import { ThrowParams, InputMode } from "../types";
import { Projectile } from "../objects/Projectile";
import { ThrowLine } from "../ui/ThrowLine";
import {
  BALL_PICKUP_RADIUS_PCT,
  LAUNCH_ANGLE_MAX,
  LAUNCH_X_MIN_PCT,
  LAUNCH_X_MAX_PCT,
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
  private throwLine: ThrowLine;
  private trail: TrailPoint[] = [];
  private tracking = false;
  private enabled = false;
  private prevY = 0;

  public onThrow: ((params: ThrowParams) => void) | null = null;
  public onCancel: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    projectile: Projectile,
    throwLine: ThrowLine,
  ) {
    this.scene = scene;
    this.projectile = projectile;
    this.throwLine = throwLine;
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.throwLine.show();

    this.scene.input.on("pointerdown", this.onPointerDown, this);
    this.scene.input.on("pointermove", this.onPointerMove, this);
    this.scene.input.on("pointerup", this.onPointerUp, this);
  }

  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    this.tracking = false;
    this.throwLine.hide();

    this.scene.input.off("pointerdown", this.onPointerDown, this);
    this.scene.input.off("pointermove", this.onPointerMove, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
  }

  destroy(): void {
    this.disable();
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.tracking) return;

    // Only pick up if touch is near the ball
    const ballY = this.projectile.sprite.y;
    const pickupRadius = this.scene.scale.height * BALL_PICKUP_RADIUS_PCT;
    const dy = Math.abs(pointer.y - ballY);
    const dx = Math.abs(pointer.x - this.projectile.sprite.x);
    if (dy > pickupRadius || dx > pickupRadius) return;

    this.tracking = true;
    this.trail = [];
    this.prevY = pointer.y;
    this.addPoint(pointer);

    this.projectile.pickup();
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.tracking) return;
    this.addPoint(pointer);

    // Ball follows finger (clamped — can't go below rest or outside x bounds)
    this.projectile.follow(pointer.x, pointer.y);

    // Check throw-line crossing (moving upward)
    const lineY = this.throwLine.y;
    if (this.prevY > lineY && pointer.y <= lineY) {
      // Crossed the line going up — check speed
      const speed = this.computeSpeed();
      if (speed >= SWIPE_MIN_SPEED) {
        this.tracking = false;
        const params = this.computeThrow(pointer.x);
        console.log("Throw!", params, `(${speed.toFixed(0)} px/s)`);
        this.projectile.resetShot();
        this.onThrow?.(params);
        return;
      }
    }

    this.prevY = pointer.y;
  }

  private onPointerUp(_pointer: Phaser.Input.Pointer): void {
    if (!this.tracking) return;
    this.tracking = false;

    // Released below the line — cancel
    console.log("Cancel: released below line");
    this.projectile.resetShot();
    this.onCancel?.();
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

  private computeThrow(pointerX: number): ThrowParams {
    // Angle from recent trail points
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

    // LaunchX from pointer position at crossing, clamped to bounds
    const { width } = this.scene.scale;
    const launchX = Phaser.Math.Clamp(
      pointerX,
      width * LAUNCH_X_MIN_PCT,
      width * LAUNCH_X_MAX_PCT,
    );

    return { angle, launchX };
  }
}
