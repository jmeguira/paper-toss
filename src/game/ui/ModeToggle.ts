import Phaser from "phaser";
import { InputModeType } from "../types";
import { MODE_TOGGLE_SIZE, MODE_TOGGLE_MARGIN } from "../constants";

export class ModeToggle {
  private circle: Phaser.GameObjects.Arc;
  private text: Phaser.GameObjects.Text;
  private currentMode: InputModeType;

  public onToggle: ((mode: InputModeType) => void) | null = null;

  constructor(scene: Phaser.Scene, initialMode: InputModeType) {
    this.currentMode = initialMode;

    const { width } = scene.scale;
    const x = width - MODE_TOGGLE_MARGIN - MODE_TOGGLE_SIZE / 2;
    const y = MODE_TOGGLE_MARGIN + MODE_TOGGLE_SIZE / 2;

    this.circle = scene.add.circle(
      x,
      y,
      MODE_TOGGLE_SIZE / 2,
      0x666666,
      0.5,
    );
    this.circle.setInteractive();

    this.text = scene.add
      .text(x, y, this.label(), {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.circle.on("pointerdown", () => {
      this.currentMode =
        this.currentMode === "swipe" ? "mechanical" : "swipe";
      this.text.setText(this.label());
      this.onToggle?.(this.currentMode);
    });
  }

  private label(): string {
    return this.currentMode === "swipe" ? "S" : "M";
  }

  destroy(): void {
    this.circle.destroy();
    this.text.destroy();
  }
}
