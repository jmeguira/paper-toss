import Phaser from "phaser";
import { FOCAL_LENGTH, LAYOUT, TARGET_RADIUS, TARGET_Y, Depth, LandingTier, juiceIntensity } from "../constants";
import { theme } from "../theme";
import { spawnTargetImpactRing, tierColor } from "../components/ImpactRing";
import { juiceFlags } from "../systems/juiceFlags";

// Target reaction tuning
const PUNCH_BASE = 1.05;
const PUNCH_CEILING = 1.2;
const PUNCH_DURATION = 120;
const SETTLE_DURATION = 200;

export class Target {
  public sprite: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private baseScaleX = 1;
  private baseScaleY = 1;

  constructor(scene: Phaser.Scene, targetZ: number) {
    this.scene = scene;
    this.sprite = scene.add.graphics();
    this.sprite.setDepth(Depth.GAME);
    this.drawRing(theme.target.primary);
    this.setDistance(targetZ);
  }

  setDistance(z: number): void {
    const { width, height } = this.scene.scale;
    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z);
    const vanishY = height * LAYOUT.VANISH_Y_PCT;
    const groundY = vanishY + (height - vanishY) * scale;
    const y = groundY - TARGET_Y * scale;

    this.baseScaleX = scale;
    this.baseScaleY = scale * theme.target.squash;
    this.sprite.setPosition(width / 2, y);
    this.sprite.setScale(this.baseScaleX, this.baseScaleY);
  }

  /** React to a landing — color flash always (except MISS), punch + ring on NEAR_HIT or better. */
  onLanding(tier: LandingTier, streak: number): void {
    if (tier === "MISS") return;
    if (!juiceFlags.targetReaction) return;

    const color = tierColor(tier);

    // Color flash — synced with feedback text hold duration
    const flashMs = theme.feedback[tier]?.holdMs ?? 400;
    this.drawRing(color);
    this.scene.time.delayedCall(flashMs, () => {
      this.drawRing(theme.target.primary);
    });

    // NEAR_MISS gets the color pulse only — no punch or ring
    if (tier === "NEAR_MISS") return;

    // Scale punch
    const ji = juiceIntensity(streak);
    const punch = PUNCH_BASE + (PUNCH_CEILING - PUNCH_BASE) * ji;
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.chain({
      targets: this.sprite,
      tweens: [
        {
          scaleX: this.baseScaleX * punch,
          scaleY: this.baseScaleY * punch,
          duration: PUNCH_DURATION,
          ease: "Quad.easeOut",
        },
        {
          scaleX: this.baseScaleX,
          scaleY: this.baseScaleY,
          duration: SETTLE_DURATION,
          ease: "Sine.easeInOut",
        },
      ],
    });

    // Impact ring expanding from the rim, squashed to match perspective
    const rimRadius = TARGET_RADIUS * this.baseScaleX;
    spawnTargetImpactRing(
      this.scene,
      this.sprite.x,
      this.sprite.y,
      tier,
      streak,
      theme.target.squash,
      rimRadius,
    );
  }

  private drawRing(color: number): void {
    this.sprite.clear();
    const ch = theme.target.channel;
    const r = TARGET_RADIUS;
    const endY = r * ch.length / theme.target.squash;
    const endR = r * ch.spread;

    const chStroke = theme.target.rimWidth * ch.strokeScale;
    const chAlpha = ch.alphaScale;

    // 1. Bottom exit ring — opaque dark fill, subtler stroke than top ring
    this.sprite.fillStyle(ch.bgColor, ch.bgAlpha);
    this.sprite.fillCircle(0, endY, endR);
    this.sprite.lineStyle(chStroke, color, chAlpha);
    this.sprite.strokeCircle(0, endY, endR);

    // 2. Opaque backdrop — trapezoid narrowing from rim to bottom.
    //    Covers the top half of the bottom ring + grid/wall lines.
    this.sprite.fillStyle(ch.bgColor, ch.bgAlpha);
    this.sprite.fillTriangle(-r, 0, r, 0, endR, endY);
    this.sprite.fillTriangle(-r, 0, endR, endY, -endR, endY);
    this.sprite.fillCircle(0, 0, r);

    // 3. Vortex depth rings — evenly spaced down the channel, fading deeper
    for (let i = 1; i <= ch.vortexRings; i++) {
      const t = i / (ch.vortexRings + 1);
      const ringY = endY * t;
      const ringR = r + (endR - r) * t;
      const ringAlpha = ch.vortexAlpha * (1 - t);
      this.sprite.lineStyle(ch.vortexWidth, color, ringAlpha);
      this.sprite.strokeCircle(0, ringY, ringR);
    }

    // 4. Channel side lines — subtler than target rim
    this.sprite.lineStyle(chStroke, color, chAlpha);
    this.sprite.lineBetween(-r, 0, -endR, endY);
    this.sprite.lineBetween(r, 0, endR, endY);

    // 5. Top target ring — drawn last, on top of everything
    this.sprite.fillStyle(color, theme.target.fillAlpha);
    this.sprite.fillCircle(0, 0, r);
    this.sprite.lineStyle(theme.target.rimWidth, color, 1);
    this.sprite.strokeCircle(0, 0, r);
  }
}
