import Phaser from "phaser";
import { LandingTier, Depth, juiceIntensity } from "../constants";
import { theme } from "../theme";

/** Map landing tier to juice hex color */
const TIER_COLOR: Record<string, number> = {
  PERFECT: theme.juice.perfectHex,
  HIT: theme.juice.goodHex,
  NEAR_HIT: theme.juice.goodHex,
  NEAR_MISS: theme.juice.badHex,
  MISS: theme.juice.badHex,
};

export function tierColor(tier: LandingTier): number {
  return TIER_COLOR[tier] ?? theme.juice.goodHex;
}

/** Impact ring at the ball's landing position. */
export function spawnBallImpactRing(
  scene: Phaser.Scene,
  x: number,
  y: number,
  tier: LandingTier,
  streak: number,
  squashY = 1,
): void {
  const cfg = theme.impactRing.ball;
  spawnRing(scene, x, y, tier, streak, cfg, squashY, cfg.radius);
}

/** Impact ring expanding from the target rim. */
export function spawnTargetImpactRing(
  scene: Phaser.Scene,
  x: number,
  y: number,
  tier: LandingTier,
  streak: number,
  squashY: number,
  rimRadius: number,
): void {
  const cfg = theme.impactRing.target;
  spawnRing(scene, x, y, tier, streak, cfg, squashY, rimRadius);
}

interface RingConfig {
  lineWidth: number;
  scaleBase: number;
  scaleCeiling: number;
  alphaBase: number;
  alphaCeiling: number;
  durationMs: number;
}

function spawnRing(
  scene: Phaser.Scene,
  x: number,
  y: number,
  tier: LandingTier,
  streak: number,
  cfg: RingConfig,
  squashY: number,
  radius: number,
): void {
  const ji = juiceIntensity(streak);
  const color = TIER_COLOR[tier] ?? theme.juice.goodHex;
  const growthMult = cfg.scaleBase + (cfg.scaleCeiling - cfg.scaleBase) * ji;
  const startAlpha = cfg.alphaBase + (cfg.alphaCeiling - cfg.alphaBase) * ji;

  const gfx = scene.add.graphics();
  gfx.setDepth(Depth.GAME + 1);
  gfx.setPosition(x, y);
  gfx.setAlpha(startAlpha);
  gfx.setScale(1, squashY);
  gfx.lineStyle(cfg.lineWidth, color, 1);
  gfx.strokeCircle(0, 0, radius);

  scene.tweens.add({
    targets: gfx,
    scaleX: growthMult,
    scaleY: growthMult * squashY,
    alpha: 0,
    duration: cfg.durationMs,
    ease: "Quad.easeOut",
    onComplete: () => gfx.destroy(),
  });
}
