import Phaser from "phaser";

export class WindIndicator {
  private arrow: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.arrow = scene.add.graphics();
    this.arrow.setDepth(100);

    this.label = scene.add.text(0, 0, "", {
      fontSize: "20px",
      fontFamily: "monospace",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.label.setDepth(100);
    this.label.setOrigin(0.5, 0);
  }

  update(force: number, maxWind: number): void {
    const { width } = this.scene.scale;
    const centerX = width / 2;
    const y = 20;

    // Arrow length proportional to force strength
    const maxLength = 60;
    const length = (Math.abs(force) / maxWind) * maxLength;
    const dir = Math.sign(force);

    this.arrow.clear();
    this.arrow.lineStyle(3, 0xffffff);

    // Shaft
    this.arrow.lineBetween(
      centerX - length * dir,
      y,
      centerX + length * dir,
      y,
    );

    // Arrowhead
    const tipX = centerX + length * dir;
    const headSize = 8;
    this.arrow.lineBetween(tipX, y, tipX - headSize * dir, y - headSize);
    this.arrow.lineBetween(tipX, y, tipX - headSize * dir, y + headSize);

    // Display as abstract 0.00–10.00 scale
    const display = (Math.abs(force) / maxWind) * 10;
    this.label.setPosition(centerX, y + 14);
    this.label.setText(display.toFixed(2));
  }
}
