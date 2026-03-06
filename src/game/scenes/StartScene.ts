import Phaser from "phaser";
import { DIFFICULTIES, Depth, DifficultyId, DEFAULT_DIFFICULTY } from "../constants";
import { HighScoreStore } from "../systems/HighScoreStore";
import { theme } from "../theme";

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
    const cx = width / 2;

    // Sky gradient — same as GameScene for seamless transitions
    const sky = this.add.graphics();
    const steps = 64;
    const stripH = Math.ceil(height / steps);
    const topR = (theme.sky.top >> 16) & 0xff;
    const topG = (theme.sky.top >> 8) & 0xff;
    const topB = theme.sky.top & 0xff;
    const botR = (theme.sky.bottom >> 16) & 0xff;
    const botG = (theme.sky.bottom >> 8) & 0xff;
    const botB = theme.sky.bottom & 0xff;

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(topR + (botR - topR) * t);
      const g = Math.round(topG + (botG - topG) * t);
      const b = Math.round(topB + (botB - topB) * t);
      sky.fillStyle((r << 16) | (g << 8) | b);
      sky.fillRect(0, i * stripH, width, stripH + 1);
    }

    // Title
    this.add
      .text(cx, height * 0.2, "PAPER TOSS", {
        fontFamily: "monospace",
        fontSize: "36px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
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
          fontFamily: "monospace",
          fontSize: "20px",
          color: "#aaaaaa",
          backgroundColor: "#00000066",
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
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#888888",
      })
      .setOrigin(0.5)
      .setDepth(Depth.HUD);

    // Play button
    const playBtn = this.add
      .text(cx, height * 0.7, "PLAY", {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#ffffff",
        backgroundColor: "#4444aa",
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
        btn.setColor("#ffffff");
        btn.setBackgroundColor("#4444aa88");
      } else {
        btn.setColor("#aaaaaa");
        btn.setBackgroundColor("#00000066");
      }
    });

    // Update high score display
    const best = this.highScores.get(id);
    this.highScoreLabel.setText(best > 0 ? `Best: ${best}` : "No score yet");
  }
}
