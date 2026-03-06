import Phaser from "phaser";
import { theme } from "../theme";

/**
 * Dev button that fires the mathematically solved "perfect" angle.
 * Pure UI component — caller provides the angle via getSolvedAngle callback.
 */
export class PerfectThrowButton {
  private btn: Phaser.GameObjects.Text;

  public onThrow: ((angle: number) => void) | null = null;
  public getSolvedAngle: (() => number) | null = null;

  constructor(scene: Phaser.Scene, depth: number) {
    this.btn = scene.add.text(
      scene.scale.width - 16,
      scene.scale.height - 16,
      "\u25b6 Perfect",
      {
        fontFamily: theme.ui.fontFamily,
        fontSize: "14px",
        color: theme.ui.devButton.color,
        backgroundColor: theme.ui.devButton.bg,
        padding: { x: 6, y: 4 },
      },
    );
    this.btn.setOrigin(1, 1);
    this.btn.setDepth(depth);
    this.btn.setInteractive({ useHandCursor: true });
    this.btn.on("pointerdown", () => {
      const angle = this.getSolvedAngle?.() ?? 0;
      this.onThrow?.(angle);
    });
  }

  show(): void {
    this.btn.setVisible(true);
  }

  hide(): void {
    this.btn.setVisible(false);
  }

  destroy(): void {
    this.btn.destroy();
  }
}
