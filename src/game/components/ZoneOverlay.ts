import Phaser from "phaser";
import {
  BALL_REST_Y_PCT,
  ANGLE_BOUNDS_LENGTH_PCT,
  LAUNCH_ANGLE_MAX,
} from "../constants";
import { ZoneInfo } from "../systems/ShotResolver";
import { theme } from "../theme";

/** Convert our angle convention (0 = up, + = right) to canvas (0 = right, + = CW) */
function toCanvas(angle: number): number {
  return angle - Math.PI / 2;
}

/**
 * Arc-sector visualization of all landing zones.
 * Pure visual component — receives pre-computed ZoneInfo, just draws.
 */
export class ZoneOverlay {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, depth: number) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(depth);
  }

  draw(zones: ZoneInfo): void {
    const { width, height } = this.scene.scale;
    const originX = width / 2;
    const originY = height * BALL_REST_Y_PCT;
    const arcRadius = height * ANGLE_BOUNDS_LENGTH_PCT * 0.8;

    const [perfL, perfR] = zones.edges.get("PERFECT")!;
    const [hitL, hitR] = zones.edges.get("HIT")!;
    const [targetL, targetR] = zones.edges.get("NEAR_HIT")!;
    const [nmL, nmR] = zones.edges.get("NEAR_MISS")!;

    const MIN_ARC = 0.005;
    const fillSector = (from: number, to: number) => {
      if (Math.abs(to - from) < MIN_ARC) return;
      this.graphics.slice(originX, originY, arcRadius, toCanvas(from), toCanvas(to), false);
      this.graphics.fillPath();
    };

    this.graphics.clear();

    const z = theme.zones;

    // --- Miss (between near-miss and boundaries) ---
    this.graphics.fillStyle(z.miss.fill, z.miss.alpha);
    fillSector(-LAUNCH_ANGLE_MAX, nmL);
    fillSector(nmR, LAUNCH_ANGLE_MAX);

    // --- Buffer indicators (slivers flush to boundaries) ---
    this.graphics.fillStyle(z.buffer.fill, z.buffer.alpha);
    fillSector(-LAUNCH_ANGLE_MAX, -LAUNCH_ANGLE_MAX + zones.bufferAngleWidth);
    fillSector(LAUNCH_ANGLE_MAX - zones.bufferAngleWidth, LAUNCH_ANGLE_MAX);

    // --- Near-miss ---
    this.graphics.fillStyle(z.nearMiss.fill, z.nearMiss.alpha);
    fillSector(nmL, targetL);
    fillSector(targetR, nmR);

    // --- Near-hit ---
    this.graphics.fillStyle(z.nearHit.fill, z.nearHit.alpha);
    fillSector(targetL, hitL);
    fillSector(hitR, targetR);

    // --- Hit ---
    this.graphics.fillStyle(z.hit.fill, z.hit.alpha);
    fillSector(hitL, hitR);

    // --- Perfect ---
    this.graphics.fillStyle(z.perfect.fill, z.perfect.alpha);
    fillSector(perfL, perfR);

    // --- Edge lines (radial, at arc radius) ---
    const lineAt = (angle: number, color: number, alpha: number) => {
      const ex = originX + Math.sin(angle) * arcRadius;
      const ey = originY - Math.cos(angle) * arcRadius;
      this.graphics.lineStyle(1, color, alpha);
      this.graphics.lineBetween(originX, originY, ex, ey);
    };

    lineAt(nmL, z.nearMiss.edge, z.nearMiss.edgeAlpha);
    lineAt(nmR, z.nearMiss.edge, z.nearMiss.edgeAlpha);
    lineAt(targetL, z.nearHit.edge, z.nearHit.edgeAlpha);
    lineAt(targetR, z.nearHit.edge, z.nearHit.edgeAlpha);
    lineAt(hitL, z.hit.edge, z.hit.edgeAlpha);
    lineAt(hitR, z.hit.edge, z.hit.edgeAlpha);
  }

  show(): void {
    this.graphics.setVisible(true);
  }

  hide(): void {
    this.graphics.setVisible(false);
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
