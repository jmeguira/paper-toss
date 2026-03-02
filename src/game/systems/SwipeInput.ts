import Phaser from "phaser";
import { ThrowParams } from "../types";
import {
  SWIPE_CANCEL_THRESHOLD_PCT,
  SWIPE_MIN_DISTANCE_PCT,
  SWIPE_MIN_SPEED,
  SWIPE_MAX_SAMPLES,
} from "../constants";

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export class SwipeInput {
  private scene: Phaser.Scene;
  private trail: TrailPoint[] = [];
  private tracking = false;
  private startY = 0;

  public onThrow: ((params: ThrowParams) => void) | null = null;
  public onCancel: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    scene.input.on("pointerdown", this.onPointerDown, this);
    scene.input.on("pointermove", this.onPointerMove, this);
    scene.input.on("pointerup", this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    this.trail = [];
    this.tracking = true;
    this.startY = pointer.y;
    this.addPoint(pointer);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.tracking) return;
    this.addPoint(pointer);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.tracking) return;
    this.tracking = false;
    this.addPoint(pointer);

    const h = this.scene.scale.height;
    const cancelThreshold = h * SWIPE_CANCEL_THRESHOLD_PCT;

    // Deliberate downward swipe = cancel
    if (pointer.y > this.startY + cancelThreshold) {
      console.log("Cancel: swipe down");
      this.onCancel?.();
      return;
    }

    if (this.trail.length < 2) {
      console.log("Cancel: too few points");
      this.onCancel?.();
      return;
    }

    const first = this.trail[0];
    const last = this.trail[this.trail.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Too short = cancel
    const minDistance = h * SWIPE_MIN_DISTANCE_PCT;
    if (dist < minDistance) {
      console.log("Cancel: too short", dist.toFixed(1), "<", minDistance.toFixed(1));
      this.onCancel?.();
      return;
    }

    // Too slow = cancel
    const dt = (last.time - first.time) / 1000;
    const speed = dt > 0 ? dist / dt : 0;
    if (speed < SWIPE_MIN_SPEED) {
      console.log("Cancel: too slow", speed.toFixed(0), "px/s");
      this.onCancel?.();
      return;
    }

    const params = this.computeThrow();
    console.log("Throw!", params, `(${speed.toFixed(0)} px/s)`);
    this.onThrow?.(params);
  }

  private addPoint(pointer: Phaser.Input.Pointer): void {
    if (this.trail.length >= SWIPE_MAX_SAMPLES) return;
    this.trail.push({ x: pointer.x, y: pointer.y, time: pointer.event.timeStamp });
  }

  private computeThrow(): ThrowParams {
    const first = this.trail[0];
    const last = this.trail[this.trail.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    return { angle: Math.atan2(dx, -dy) };
  }
}
