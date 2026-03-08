import Phaser from "phaser";
import { Depth } from "../constants";
import { theme } from "../theme";

const HEIGHT_PCT = 0.06; // fraction of screen height
const PAD_X_PCT = 0.04; // horizontal padding as fraction of screen width
const FONT_SIZE_PCT = 0.55; // font size as fraction of bar height

export class NavBar {
  private scene: Phaser.Scene;
  private barHeight: number;

  /** Screen-space Y of the bar's bottom edge — use as anchor for content below */
  readonly bottom: number;

  // Callbacks
  onMenuClick?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.barHeight = Math.round(height * HEIGHT_PCT);
    this.bottom = this.barHeight;

    const padX = Math.round(width * PAD_X_PCT);
    const fontSize = Math.max(14, Math.round(this.barHeight * FONT_SIZE_PCT));

    // Hamburger (right side)
    const hamburger = scene.add.text(
      width - padX,
      this.barHeight / 2,
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
