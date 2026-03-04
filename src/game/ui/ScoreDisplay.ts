import Phaser from "phaser";

export class ScoreDisplay {
  private text: Phaser.GameObjects.Text;
  private streak = 0;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(16, 16, "0", {
      fontSize: "48px",
      fontFamily: "monospace",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.text.setDepth(100);
  }

  hit(): void {
    this.streak++;
    this.text.setText(String(this.streak));
  }

  miss(): void {
    this.streak = 0;
    this.text.setText("0");
  }
}
