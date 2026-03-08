import Phaser from "phaser";
import { theme } from "../theme";

interface TierButton {
  label: string;
  getAngle: () => number;
}

/**
 * Horizontal row of dev buttons that fire throws into specific landing tiers.
 * Centered at (centerX, y), buttons spaced evenly in a row.
 */
export class DevThrowButtons {
  private buttons: Phaser.GameObjects.Text[] = [];

  public onThrow: ((angle: number) => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    depth: number,
    centerX: number,
    y: number,
    tiers: TierButton[],
  ) {
    const gap = 8;

    // Create buttons first to measure total width
    const btns: Phaser.GameObjects.Text[] = [];
    for (const tier of tiers) {
      const btn = scene.add.text(0, 0, tier.label, {
        fontFamily: theme.ui.fontFamily,
        fontSize: "18px",
        color: theme.ui.devButton.color,
        backgroundColor: theme.ui.devButton.bg,
        padding: { x: 10, y: 6 },
      });
      btn.setDepth(depth);
      btn.setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        this.onThrow?.(tier.getAngle());
      });
      btns.push(btn);
    }

    // Layout centered horizontally
    const totalW = btns.reduce((sum, b) => sum + b.width, 0) + gap * (btns.length - 1);
    let curX = centerX - totalW / 2;
    for (const btn of btns) {
      btn.setPosition(curX, y);
      curX += btn.width + gap;
      this.buttons.push(btn);
    }
  }

  show(): void {
    for (const btn of this.buttons) btn.setVisible(true);
  }

  hide(): void {
    for (const btn of this.buttons) btn.setVisible(false);
  }

  destroy(): void {
    for (const btn of this.buttons) btn.destroy();
  }
}
