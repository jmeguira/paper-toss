import Phaser from "phaser";
import { ThrowParams, InputMode, SwipeModeType } from "../types";
import { Projectile } from "../objects/Projectile";
import { ThrowAngle } from "../components/ThrowAngle";
import { log } from "./logger";
import {
  BALL_PICKUP_RADIUS_PCT,
  BALL_TOUCH_SCALE,
  BALL_TOUCH_PULSE_MS,
  LAUNCH_ANGLE_MAX,
  SWIPE_MIN_SPEED,
  SWIPE_MAX_SAMPLES,
  SWIPE_TRIM_END,
  SWIPE_FIT_POINTS,
  Depth,
} from "../constants";
import { theme } from "../theme";

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export class SwipeInput implements InputMode {
  private scene: Phaser.Scene;
  private projectile: Projectile;
  private throwAngle: ThrowAngle;
  private trail: TrailPoint[] = [];
  private tracking = false;
  private enabled = false;
  private pulseTween: Phaser.Tweens.Tween | null = null;

  private swipeMode: SwipeModeType = "instant";
  private pendingAngle: number | null = null;
  private launchBtn: Phaser.GameObjects.Text;

  public onThrow: ((params: ThrowParams) => void) | null = null;

  constructor(scene: Phaser.Scene, projectile: Projectile, throwAngle: ThrowAngle) {
    this.scene = scene;
    this.projectile = projectile;
    this.throwAngle = throwAngle;

    // Launch button for aim mode — always created, hidden until armed
    const { width, height } = scene.scale;
    this.launchBtn = scene.add
      .text(width / 2, height * 0.93, "LAUNCH", {
        fontFamily: theme.ui.fontFamily,
        fontSize: "22px",
        color: theme.ui.text.primary,
        backgroundColor: theme.ui.button.bg,
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setDepth(Depth.CONTROLS)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.launchBtn.on("pointerdown", () => {
      if (this.pendingAngle === null) return;
      this.firePending();
    });
  }

  setSwipeMode(mode: SwipeModeType): void {
    this.swipeMode = mode;
    this.clearPending();
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
    this.pendingAngle = null;
    this.launchBtn.setVisible(false);

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

    const pts = this.getRecentPoints();
    const isValidSwipe =
      pts.length >= 2 &&
      pts[pts.length - 1].y < pts[0].y &&
      this.computeSpeed() >= SWIPE_MIN_SPEED;

    this.pulseTween?.stop();
    this.projectile.sprite.setScale(1);

    if (this.swipeMode === "instant") {
      if (!isValidSwipe) return;
      this.fireInstant(pts);
      return;
    }

    // --- Aim mode ---
    if (isValidSwipe) {
      const params = this.computeThrow();
      this.pendingAngle = params.angle;
      this.throwAngle.show(params.angle);
      this.launchBtn.setVisible(true);
      log(`Aim: ${Phaser.Math.RadToDeg(params.angle).toFixed(1)}° (swipe to adjust, tap LAUNCH to fire)`);
    }
    // Non-swipe gestures (taps) are ignored — only the launch button fires
  }

  private firePending(): void {
    if (this.pendingAngle === null) return;

    const angle = this.pendingAngle;
    this.clearPending();

    const params = { angle, launchX: this.scene.scale.width / 2 };
    log(`Throw! angle=${Phaser.Math.RadToDeg(angle).toFixed(1)}° (aim mode)`);
    this.onThrow?.(params);
  }

  private fireInstant(pts: TrailPoint[]): void {
    const params = this.computeThrow();
    log(
      `Throw! angle=${Phaser.Math.RadToDeg(params.angle).toFixed(1)}° trail=${this.trail.length} used=${pts.length}`,
    );
    this.onThrow?.(params);
  }

  private clearPending(): void {
    this.pendingAngle = null;
    this.throwAngle.hide();
    this.launchBtn.setVisible(false);
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

  /** Get the usable trail points: trimmed and capped to fit window. */
  private getRecentPoints(): TrailPoint[] {
    const end = Math.max(0, this.trail.length - SWIPE_TRIM_END);
    const start = Math.max(0, end - SWIPE_FIT_POINTS);
    return this.trail.slice(start, end);
  }

  private computeSpeed(): number {
    const pts = this.getRecentPoints();
    if (pts.length < 2) return 0;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dt = (last.time - first.time) / 1000;
    return dt > 0 ? dist / dt : 0;
  }

  private computeThrow(): ThrowParams {
    const pts = this.getRecentPoints();

    let rawAngle: number;

    if (pts.length < 3) {
      // Too few points for a fit — fall back to first-to-last
      const first = pts[0];
      const last = pts[pts.length - 1];
      rawAngle = Math.atan2(last.x - first.x, -(last.y - first.y));
    } else {
      // Least-squares fit: x as a function of y
      // slope = (nΣxy - ΣxΣy) / (nΣy² - (Σy)²)
      const n = pts.length;
      let sumY = 0, sumX = 0, sumYY = 0, sumXY = 0;
      for (const p of pts) {
        sumY += p.y;
        sumX += p.x;
        sumYY += p.y * p.y;
        sumXY += p.x * p.y;
      }
      const denom = n * sumYY - sumY * sumY;
      // dxdy = how much x changes per unit y (lateral drift per vertical travel)
      const dxdy = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;

      // Convert to angle: atan2(lateral, -vertical)
      // A swipe going straight up has dxdy=0 → angle=0
      // dxdy is dx/dy, so for a unit of -dy (upward), dx = -dxdy
      rawAngle = Math.atan2(-dxdy, 1);
    }

    const angle = Phaser.Math.Clamp(rawAngle, -LAUNCH_ANGLE_MAX, LAUNCH_ANGLE_MAX);
    const { width } = this.scene.scale;
    const launchX = width / 2;

    return { angle, launchX };
  }
}
