import Phaser from "phaser";
import { FOCAL_LENGTH, LAYOUT, TARGET_RADIUS, TARGET_Y, Depth, LandingTier, juiceIntensity } from "../constants";
import { theme } from "../theme";
import { spawnTargetImpactRing, tierColor } from "../components/ImpactRing";

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
    this.sprite.fillStyle(color, theme.target.fillAlpha);
    this.sprite.fillCircle(0, 0, TARGET_RADIUS);
    this.sprite.lineStyle(theme.target.rimWidth, color, 1);
    this.sprite.strokeCircle(0, 0, TARGET_RADIUS);
  }
}
