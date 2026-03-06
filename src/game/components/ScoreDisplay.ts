import Phaser from "phaser";
import { Depth } from "../constants";
import { theme } from "../theme";

export class ScoreDisplay {
  private text: Phaser.GameObjects.Text;
  private streak = 0;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(16, 16, "0", {
      fontSize: theme.ui.score.fontSize,
      fontFamily: theme.ui.fontFamily,
      color: theme.ui.text.primary,
      stroke: theme.ui.score.stroke,
      strokeThickness: theme.ui.score.strokeThickness,
    });
    this.text.setDepth(Depth.HUD);
  }

  hit(): void {
    this.streak++;
    this.text.setText(String(this.streak));
  }

  miss(): void {
    this.streak = 0;
    this.text.setText("0");
  }

  getStreak(): number {
    return this.streak;
  }
}
