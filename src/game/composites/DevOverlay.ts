import Phaser from "phaser";
import { DEV_MODE, Depth, LandingTier } from "../constants";
import { ZoneOverlay } from "../components/ZoneOverlay";
import { DevThrowButtons } from "../components/DevThrowButtons";
import { resolveZones, ZoneInfo } from "../systems/ShotResolver";

/**
 * Dev-mode composition layer.
 * Owns the single call to resolveZones — passes results down to
 * ZoneOverlay for drawing and to button callbacks for angle computation.
 */
export class DevOverlay {
  private zoneOverlay: ZoneOverlay | null = null;
  private throwButtons: DevThrowButtons | null = null;
  private zones: ZoneInfo | null = null;

  public onThrow: ((angle: number) => void) | null = null;

  constructor(scene: Phaser.Scene, buttonX: number, buttonY: number) {
    if (!DEV_MODE) return;

    this.zoneOverlay = new ZoneOverlay(scene, Depth.DEV);

    const bandMidAngle = (
      tier: LandingTier,
      innerTier: LandingTier | null,
    ): number => {
      if (!this.zones) return 0;

      const [outerL, outerR] = this.zones.edges.get(tier) ?? [0, 0];

      let innerL: number;
      let innerR: number;
      if (innerTier) {
        [innerL, innerR] = this.zones.edges.get(innerTier) ?? [0, 0];
      } else {
        innerL = this.zones.solvedAngle;
        innerR = this.zones.solvedAngle;
      }

      const leftMid = (outerL + innerL) / 2;
      const rightMid = (outerR + innerR) / 2;
      return Math.random() < 0.5 ? leftMid : rightMid;
    };

    this.throwButtons = new DevThrowButtons(
      scene,
      Depth.DEV + 1,
      buttonX,
      buttonY,
      [
        {
          label: "P",
          getAngle: () => this.zones?.solvedAngle ?? 0,
        },
        {
          label: "H",
          getAngle: () => bandMidAngle("HIT", "PERFECT"),
        },
        {
          label: "NH",
          getAngle: () => bandMidAngle("NEAR_HIT", "HIT"),
        },
        {
          label: "NM",
          getAngle: () => bandMidAngle("NEAR_MISS", "NEAR_HIT"),
        },
      ],
    );
    this.throwButtons.onThrow = (angle) => this.onThrow?.(angle);
  }

  update(windForce: number, targetZ: number): void {
    this.zones = resolveZones(targetZ, windForce);
    this.zoneOverlay?.draw(this.zones);
  }

  show(): void {
    this.zoneOverlay?.show();
    this.throwButtons?.show();
  }

  hide(): void {
    this.zoneOverlay?.hide();
    this.throwButtons?.hide();
  }
}
