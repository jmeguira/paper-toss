import Phaser from "phaser";
import { LandingTier, juiceIntensity } from "../constants";
import { theme, typeScale } from "../theme";
import { juiceFlags } from "../systems/juiceFlags";

/**
 * Horizontal row: STREAK: n (left) | BEST: n (right).
 * Owns streak counter state. All game objects are added to the provided container.
 * Scale pop targets the value text only — labels stay static.
 */
export class ScoreRow {
  private scene: Phaser.Scene;
  private streakValue: Phaser.GameObjects.Text;
  private bestValue: Phaser.GameObjects.Text;
  private streak = 0;

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    left: number,
    right: number,
    y: number,
    bestScore: number,
  ) {
    this.scene = scene;
    const ts = typeScale(scene.scale.height);
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: theme.ui.fontFamily,
      fontSize: `${ts.body}px`,
      color: theme.wallPanel.text.color,
      stroke: theme.wallPanel.text.stroke,
      strokeThickness: theme.wallPanel.text.strokeThickness,
    };

    // --- Streak (left-aligned): STREAK: n ---
    const streakLabel = scene.add.text(left, y, "STREAK:", labelStyle);
    this.streakValue = scene.add.text(
      streakLabel.x + streakLabel.width + 4, y,
      "0", labelStyle,
    );
    container.add(streakLabel);
    container.add(this.streakValue);

    // --- Best (right-aligned): BEST: n ---
    this.bestValue = scene.add.text(right, y, `${bestScore}`, labelStyle);
    this.bestValue.setOrigin(1, 0);
    const bestLabel = scene.add.text(
      this.bestValue.x - this.bestValue.width - 4, y,
      "BEST:", labelStyle,
    );
    bestLabel.setOrigin(1, 0);
    container.add(bestLabel);
    container.add(this.bestValue);
  }

  hit(tier: LandingTier): void {
    this.streak++;
    this.streakValue.setText(`${this.streak}`);
    if (juiceFlags.scorePop) {
      const peak = 1 + 0.15 * juiceIntensity(this.streak);
      this.scalePop(this.streakValue, peak);
      this.colorFlash(this.streakValue, tier);
    }
  }

  miss(): void {
    this.streak = 0;
    this.streakValue.setText("0");
  }

  getStreak(): number {
    return this.streak;
  }

  setBest(score: number, tier?: LandingTier): void {
    this.bestValue.setText(`${score}`);
    if (tier && juiceFlags.scorePop) {
      const peak = 1 + 0.2 * juiceIntensity(this.streak);
      this.scalePop(this.bestValue, peak);
      this.colorFlash(this.bestValue, tier);
    }
  }

  private scalePop(target: Phaser.GameObjects.Text, peakScale: number): void {
    this.scene.tweens.killTweensOf(target);
    target.setScale(1);
    this.scene.tweens.chain({
      targets: target,
      tweens: [
        { scale: peakScale, duration: 80, ease: "Quad.easeOut" },
        { scale: 1, duration: 200, ease: "Sine.easeInOut" },
      ],
    });
  }

  /** Flash the text to the tier's feedback color, then fade back to neutral. Synced with feedback text timing. */
  private colorFlash(target: Phaser.GameObjects.Text, tier: LandingTier): void {
    const config = theme.feedback[tier];
    if (!config) return;
    target.setColor(config.color);
    this.scene.time.delayedCall(config.holdMs, () => {
      target.setColor(theme.juice.neutral);
    });
  }
}
