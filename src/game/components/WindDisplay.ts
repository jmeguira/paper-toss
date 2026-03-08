import Phaser from "phaser";
import { theme, typeScale } from "../theme";

const ARROW_HEAD = 6;
const LABEL_OFFSET = 14;

/**
 * Wind arrow + numeric label, drawn at a given (centerX, y) within a container.
 * Pure visual — caller provides force and maxWind each throw.
 */
export class WindDisplay {
  private arrow: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private centerX: number;
  private y: number;
  private maxLength: number;

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    centerX: number,
    y: number,
    maxArrowLength: number,
  ) {
    this.centerX = centerX;
    this.y = y;
    this.maxLength = maxArrowLength;

    const ts = typeScale(scene.scale.height);

    this.arrow = scene.add.graphics();
    container.add(this.arrow);

    this.label = scene.add.text(centerX, y + LABEL_OFFSET, "", {
      fontFamily: theme.ui.fontFamily,
      fontSize: `${ts.body}px`,
      color: theme.wallPanel.text.color,
      stroke: theme.wallPanel.text.stroke,
      strokeThickness: theme.wallPanel.text.strokeThickness,
    });
    this.label.setOrigin(0.5, 0);
    container.add(this.label);
  }

  update(force: number, maxWind: number): void {
    const length = (Math.abs(force) / maxWind) * this.maxLength;
    const dir = Math.sign(force);

    this.arrow.clear();
    this.arrow.lineStyle(theme.wind.arrowWidth, theme.wind.arrowColor);

    // Shaft
    this.arrow.lineBetween(
      this.centerX - length * dir,
      this.y,
      this.centerX + length * dir,
      this.y,
    );

    // Arrowhead
    const tipX = this.centerX + length * dir;
    this.arrow.lineBetween(tipX, this.y, tipX - ARROW_HEAD * dir, this.y - ARROW_HEAD);
    this.arrow.lineBetween(tipX, this.y, tipX - ARROW_HEAD * dir, this.y + ARROW_HEAD);

    // Abstract 0–12 scale
    const display = (Math.abs(force) / maxWind) * 12;
    this.label.setText(display.toFixed(2));
  }
}
