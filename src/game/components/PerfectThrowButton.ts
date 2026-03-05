import Phaser from "phaser";

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
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#00ff88",
        backgroundColor: "#00000066",
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
