import Phaser from "phaser";
import { LandingTier } from "../constants";
import { theme } from "../theme";

/** Display label — collapse near tiers into their parent */
const FEEDBACK_LABEL: Record<LandingTier, string> = {
  PERFECT: "PERFECT",
  HIT: "HIT",
  NEAR_HIT: "HIT",
  NEAR_MISS: "MISS",
  MISS: "MISS",
};

/**
 * Animated feedback text inside the WallPanel.
 * show(tier) displays the tier label instantly, runs a scale punch
 * for PERFECT, then fades out after a hold period.
 */
export class FeedbackZone {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private centerX: number;
  private centerY: number;
  private zoneW: number;
  private zoneH: number;
  private text: Phaser.GameObjects.Text | null = null;

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    this.scene = scene;
    this.container = container;
    this.centerX = x + w / 2;
    this.centerY = y + h / 2;
    this.zoneW = w;
    this.zoneH = h;

    // Border rect (same as before)
    const fb = theme.wallPanel.feedbackZone;
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, fb.border, fb.borderAlpha);
    graphics.strokeRect(x, y, w, h);
    container.add(graphics);
  }

  show(tier: LandingTier): void {
    // Kill any in-progress tweens/text
    if (this.text) {
      this.scene.tweens.killTweensOf(this.text);
      this.text.destroy();
      this.text = null;
    }

    const config = theme.feedback[tier];
    const label = FEEDBACK_LABEL[tier];
    const fontSize = Math.round(this.zoneH * 0.85);

    this.text = this.scene.add.text(this.centerX, this.centerY, label, {
      fontFamily: theme.ui.fontFamily,
      fontStyle: "bold",
      fontSize: `${fontSize}px`,
      color: config.color,
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.text.setOrigin(0.5, 0.5);

    // Clamp: if text is wider than the zone, scale down uniformly
    if (this.text.width > this.zoneW) {
      this.text.setScale(this.zoneW / this.text.width);
    }

    this.container.add(this.text);

    if (config.punchScale > 1) {
      // Scale punch: instant appear oversized, ease down to 1.0, then fade
      this.text.setScale(config.punchScale);
      this.scene.tweens.add({
        targets: this.text,
        scale: 1,
        duration: 200,
        ease: "Back.easeOut",
        onComplete: () => this.fadeOut(config),
      });
    } else {
      this.fadeOut(config);
    }
  }

  private fadeOut(config: { holdMs: number; fadeMs: number }): void {
    if (!this.text) return;

    this.scene.tweens.add({
      targets: this.text,
      alpha: 0,
      delay: config.holdMs,
      duration: config.fadeMs,
      ease: "Sine.easeIn",
      onComplete: () => {
        this.text?.destroy();
        this.text = null;
      },
    });
  }
}
