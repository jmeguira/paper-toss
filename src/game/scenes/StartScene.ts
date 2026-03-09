import Phaser from "phaser";
import { DIFFICULTIES, Depth, DifficultyId, DEFAULT_DIFFICULTY } from "../constants";
import { HighScoreStore } from "../systems/HighScoreStore";
import { theme, typeScale } from "../theme";

export class StartScene extends Phaser.Scene {
  private highScores!: HighScoreStore;
  private selectedId: DifficultyId = DEFAULT_DIFFICULTY.id;
  private diffButtons: Phaser.GameObjects.Text[] = [];
  private highScoreLabel!: Phaser.GameObjects.Text;

  constructor() {
    super("Start");
  }

  create(): void {
    this.highScores = new HighScoreStore();
    const { width, height } = this.scale;
    const ts = typeScale(height);
    const cx = width / 2;

    // Title
    this.add
      .text(cx, height * 0.2, "PAPER TOSS", {
        fontFamily: theme.ui.fontFamily,
        fontSize: `${ts.heading}px`,
        color: theme.ui.text.primary,
        stroke: theme.ui.score.stroke,
        strokeThickness: theme.ui.score.strokeThickness,
      })
      .setOrigin(0.5)
      .setDepth(Depth.HUD);

    // Difficulty buttons
    const buttonY = height * 0.42;
    const buttonSpacing = 80;
    const startX = cx - buttonSpacing; // 3 buttons centered

    this.diffButtons = DIFFICULTIES.map((diff, i) => {
      const btn = this.add
        .text(startX + i * buttonSpacing, buttonY, diff.label, {
          fontFamily: theme.ui.fontFamily,
          fontSize: `${ts.body}px`,
          color: theme.ui.text.secondary,
          backgroundColor: theme.ui.button.bgMuted,
          padding: { x: 10, y: 8 },
        })
        .setOrigin(0.5)
        .setDepth(Depth.HUD)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => this.selectDifficulty(diff.id));
      return btn;
    });

    // High score label
    this.highScoreLabel = this.add
      .text(cx, height * 0.55, "", {
        fontFamily: theme.ui.fontFamily,
        fontSize: `${ts.body}px`,
        color: theme.ui.text.dim,
      })
      .setOrigin(0.5)
      .setDepth(Depth.HUD);

    // Play button
    const playBtn = this.add
      .text(cx, height * 0.7, "PLAY", {
        fontFamily: theme.ui.fontFamily,
        fontSize: `${ts.heading}px`,
        color: theme.ui.text.primary,
        backgroundColor: theme.ui.button.bg,
        padding: { x: 32, y: 14 },
      })
      .setOrigin(0.5)
      .setDepth(Depth.HUD)
      .setInteractive({ useHandCursor: true });

    playBtn.on("pointerdown", () => {
      this.scene.start("Game", { difficultyId: this.selectedId });
    });

    // Apply initial selection
    this.selectDifficulty(this.selectedId);
  }

  private selectDifficulty(id: DifficultyId): void {
    this.selectedId = id;

    // Update button highlights
    DIFFICULTIES.forEach((diff, i) => {
      const btn = this.diffButtons[i];
      if (diff.id === id) {
        btn.setColor(theme.ui.text.primary);
        btn.setBackgroundColor(theme.ui.button.bgHover);
      } else {
        btn.setColor(theme.ui.text.secondary);
        btn.setBackgroundColor(theme.ui.button.bgMuted);
      }
    });

    // Update high score display
    const best = this.highScores.get(id);
    this.highScoreLabel.setText(best > 0 ? `Best: ${best}` : "No score yet");
  }
}
