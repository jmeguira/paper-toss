import Phaser from "phaser";
import { Depth, LAYOUT } from "../constants";
import { theme, typeScale } from "../theme";

const PAD_X_PCT = 0.04; // horizontal padding as fraction of screen width

export class NavBar {
  /** Screen-space Y of the bar's bottom edge — use as anchor for content below */
  readonly bottom: number;

  // Callbacks
  onMenuClick?: () => void;
  onHomeClick?: () => void;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const ts = typeScale(height);

    const barHeight = Math.round(height * LAYOUT.NAV_PCT);
    this.bottom = barHeight;

    const padX = Math.round(width * PAD_X_PCT);
    const midY = barHeight / 2;
    const iconStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: theme.ui.fontFamily,
      fontSize: `${ts.heading}px`,
      color: theme.ui.text.primary,
    };

    // Home (left side)
    const home = scene.add.text(padX, midY, "\u2302", iconStyle);
    home.setOrigin(0, 0.5);
    home.setDepth(Depth.CONTROLS);
    home.setInteractive({ useHandCursor: true });
    home.on("pointerdown", () => this.onHomeClick?.());

    // Hamburger (right side)
    const hamburger = scene.add.text(width - padX, midY, "\u2630", iconStyle);
    hamburger.setOrigin(1, 0.5);
    hamburger.setDepth(Depth.CONTROLS);
    hamburger.setInteractive({ useHandCursor: true });
    hamburger.on("pointerdown", () => this.onMenuClick?.());
  }
}
