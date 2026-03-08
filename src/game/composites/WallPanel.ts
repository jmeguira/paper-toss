import Phaser from "phaser";
import { Depth } from "../constants";
import { theme } from "../theme";

// Panel width as fraction of screen width
const PANEL_W_PCT = 0.88;

// Internal layout (fractions of panel size)
const PAD_X_PCT = 0.05;
const PAD_Y_PCT = 0.06;
const TOP_ROW_GAP_PCT = 0.04; // gap below top row before feedback zone
const WIND_ROW_GAP_PCT = 0.04; // gap above wind row
const WIND_ARROW_LENGTH_PCT = 0.25; // max arrow length as fraction of panel width
const WIND_ARROW_HEAD = 6;
const WIND_LABEL_OFFSET = 14;

// Font size: fraction of panel height, clamped
const FONT_SIZE_PCT = 0.12;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 18;

export class WallPanel {
  private container: Phaser.GameObjects.Container;

  // Layout metrics (screen-space, relative to container origin)
  private pw: number;
  private ph: number;
  private centerX: number;
  private windY: number;

  // Content
  private streakText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private diffText!: Phaser.GameObjects.Text;
  private windArrow!: Phaser.GameObjects.Graphics;
  private windLabel!: Phaser.GameObjects.Text;

  // State
  private streak = 0;

  // Callbacks
  onDifficultyClick?: () => void;

  constructor(
    scene: Phaser.Scene,
    topY: number,
    panelHeight: number,
    difficultyLabel: string,
    bestScore: number,
  ) {
    const { width } = scene.scale;

    // Screen-space dimensions
    this.pw = Math.round(width * PANEL_W_PCT);
    this.ph = Math.round(panelHeight);
    const px = Math.round((width - this.pw) / 2);

    this.container = scene.add.container(px, topY);
    this.container.setDepth(Depth.WALL);

    // Internal layout
    const padX = this.pw * PAD_X_PCT;
    const padY = this.ph * PAD_Y_PCT;
    const innerLeft = padX;
    const innerRight = this.pw - padX;
    const innerW = this.pw - 2 * padX;
    const innerTop = padY;
    this.centerX = this.pw / 2;

    // Font size — clamped for readability across screen sizes
    const fontSize = Math.max(
      MIN_FONT_SIZE,
      Math.min(MAX_FONT_SIZE, Math.round(this.ph * FONT_SIZE_PCT)),
    );
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: theme.ui.fontFamily,
      fontSize: `${fontSize}px`,
      color: theme.wallPanel.text.color,
      stroke: theme.wallPanel.text.stroke,
      strokeThickness: theme.wallPanel.text.strokeThickness,
    };

    // Row heights
    const topRowH = fontSize;
    const topRowGap = this.ph * TOP_ROW_GAP_PCT;
    const windRowGap = this.ph * WIND_ROW_GAP_PCT;
    const windRowH = fontSize + WIND_LABEL_OFFSET;
    this.windY = this.ph - padY - windRowH;

    // --- Background ---
    const bg = scene.add.graphics();
    const t = theme.wallPanel;
    bg.fillStyle(t.bg, t.bgAlpha);
    bg.fillRect(0, 0, this.pw, this.ph);
    bg.lineStyle(t.borderWidth, t.border, t.borderAlpha);
    bg.strokeRect(0, 0, this.pw, this.ph);
    this.container.add(bg);

    // --- Top row: streak (left) | best (center) | difficulty (right) ---
    this.streakText = scene.add.text(innerLeft, innerTop, "streak:0", textStyle);
    this.container.add(this.streakText);

    this.bestText = scene.add.text(
      this.centerX,
      innerTop,
      `best:${bestScore}`,
      textStyle,
    );
    this.bestText.setOrigin(0.5, 0);
    this.container.add(this.bestText);

    this.diffText = scene.add.text(
      innerRight,
      innerTop,
      difficultyLabel,
      textStyle,
    );
    this.diffText.setOrigin(1, 0);
    this.diffText.setInteractive({ useHandCursor: true });
    this.diffText.on("pointerdown", () => this.onDifficultyClick?.());
    this.container.add(this.diffText);

    // --- Feedback zone (center, fills between top row and wind) ---
    const feedbackTop = innerTop + topRowH + topRowGap;
    const feedbackBottom = this.windY - windRowGap;
    const feedbackH = Math.max(0, feedbackBottom - feedbackTop);
    const feedbackBorder = scene.add.graphics();
    const fb = theme.wallPanel.feedbackZone;
    feedbackBorder.lineStyle(1, fb.border, fb.borderAlpha);
    feedbackBorder.strokeRect(innerLeft, feedbackTop, innerW, feedbackH);
    this.container.add(feedbackBorder);

    // --- Wind arrow + label (bottom center) ---
    this.windArrow = scene.add.graphics();
    this.container.add(this.windArrow);

    this.windLabel = scene.add.text(
      this.centerX,
      this.windY + WIND_LABEL_OFFSET,
      "",
      textStyle,
    );
    this.windLabel.setOrigin(0.5, 0);
    this.container.add(this.windLabel);
  }

  // --- Public API ---

  hit(): void {
    this.streak++;
    this.streakText.setText(`streak:${this.streak}`);
  }

  miss(): void {
    this.streak = 0;
    this.streakText.setText("streak:0");
  }

  getStreak(): number {
    return this.streak;
  }

  setBest(score: number): void {
    this.bestText.setText(`best:${score}`);
  }

  setDifficulty(label: string): void {
    this.diffText.setText(label);
  }

  updateWind(force: number, maxWind: number): void {
    const maxLength = this.pw * WIND_ARROW_LENGTH_PCT;
    const length = (Math.abs(force) / maxWind) * maxLength;
    const dir = Math.sign(force);

    this.windArrow.clear();
    this.windArrow.lineStyle(theme.wind.arrowWidth, theme.wind.arrowColor);

    // Shaft
    this.windArrow.lineBetween(
      this.centerX - length * dir,
      this.windY,
      this.centerX + length * dir,
      this.windY,
    );

    // Arrowhead
    const tipX = this.centerX + length * dir;
    this.windArrow.lineBetween(
      tipX,
      this.windY,
      tipX - WIND_ARROW_HEAD * dir,
      this.windY - WIND_ARROW_HEAD,
    );
    this.windArrow.lineBetween(
      tipX,
      this.windY,
      tipX - WIND_ARROW_HEAD * dir,
      this.windY + WIND_ARROW_HEAD,
    );

    // Display as abstract 0–12 scale
    const display = (Math.abs(force) / maxWind) * 12;
    this.windLabel.setText(display.toFixed(2));
  }
}
