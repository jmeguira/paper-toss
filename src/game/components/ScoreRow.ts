import Phaser from "phaser";
import { theme, typeScale } from "../theme";

/**
 * Horizontal row: streak (left) | best (center) | difficulty (right).
 * Owns streak counter state. All game objects are added to the provided container.
 */
export class ScoreRow {
  private streakText: Phaser.GameObjects.Text;
  private bestText: Phaser.GameObjects.Text;
  private diffText: Phaser.GameObjects.Text;
  private streak = 0;

  onDifficultyClick?: () => void;

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    left: number,
    center: number,
    right: number,
    y: number,
    difficultyLabel: string,
    bestScore: number,
  ) {
    const ts = typeScale(scene.scale.height);
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: theme.ui.fontFamily,
      fontSize: `${ts.body}px`,
      color: theme.wallPanel.text.color,
      stroke: theme.wallPanel.text.stroke,
      strokeThickness: theme.wallPanel.text.strokeThickness,
    };

    this.streakText = scene.add.text(left, y, "streak:0", style);
    container.add(this.streakText);

    this.bestText = scene.add.text(center, y, `best:${bestScore}`, style);
    this.bestText.setOrigin(0.5, 0);
    container.add(this.bestText);

    this.diffText = scene.add.text(right, y, difficultyLabel, style);
    this.diffText.setOrigin(1, 0);
    this.diffText.setInteractive({ useHandCursor: true });
    this.diffText.on("pointerdown", () => this.onDifficultyClick?.());
    container.add(this.diffText);
  }

  hit(): void {
    this.streak++;
    this.streakText.setText(`streak:${this.streak}`);
  }

  miss(): void {
    this.streak = 0;
    this.streakText.setText("streak:0");
  }

  getStreak(): number {
    return this.streak;
  }

  setBest(score: number): void {
    this.bestText.setText(`best:${score}`);
  }

  setDifficulty(label: string): void {
    this.diffText.setText(label);
  }
}
