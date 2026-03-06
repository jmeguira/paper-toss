import Phaser from "phaser";
import { theme } from "../theme";

export interface TouchButtonConfig {
  x: number;
  y: number;
  radius: number;
  fillColor: number;
  fillAlpha?: number;
  label: string;
  fontSize?: number;
}

export class TouchButton {
  private circle: Phaser.GameObjects.Arc;
  private text: Phaser.GameObjects.Text;
  private _isDown = false;

  public onPress: (() => void) | null = null;
  public onRelease: (() => void) | null = null;

  constructor(scene: Phaser.Scene, config: TouchButtonConfig) {
    const { x, y, radius, fillColor, fillAlpha = 0.4, label, fontSize = 20 } =
      config;

    this.circle = scene.add.circle(x, y, radius, fillColor, fillAlpha);
    this.circle.setInteractive();

    this.text = scene.add
      .text(x, y, label, {
        fontSize: `${fontSize}px`,
        color: theme.ui.text.primary,
        fontFamily: theme.ui.fontFamily,
      })
      .setOrigin(0.5);

    this.circle.on("pointerdown", () => {
      this._isDown = true;
      this.circle.setAlpha(0.8);
      this.onPress?.();
    });

    this.circle.on("pointerup", () => {
      this._isDown = false;
      this.circle.setAlpha(1);
      this.onRelease?.();
    });

    this.circle.on("pointerout", () => {
      this._isDown = false;
      this.circle.setAlpha(1);
      this.onRelease?.();
    });
  }

  get isDown(): boolean {
    return this._isDown;
  }

  setVisible(visible: boolean): void {
    this.circle.setVisible(visible);
    this.text.setVisible(visible);
  }

  destroy(): void {
    this.circle.destroy();
    this.text.destroy();
  }
}
