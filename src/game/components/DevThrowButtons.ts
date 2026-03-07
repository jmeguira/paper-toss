import Phaser from "phaser";
import { theme } from "../theme";

interface TierButton {
  label: string;
  getAngle: () => number;
}

/**
 * Column of dev buttons that fire throws into specific landing tiers.
 * Position owned by caller — this component just stacks downward from (x, y).
 */
export class DevThrowButtons {
  private buttons: Phaser.GameObjects.Text[] = [];

  public onThrow: ((angle: number) => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    depth: number,
    x: number,
    y: number,
    tiers: TierButton[],
  ) {
    let curY = y;

    for (const tier of tiers) {
      const btn = scene.add.text(x, curY, tier.label, {
        fontFamily: theme.ui.fontFamily,
        fontSize: "18px",
        color: theme.ui.devButton.color,
        backgroundColor: theme.ui.devButton.bg,
        padding: { x: 10, y: 6 },
      });
      btn.setOrigin(1, 0);
      btn.setDepth(depth);
      btn.setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        this.onThrow?.(tier.getAngle());
      });
      this.buttons.push(btn);
      curY += btn.height + 8;
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
