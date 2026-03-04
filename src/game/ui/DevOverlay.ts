import Phaser from "phaser";
import {
  DEV_MODE,
  BALL_REST_Y_PCT,
  ANGLE_BOUNDS_LENGTH_PCT,
  FLIGHT_SPEED,
  FLIGHT_LATERAL_MULT,
  PERFECT_RADIUS,
  SWISH_RADIUS,
  HIT_RADIUS,
  NEAR_MISS_RADIUS,
  MISS_BUFFER,
  LAUNCH_ANGLE_MAX,
  flightTime,
} from "../constants";

/**
 * Compute the left/right throw angles that land exactly ±radius from
 * the wind-adjusted center. Clamps to LAUNCH_ANGLE_MAX when the edge
 * falls outside the reachable cone.
 */
function channelEdges(
  radius: number,
  windDrift: number,
  flightTime: number,
  maxVx: number,
): [number, number] {
  const vxLeft = (-radius - windDrift) / flightTime;
  const vxRight = (radius - windDrift) / flightTime;

  const rawLeft = vxLeft / maxVx;
  const rawRight = vxRight / maxVx;

  const angleLeft =
    Math.abs(rawLeft) <= 1
      ? Math.asin(rawLeft)
      : Math.sign(rawLeft) * LAUNCH_ANGLE_MAX;
  const angleRight =
    Math.abs(rawRight) <= 1
      ? Math.asin(rawRight)
      : Math.sign(rawRight) * LAUNCH_ANGLE_MAX;

  return [angleLeft, angleRight];
}

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
    this.graphics.setDepth(200);

    const btn = scene.add.text(scene.scale.width - 16, scene.scale.height - 16, "▶ Perfect", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#00ff88",
      backgroundColor: "#00000066",
      padding: { x: 6, y: 4 },
    });
    btn.setOrigin(1, 1);
    btn.setDepth(201);
    btn.setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      this.onPerfectThrow?.(this.solvedAngle);
    });
  }

  update(windForce: number): void {
    if (!this.graphics) return;

    const { width, height } = this.scene.scale;
    const originX = width / 2;
    const originY = height * BALL_REST_Y_PCT;
    const arcRadius = height * ANGLE_BOUNDS_LENGTH_PCT * 0.8;

    const wy0 = height * (1 - BALL_REST_Y_PCT);
    const ft = flightTime(wy0);
    const windDrift = 0.5 * windForce * ft * ft;
    const maxVx = FLIGHT_SPEED * FLIGHT_LATERAL_MULT;

    // Solved angle — dead center hit (stored for perfect throw button)
    this.solvedAngle = Math.asin(
      Phaser.Math.Clamp(-windDrift / ft / maxVx, -1, 1),
    ) as number;

    // Edge angles for each zone
    const [perfL, perfR] = channelEdges(PERFECT_RADIUS, windDrift, ft, maxVx);
    const [swishL, swishR] = channelEdges(SWISH_RADIUS, windDrift, ft, maxVx);
    const [hitL, hitR] = channelEdges(HIT_RADIUS, windDrift, ft, maxVx);
    const [nmL, nmR] = channelEdges(NEAR_MISS_RADIUS, windDrift, ft, maxVx);

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
    // Angular width of MISS_BUFFER is wind-independent — purely a function of
    // flight physics. Shows exactly how much padding the wind cap buys us.
    const bufAngleWidth = LAUNCH_ANGLE_MAX - Math.asin(
      Math.sin(LAUNCH_ANGLE_MAX) - MISS_BUFFER / (maxVx * ft),
    );
    this.graphics.fillStyle(0x4488ff, 0.15);
    fillSector(-LAUNCH_ANGLE_MAX, -LAUNCH_ANGLE_MAX + bufAngleWidth);
    fillSector(LAUNCH_ANGLE_MAX - bufAngleWidth, LAUNCH_ANGLE_MAX);

    // --- Near-miss (red/amber) ---
    this.graphics.fillStyle(0xff6644, 0.18);
    fillSector(nmL, hitL);
    fillSector(hitR, nmR);

    // --- Hit (subtle green) ---
    this.graphics.fillStyle(0x00ff88, 0.14);
    fillSector(hitL, swishL);
    fillSector(swishR, hitR);

    // --- Swish (bright green) ---
    this.graphics.fillStyle(0x00ff88, 0.25);
    fillSector(swishL, swishR);

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
    lineAt(hitL, 0x00ff88, 0.25);
    lineAt(hitR, 0x00ff88, 0.25);
    lineAt(swishL, 0x00ff88, 0.4);
    lineAt(swishR, 0x00ff88, 0.4);
  }
}
