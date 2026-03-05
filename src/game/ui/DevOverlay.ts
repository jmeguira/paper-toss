import Phaser from "phaser";
import {
  DEV_MODE,
  Depth,
  BALL_REST_Y_PCT,
  ANGLE_BOUNDS_LENGTH_PCT,
  LAUNCH_ANGLE_MAX,
} from "../constants";
import { resolveZones } from "../systems/ShotResolver";

/** Convert our angle convention (0 = up, + = right) to canvas (0 = right, + = CW) */
function toCanvas(angle: number): number {
  return angle - Math.PI / 2;
}

export class DevOverlay {
  private graphics: Phaser.GameObjects.Graphics | null = null;
  private scene: Phaser.Scene;
  private solvedAngle = 0;

  public onPerfectThrow: ((angle: number) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    if (!DEV_MODE) return;

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(Depth.DEV);

    const btn = scene.add.text(scene.scale.width - 16, scene.scale.height - 16, "▶ Perfect", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#00ff88",
      backgroundColor: "#00000066",
      padding: { x: 6, y: 4 },
    });
    btn.setOrigin(1, 1);
    btn.setDepth(Depth.DEV + 1);
    btn.setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      this.onPerfectThrow?.(this.solvedAngle);
    });
  }

  update(windForce: number, targetZ: number): void {
    if (!this.graphics) return;

    const { width, height } = this.scene.scale;
    const originX = width / 2;
    const originY = height * BALL_REST_Y_PCT;
    const arcRadius = height * ANGLE_BOUNDS_LENGTH_PCT * 0.8;

    const zones = resolveZones(targetZ, windForce);
    this.solvedAngle = zones.solvedAngle;

    const [perfL, perfR] = zones.edges.get("PERFECT")!;
    const [hitL, hitR] = zones.edges.get("HIT")!;
    const [targetL, targetR] = zones.edges.get("NEAR_HIT")!;
    const [nmL, nmR] = zones.edges.get("NEAR_MISS")!;

    const MIN_ARC = 0.005;
    const fillSector = (from: number, to: number) => {
      if (Math.abs(to - from) < MIN_ARC) return;
      this.graphics!.slice(originX, originY, arcRadius, toCanvas(from), toCanvas(to), false);
      this.graphics!.fillPath();
    };

    this.graphics.clear();

    // --- Miss (light red, between near-miss and boundaries) ---
    this.graphics.fillStyle(0xff4444, 0.08);
    fillSector(-LAUNCH_ANGLE_MAX, nmL);
    fillSector(nmR, LAUNCH_ANGLE_MAX);

    // --- Buffer indicators (blue, fixed-width slivers flush to boundaries) ---
    this.graphics.fillStyle(0x4488ff, 0.15);
    fillSector(-LAUNCH_ANGLE_MAX, -LAUNCH_ANGLE_MAX + zones.bufferAngleWidth);
    fillSector(LAUNCH_ANGLE_MAX - zones.bufferAngleWidth, LAUNCH_ANGLE_MAX);

    // --- Near-miss (red/amber) ---
    this.graphics.fillStyle(0xff6644, 0.18);
    fillSector(nmL, targetL);
    fillSector(targetR, nmR);

    // --- Near-hit (subtle green) ---
    this.graphics.fillStyle(0x00ff88, 0.14);
    fillSector(targetL, hitL);
    fillSector(hitR, targetR);

    // --- Hit (bright green) ---
    this.graphics.fillStyle(0x00ff88, 0.25);
    fillSector(hitL, hitR);

    // --- Perfect (gold, innermost) ---
    this.graphics.fillStyle(0xffdd44, 0.4);
    fillSector(perfL, perfR);

    // --- Edge lines (radial, at arc radius) ---
    const lineAt = (angle: number, color: number, alpha: number) => {
      const ex = originX + Math.sin(angle) * arcRadius;
      const ey = originY - Math.cos(angle) * arcRadius;
      this.graphics!.lineStyle(1, color, alpha);
      this.graphics!.lineBetween(originX, originY, ex, ey);
    };

    lineAt(nmL, 0xff6644, 0.35);
    lineAt(nmR, 0xff6644, 0.35);
    lineAt(targetL, 0x00ff88, 0.25);
    lineAt(targetR, 0x00ff88, 0.25);
    lineAt(hitL, 0x00ff88, 0.4);
    lineAt(hitR, 0x00ff88, 0.4);
  }
}
