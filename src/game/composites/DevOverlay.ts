import Phaser from "phaser";
import { DEV_MODE, Depth } from "../constants";
import { ZoneOverlay } from "../components/ZoneOverlay";
import { PerfectThrowButton } from "../components/PerfectThrowButton";

/**
 * Dev-mode composition layer.
 * Assembles dev components (zone overlay, perfect throw button, etc.)
 * and gates them behind DEV_MODE.
 */
export class DevOverlay {
  private zoneOverlay: ZoneOverlay | null = null;
  private perfectBtn: PerfectThrowButton | null = null;

  public onPerfectThrow: ((angle: number) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    if (!DEV_MODE) return;

    this.zoneOverlay = new ZoneOverlay(scene, Depth.DEV);

    this.perfectBtn = new PerfectThrowButton(scene, Depth.DEV + 1);
    this.perfectBtn.getSolvedAngle = () => this.zoneOverlay?.solvedAngle ?? 0;
    this.perfectBtn.onThrow = (angle) => this.onPerfectThrow?.(angle);
  }

  update(windForce: number, targetZ: number): void {
    this.zoneOverlay?.update(windForce, targetZ);
  }
}
