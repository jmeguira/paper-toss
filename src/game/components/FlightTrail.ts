import Phaser from "phaser";
import { BALL_RADIUS, Depth } from "../constants";
import { theme } from "../theme";

/**
 * Ring-buffer trail of squashed afterimage ellipses during flight.
 * Each ghost has a low-alpha fill with brighter dots at top/bottom
 * poles to trace the flight corridor bounds.
 *
 * Alpha is controlled per-shape via fillStyle (not object alpha)
 * so body and channel dots can have independent alphas while
 * fading together via the object's master alpha tween.
 */
export class FlightTrail {
  private scene: Phaser.Scene;
  private ghosts: Phaser.GameObjects.Graphics[] = [];
  private maxCount: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.maxCount = theme.trail.count;
  }

  /** Stamp a ghost at the ball's current screen position and scale. */
  stamp(x: number, y: number, scale: number): void {
    // Evict oldest if at capacity
    if (this.ghosts.length >= this.maxCount) {
      const old = this.ghosts.shift()!;
      this.scene.tweens.killTweensOf(old);
      old.destroy();
    }

    const t = theme.trail;
    const r = BALL_RADIUS * t.sizePct;
    const channelR = t.channelDotRadius;

    const gfx = this.scene.add.graphics();
    gfx.setDepth(Depth.GAME - 1);
    gfx.setPosition(x, y);
    gfx.setScale(scale, scale * t.squash);

    // Outline only — no fill
    gfx.lineStyle(t.strokeWidth, t.color, t.alpha);
    gfx.strokeCircle(0, 0, r);

    // Channel dots at top/bottom poles — brighter
    gfx.fillStyle(t.color, t.channelAlpha);
    gfx.fillCircle(0, -r, channelR);
    gfx.fillCircle(0, r, channelR);

    this.ghosts.push(gfx);

    // Fade the entire object — both body and dots scale proportionally
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: t.fadeMs,
      ease: "Sine.easeIn",
      onComplete: () => {
        const idx = this.ghosts.indexOf(gfx);
        if (idx !== -1) this.ghosts.splice(idx, 1);
        gfx.destroy();
      },
    });
  }

  /** Clear all remaining ghosts immediately. */
  clear(): void {
    for (const gfx of this.ghosts) {
      this.scene.tweens.killTweensOf(gfx);
      gfx.destroy();
    }
    this.ghosts.length = 0;
  }
}
