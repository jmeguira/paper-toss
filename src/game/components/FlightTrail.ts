import Phaser from "phaser";
import { BALL_RADIUS, Depth, juiceIntensity } from "../constants";
import { theme } from "../theme";
import { juiceFlags } from "../systems/juiceFlags";

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
  private streak = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Set the current streak — controls trail intensity and length. */
  setStreak(streak: number): void {
    this.streak = streak;
  }

  /** Stamp a ghost at the ball's current screen position and scale. */
  stamp(x: number, y: number, scale: number): void {
    if (!juiceFlags.flightTrail) return;

    const ji = juiceIntensity(this.streak);
    const t = theme.trail;

    // At streak 0, minimal trail — scale alpha and fade with juice
    const alphaScale = 0.3 + 0.7 * ji;    // 30% at streak 0, 100% at full juice
    const fadeScale = 0.4 + 0.6 * ji;     // 40% duration at streak 0, 100% at full juice
    const maxCount = Math.round(t.count * (0.3 + 0.7 * ji));

    // Evict oldest if at capacity
    while (this.ghosts.length >= maxCount) {
      const old = this.ghosts.shift()!;
      this.scene.tweens.killTweensOf(old);
      old.destroy();
    }

    const r = BALL_RADIUS * t.sizePct;

    const gfx = this.scene.add.graphics();
    gfx.setDepth(Depth.GAME - 1);
    gfx.setPosition(x, y);
    gfx.setScale(scale, scale * t.squash);

    // Soft filled afterimage
    gfx.fillStyle(t.color, t.alpha * alphaScale);
    gfx.fillCircle(0, 0, r);

    this.ghosts.push(gfx);

    // Fade the entire object
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: t.fadeMs * fadeScale,
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
