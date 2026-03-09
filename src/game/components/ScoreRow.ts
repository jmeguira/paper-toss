import Phaser from "phaser";
import { juiceIntensity } from "../constants";
import { theme, typeScale } from "../theme";

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

  hit(): void {
    this.streak++;
    this.streakValue.setText(`${this.streak}`);
    const peak = 1 + 0.15 * juiceIntensity(this.streak);
    this.scalePop(this.streakValue, peak);
  }

  miss(): void {
    this.streak = 0;
    this.streakValue.setText("0");
  }

  getStreak(): number {
    return this.streak;
  }

  setBest(score: number): void {
    this.bestValue.setText(`${score}`);
    const peak = 1 + 0.2 * juiceIntensity(this.streak);
    this.scalePop(this.bestValue, peak);
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
}
