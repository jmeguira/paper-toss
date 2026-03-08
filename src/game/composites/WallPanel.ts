import Phaser from "phaser";
import { Depth } from "../constants";
import { theme, typeScale } from "../theme";
import { ScoreRow } from "../components/ScoreRow";
import { WindDisplay } from "../components/WindDisplay";
import { FeedbackZone } from "../components/FeedbackZone";

// Panel width as fraction of screen width
const PANEL_W_PCT = 0.88;

// Internal layout (fractions of panel size)
const PAD_X_PCT = 0.05;
const PAD_Y_PCT = 0.06;
const TOP_ROW_GAP_PCT = 0.04;
const WIND_ROW_GAP_PCT = 0.04;
const WIND_ARROW_LENGTH_PCT = 0.25;
const WIND_LABEL_OFFSET = 14;

/**
 * Wall-mounted HUD panel — thin composite that lays out ScoreRow,
 * FeedbackZone, and WindDisplay within a styled background.
 */
export class WallPanel {
  private scoreRow: ScoreRow;
  private windDisplay: WindDisplay;

  // Delegate callbacks
  set onDifficultyClick(fn: (() => void) | undefined) {
    this.scoreRow.onDifficultyClick = fn;
  }

  constructor(
    scene: Phaser.Scene,
    topY: number,
    panelHeight: number,
    difficultyLabel: string,
    bestScore: number,
  ) {
    const { width, height } = scene.scale;
    const ts = typeScale(height);

    // Screen-space dimensions
    const pw = Math.round(width * PANEL_W_PCT);
    const ph = Math.round(panelHeight);
    const px = Math.round((width - pw) / 2);

    const container = scene.add.container(px, topY);
    container.setDepth(Depth.WALL);

    // Internal layout
    const padX = pw * PAD_X_PCT;
    const padY = ph * PAD_Y_PCT;
    const innerLeft = padX;
    const innerRight = pw - padX;
    const innerW = pw - 2 * padX;
    const innerTop = padY;
    const centerX = pw / 2;

    const topRowH = ts.body;
    const topRowGap = ph * TOP_ROW_GAP_PCT;
    const windRowGap = ph * WIND_ROW_GAP_PCT;
    const windRowH = ts.body + WIND_LABEL_OFFSET;
    const windY = ph - padY - windRowH;

    // --- Background ---
    const bg = scene.add.graphics();
    const t = theme.wallPanel;
    bg.fillStyle(t.bg, t.bgAlpha);
    bg.fillRect(0, 0, pw, ph);
    bg.lineStyle(t.borderWidth, t.border, t.borderAlpha);
    bg.strokeRect(0, 0, pw, ph);
    container.add(bg);

    // --- Components ---
    this.scoreRow = new ScoreRow(
      scene, container,
      innerLeft, centerX, innerRight, innerTop,
      difficultyLabel, bestScore,
    );

    const feedbackTop = innerTop + topRowH + topRowGap;
    const feedbackBottom = windY - windRowGap;
    const feedbackH = Math.max(0, feedbackBottom - feedbackTop);
    new FeedbackZone(scene, container, innerLeft, feedbackTop, innerW, feedbackH);

    this.windDisplay = new WindDisplay(
      scene, container,
      centerX, windY,
      pw * WIND_ARROW_LENGTH_PCT,
    );
  }

  // --- Public API (delegates to components) ---

  hit(): void { this.scoreRow.hit(); }
  miss(): void { this.scoreRow.miss(); }
  getStreak(): number { return this.scoreRow.getStreak(); }
  setBest(score: number): void { this.scoreRow.setBest(score); }
  setDifficulty(label: string): void { this.scoreRow.setDifficulty(label); }
  updateWind(force: number, maxWind: number): void { this.windDisplay.update(force, maxWind); }
}
