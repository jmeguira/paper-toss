import Phaser from "phaser";
import { Depth, juiceIntensity } from "../constants";
import { theme } from "../theme";
import { juiceFlags } from "../systems/juiceFlags";

/**
 * Glitch effect on miss — chromatic aberration (RGB-offset full-screen rects)
 * layered with staggered scan-line slices. All tuning in theme.glitch.
 */
export function spawnGlitch(
  scene: Phaser.Scene,
  streak: number,
  strong: boolean,
): void {
  if (!juiceFlags.glitch) return;
  const ji = juiceIntensity(streak);
  if (ji <= 0) return;

  const g = theme.glitch;
  const mult = strong ? 1.0 : 0.5;
  const durationMs = g.durationBase + (g.durationCeiling - g.durationBase) * ji;
  spawnChromaticAberration(scene, ji, mult, durationMs);
  spawnScanLineGlitch(scene, ji, mult, durationMs);
}

function spawnChromaticAberration(
  scene: Phaser.Scene,
  ji: number,
  mult: number,
  durationMs: number,
): void {
  const ca = theme.glitch.chromatic;
  const offset = ca.offsetCeiling * ji * mult;
  const alpha = ca.alphaCeiling * ji * mult;
  if (alpha < 0.01) return;

  const { width, height } = scene.scale;

  const layers = [
    { color: 0xff0000, dx: -offset },
    { color: 0x0000ff, dx: offset },
    { color: 0x00ff00, dx: 0 },
  ];

  const graphics: Phaser.GameObjects.Graphics[] = [];
  for (const layer of layers) {
    const gfx = scene.add.graphics();
    gfx.setDepth(Depth.OVERLAY - 1);
    gfx.setAlpha(alpha);
    gfx.fillStyle(layer.color, 1);
    gfx.fillRect(layer.dx, 0, width, height);
    graphics.push(gfx);
  }

  scene.tweens.add({
    targets: graphics,
    alpha: 0,
    duration: durationMs,
    ease: "Sine.easeIn",
    onComplete: () => { for (const gfx of graphics) gfx.destroy(); },
  });
}

function spawnScanLineGlitch(
  scene: Phaser.Scene,
  ji: number,
  mult: number,
  durationMs: number,
): void {
  const s = theme.glitch.slices;
  const maxOffset = s.offsetCeiling * ji * mult;
  const alpha = s.alphaCeiling * ji * mult;
  if (alpha < 0.01) return;

  const { width, height } = scene.scale;
  const maxDelay = durationMs * theme.glitch.staggerPct;

  for (let i = 0; i < s.count; i++) {
    const sliceY = Math.random() * height;
    const sliceH = height * (s.hMinPct + Math.random() * (s.hMaxPct - s.hMinPct));
    const dx = (Math.random() * 2 - 1) * maxOffset;
    const color = i % 2 === 0 ? theme.juice.badHex : 0xffffff;
    const delay = Math.random() * maxDelay;
    const fadeDuration = durationMs - delay;

    const gfx = scene.add.graphics();
    gfx.setDepth(Depth.OVERLAY - 1);
    gfx.setAlpha(0);
    gfx.fillStyle(color, 1);
    gfx.fillRect(dx, sliceY, width, sliceH);

    scene.tweens.add({
      targets: gfx,
      alpha: { from: alpha, to: 0 },
      delay,
      duration: fadeDuration,
      ease: "Quad.easeIn",
      onComplete: () => gfx.destroy(),
    });
  }
}
