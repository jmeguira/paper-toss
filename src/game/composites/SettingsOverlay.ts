import Phaser from "phaser";
import { InputModeType } from "../types";
import { Depth, OVERLAY_PANEL_W_PCT, OVERLAY_PANEL_H_PCT } from "../constants";

// Sub-layers within the OVERLAY tier
const BG = Depth.OVERLAY;
const PANEL = Depth.OVERLAY + 1;
const UI = Depth.OVERLAY + 2;

export class SettingsOverlay {
  private backdrop: Phaser.GameObjects.Rectangle;
  private panel: Phaser.GameObjects.Rectangle;
  private title: Phaser.GameObjects.Text;
  private closeBtn: Phaser.GameObjects.Text;
  private modeBtn: Phaser.GameObjects.Text;
  private menuBtn: Phaser.GameObjects.Text;
  private currentMode: InputModeType;

  onModeChange: ((mode: InputModeType) => void) | null = null;
  onBackToMenu: (() => void) | null = null;

  constructor(scene: Phaser.Scene, initialMode: InputModeType) {
    this.currentMode = initialMode;
    const { width, height } = scene.scale;
    const cx = width / 2;
    const cy = height / 2;
    const panelW = width * OVERLAY_PANEL_W_PCT;
    const panelH = height * OVERLAY_PANEL_H_PCT;

    // Full-screen backdrop — blocks input to everything below
    this.backdrop = scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.5)
      .setOrigin(0)
      .setDepth(BG)
      .setInteractive();
    this.backdrop.on("pointerdown", () => this.hide());

    // Centered panel
    this.panel = scene.add
      .rectangle(cx, cy, panelW, panelH, 0x2a2a4e, 1)
      .setDepth(PANEL)
      .setInteractive(); // absorbs taps so they don't hit backdrop

    // Title
    this.title = scene.add
      .text(cx, cy - panelH * 0.35, "Settings", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(UI);

    // Close button (top-right of panel)
    this.closeBtn = scene.add
      .text(cx + panelW / 2 - 12, cy - panelH / 2 + 8, "\u2715", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#888888",
      })
      .setOrigin(1, 0)
      .setDepth(UI)
      .setInteractive({ useHandCursor: true });

    this.closeBtn.on("pointerdown", () => this.hide());

    // Input mode toggle
    this.modeBtn = scene.add
      .text(cx, cy - panelH * 0.05, this.modeLabel(), {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#66666688",
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(UI)
      .setInteractive({ useHandCursor: true });

    this.modeBtn.on("pointerdown", () => {
      this.currentMode =
        this.currentMode === "swipe" ? "mechanical" : "swipe";
      this.modeBtn.setText(this.modeLabel());
      this.onModeChange?.(this.currentMode);
    });

    // Back to Menu button
    this.menuBtn = scene.add
      .text(cx, cy + panelH * 0.3, "Back to Menu", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#4444aa",
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(UI)
      .setInteractive({ useHandCursor: true });

    this.menuBtn.on("pointerdown", () => {
      this.onBackToMenu?.();
    });

    // Start hidden
    this.hide();
  }

  show(): void {
    this.backdrop.setVisible(true).setActive(true);
    this.panel.setVisible(true).setActive(true);
    this.title.setVisible(true);
    this.closeBtn.setVisible(true).setActive(true);
    this.modeBtn.setVisible(true).setActive(true);
    this.menuBtn.setVisible(true).setActive(true);
  }

  hide(): void {
    this.backdrop.setVisible(false).setActive(false);
    this.panel.setVisible(false).setActive(false);
    this.title.setVisible(false);
    this.closeBtn.setVisible(false).setActive(false);
    this.modeBtn.setVisible(false).setActive(false);
    this.menuBtn.setVisible(false).setActive(false);
  }

  private modeLabel(): string {
    return `Mode: ${this.currentMode === "swipe" ? "Swipe" : "Mechanical"}`;
  }
}
