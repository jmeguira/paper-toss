import Phaser from "phaser";
import { Depth, LAYOUT } from "../constants";
import { theme } from "../theme";

const PAD_X_PCT = 0.04; // horizontal padding as fraction of screen width
const FONT_SIZE_PCT = 0.55; // font size as fraction of bar height

export class NavBar {
  /** Screen-space Y of the bar's bottom edge — use as anchor for content below */
  readonly bottom: number;

  // Callbacks
  onMenuClick?: () => void;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;

    const barHeight = Math.round(height * LAYOUT.NAV_PCT);
    this.bottom = barHeight;

    const padX = Math.round(width * PAD_X_PCT);
    const fontSize = Math.max(14, Math.round(barHeight * FONT_SIZE_PCT));

    // Hamburger (right side)
    const hamburger = scene.add.text(
      width - padX,
      barHeight / 2,
      "\u2630",
      {
        fontFamily: theme.ui.fontFamily,
        fontSize: `${fontSize}px`,
        color: theme.ui.text.dim,
      },
    );
    hamburger.setOrigin(1, 0.5);
    hamburger.setDepth(Depth.CONTROLS);
    hamburger.setInteractive({ useHandCursor: true });
    hamburger.on("pointerdown", () => this.onMenuClick?.());
  }
}
