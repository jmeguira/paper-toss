import Phaser from "phaser";
import { Depth, LAYOUT } from "../constants";
import { theme, typeScale } from "../theme";

export class NavBar {
  // Callbacks
  onMenuClick?: () => void;
  onHomeClick?: () => void;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const ts = typeScale(height);

    const barHeight = Math.round(height * LAYOUT.NAV_PCT);
    const padX = Math.round(width * LAYOUT.NAV_PAD_X_PCT);
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
