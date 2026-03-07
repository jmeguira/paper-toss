import Phaser from "phaser";
import { Depth } from "../constants";
import { theme } from "../theme";

export class WindIndicator {
  private arrow: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.arrow = scene.add.graphics();
    this.arrow.setDepth(Depth.HUD);

    this.label = scene.add.text(0, 0, "", {
      fontSize: "20px",
      fontFamily: theme.ui.fontFamily,
      color: theme.wind.label.color,
      stroke: theme.wind.label.stroke,
      strokeThickness: theme.wind.label.strokeThickness,
    });
    this.label.setDepth(Depth.HUD);
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
    this.arrow.lineStyle(theme.wind.arrowWidth, theme.wind.arrowColor);

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

    // Display as abstract 0–12 scale — cap isn't a round number
    // so users can't easily deduce the maximum
    const display = (Math.abs(force) / maxWind) * 12;
    this.label.setPosition(centerX, y + 14);
    this.label.setText(display.toFixed(2));
  }
}
