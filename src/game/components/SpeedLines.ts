import Phaser from "phaser";
import { Depth, juiceIntensity } from "../constants";
import { theme } from "../theme";
import { juiceFlags } from "../systems/juiceFlags";

/**
 * Velocity-oriented streaks behind the ball during flight.
 * Lines spawn opposite to the ball's screen-space velocity,
 * spread randomly along the perpendicular axis.
 *
 * Intensity scales with screen-space speed (fast dive = dense,
 * slow apex = sparse) and juice intensity (streak multiplier).
 */
export class SpeedLines {
  private scene: Phaser.Scene;
  private lines: Phaser.GameObjects.Graphics[] = [];
  private streak = 0;

  // Previous frame position for velocity computation
  private prevX = 0;
  private prevY = 0;
  private hasPrev = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setStreak(streak: number): void {
    this.streak = streak;
    this.hasPrev = false;
  }

  /** Call each frame with the ball's current screen position. */
  update(x: number, y: number, scale: number): void {
    if (!juiceFlags.speedLines) {
      this.prevX = x;
      this.prevY = y;
      this.hasPrev = true;
      return;
    }

    if (!this.hasPrev) {
      this.prevX = x;
      this.prevY = y;
      this.hasPrev = true;
      return;
    }

    const dx = x - this.prevX;
    const dy = y - this.prevY;
    this.prevX = x;
    this.prevY = y;

    const speed = Math.sqrt(dx * dx + dy * dy);
    const cfg = theme.speedLines;

    // Below minimum speed — don't spawn anything (apex hang)
    if (speed < cfg.minSpeed) return;

    const ji = juiceIntensity(this.streak);

    // Speed factor: 0 at minSpeed, 1 at maxSpeed, clamped
    const speedFactor = Math.min(1, (speed - cfg.minSpeed) / (cfg.maxSpeed - cfg.minSpeed));

    // How many lines this frame
    const count = Math.round(
      cfg.countMin + (cfg.countMax - cfg.countMin) * speedFactor * (0.3 + 0.7 * ji),
    );
    if (count <= 0) return;

    // Normalized velocity direction
    const nx = dx / speed;
    const ny = dy / speed;

    // Perpendicular axis (rotated 90°)
    const px = -ny;
    const py = nx;

    for (let i = 0; i < count; i++) {
      // Random perpendicular offset for spread
      const spread = (Math.random() - 0.5) * 2 * cfg.spreadRadius * scale;

      // Line origin: behind the ball (opposite velocity), offset perpendicularly
      const offsetBack = cfg.spawnBehind * scale;
      const ox = x - nx * offsetBack + px * spread;
      const oy = y - ny * offsetBack + py * spread;

      // Line length scales with speed factor + juice
      const len = cfg.lengthMin + (cfg.lengthMax - cfg.lengthMin) * speedFactor;

      // End point: further behind
      const ex = ox - nx * len * scale;
      const ey = oy - ny * len * scale;

      const alpha = cfg.alpha * (0.3 + 0.7 * ji) * (0.5 + 0.5 * speedFactor);

      const gfx = this.scene.add.graphics();
      gfx.setDepth(Depth.GAME - 1);
      gfx.lineStyle(cfg.width, cfg.color, alpha);
      gfx.beginPath();
      gfx.moveTo(ox, oy);
      gfx.lineTo(ex, ey);
      gfx.strokePath();

      this.lines.push(gfx);

      this.scene.tweens.add({
        targets: gfx,
        alpha: 0,
        duration: cfg.fadeMs,
        ease: "Sine.easeIn",
        onComplete: () => {
          const idx = this.lines.indexOf(gfx);
          if (idx !== -1) this.lines.splice(idx, 1);
          gfx.destroy();
        },
      });
    }

    // Evict oldest if over capacity
    while (this.lines.length > cfg.maxActive) {
      const old = this.lines.shift()!;
      this.scene.tweens.killTweensOf(old);
      old.destroy();
    }
  }

  clear(): void {
    for (const gfx of this.lines) {
      this.scene.tweens.killTweensOf(gfx);
      gfx.destroy();
    }
    this.lines.length = 0;
    this.hasPrev = false;
  }
}
