import Phaser from "phaser";
import { InputModeType, ThrowParams } from "../types";
import { GroundPlane } from "../objects/GroundPlane";
import { Target } from "../objects/Target";
import { Projectile } from "../objects/Projectile";
import { AngleBounds } from "../components/AngleBounds";
import { ThrowAngle } from "../components/ThrowAngle";
import { SwipeInput } from "../systems/SwipeInput";
import { MechanicalInput } from "../systems/MechanicalInput";
import { FlightAnimator } from "../systems/FlightAnimator";
import { WindSystem } from "../systems/WindSystem";
import { ScoreDisplay } from "../components/ScoreDisplay";
import { WindIndicator } from "../components/WindIndicator";
import { DevOverlay } from "../composites/DevOverlay";
import { SettingsOverlay } from "../composites/SettingsOverlay";
import { resolveShot } from "../systems/ShotResolver";
import { HighScoreStore } from "../systems/HighScoreStore";
import { LANDING_PAUSE_MS, DIFFICULTIES, Depth, DifficultyId, DEFAULT_DIFFICULTY, MODE_TOGGLE_MARGIN, VANISH_Y_PCT, tierInfo } from "../constants";
import { theme } from "../theme";

export class GameScene extends Phaser.Scene {
  private projectile!: Projectile;
  private swipeInput!: SwipeInput;
  private mechInput!: MechanicalInput;
  private flight!: FlightAnimator;
  private wind!: WindSystem;
  private score!: ScoreDisplay;
  private windIndicator!: WindIndicator;
  private devOverlay!: DevOverlay;
  private target!: Target;
  private difficulty: (typeof DIFFICULTIES)[number] = DEFAULT_DIFFICULTY;
  private diffLabel!: Phaser.GameObjects.Text;
  private highScores!: HighScoreStore;
  private angleBounds!: AngleBounds;
  private throwAngle!: ThrowAngle;
  private activeMode: InputModeType = "swipe";
  private landingTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("Game");
  }

  init(data: { difficultyId?: DifficultyId }): void {
    const match = DIFFICULTIES.find((d) => d.id === data.difficultyId);
    this.difficulty = match ?? DEFAULT_DIFFICULTY;
  }

  create(): void {
    // Sky gradient — drawn first, sits behind everything
    this.drawSky();

    // Background layers (z-order: GroundPlane → Target → AngleBounds → Projectile → UI)
    new GroundPlane(this);
    this.target = new Target(this, this.difficulty.targetZ);
    this.angleBounds = new AngleBounds(this);
    this.throwAngle = new ThrowAngle(this);
    this.projectile = new Projectile(this);

    // Flight animator
    this.flight = new FlightAnimator(this, this.projectile);
    this.flight.onComplete = (result) => {
      const info = tierInfo(result.tier);
      if (info.scores) {
        this.score.hit();
      } else {
        this.highScores.submit(this.difficulty.id, this.score.getStreak());
        this.score.miss();
      }

      console.log(`Landed: dist=${result.distance.toFixed(0)} ${info.label}`);

      // Brief pause, then reset with new wind
      this.landingTimer = this.time.delayedCall(LANDING_PAUSE_MS, () => {
        this.throwAngle.hide();
        const { width, height } = this.scale;
        this.projectile.resetPosition(width, height);
        this.wind.generate(this.difficulty.targetZ);
        this.windIndicator.update(this.wind.force, this.wind.maxWind(this.difficulty.targetZ));
        this.devOverlay.update(this.wind.force, this.difficulty.targetZ);
        this.enableActiveMode();
      });
    };

    // Wind
    this.wind = new WindSystem();
    this.windIndicator = new WindIndicator(this);
    this.devOverlay = new DevOverlay(this);
    this.devOverlay.onPerfectThrow = (angle) => {
      this.resetForNextShot();
      this.handleThrow({ angle, launchX: this.scale.width / 2 });
    };
    this.wind.generate(this.difficulty.targetZ);
    this.windIndicator.update(this.wind.force, this.wind.maxWind(this.difficulty.targetZ));
    this.devOverlay.update(this.wind.force, this.difficulty.targetZ);

    // Score display + persistence
    this.score = new ScoreDisplay(this);
    this.highScores = new HighScoreStore();

    // Input systems
    this.swipeInput = new SwipeInput(this, this.projectile);
    this.swipeInput.onThrow = (params) => this.handleThrow(params);

    this.mechInput = new MechanicalInput(this, this.projectile);
    this.mechInput.onThrow = (params) => this.handleThrow(params);

    // Start in swipe mode
    this.swipeInput.enable();

    // Difficulty cycle button
    this.diffLabel = this.add.text(16, 80, this.difficulty.label, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#aaaaff",
      backgroundColor: "#00000066",
      padding: { x: 6, y: 4 },
    });
    this.diffLabel.setDepth(Depth.CONTROLS);
    this.diffLabel.setInteractive({ useHandCursor: true });
    this.diffLabel.on("pointerdown", () => this.cycleDifficulty());

    // Hamburger menu button (top-right)
    const { width } = this.scale;
    const hamburger = this.add.text(
      width - MODE_TOGGLE_MARGIN,
      MODE_TOGGLE_MARGIN,
      "\u2630",
      {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#888888",
        backgroundColor: "#00000066",
        padding: { x: 6, y: 2 },
      },
    );
    hamburger.setOrigin(1, 0);
    hamburger.setDepth(Depth.CONTROLS);
    hamburger.setInteractive({ useHandCursor: true });
    hamburger.on("pointerdown", () => settingsOverlay.show());

    // Settings overlay (mode toggle lives inside)
    const settingsOverlay = new SettingsOverlay(this, this.activeMode);
    settingsOverlay.onModeChange = (mode) => this.setMode(mode);
    settingsOverlay.onBackToMenu = () => this.returnToMenu();
  }

  update(time: number, delta: number): void {
    if (this.flight.isFlying) {
      this.flight.update(delta);
    } else if (this.activeMode === "mechanical") {
      this.mechInput.update(time, delta);
    }
  }

  /** Abort any in-progress flight or landing pause and reset the ball.
   *  Does NOT regenerate wind — the current wind stays active for the next throw. */
  private resetForNextShot(): void {
    this.flight.stop();
    this.landingTimer?.remove();
    this.landingTimer = undefined;
    this.throwAngle.hide();

    const { width, height } = this.scale;
    this.projectile.resetPosition(width, height);
  }

  private handleThrow(params: ThrowParams): void {
    const { width, height } = this.scale;
    const wx0 = params.launchX - width / 2;
    const wy0 = height - this.projectile.sprite.y;

    const result = resolveShot(params.angle, wx0, wy0, this.wind.force, this.difficulty.targetZ);

    this.disableActiveMode();
    this.throwAngle.show(params.angle);
    this.flight.play(result);
  }

  private enableActiveMode(): void {
    if (this.activeMode === "swipe") {
      this.swipeInput.enable();
    } else {
      this.mechInput.enable();
    }
  }

  private disableActiveMode(): void {
    if (this.activeMode === "swipe") {
      this.swipeInput.disable();
    } else {
      this.mechInput.disable();
    }
  }

  private cycleDifficulty(): void {
    const idx = DIFFICULTIES.indexOf(this.difficulty);
    this.difficulty = DIFFICULTIES[(idx + 1) % DIFFICULTIES.length];
    this.diffLabel.setText(this.difficulty.label);
    this.target.setDistance(this.difficulty.targetZ);
    this.wind.generate(this.difficulty.targetZ);
    this.windIndicator.update(this.wind.force, this.wind.maxWind(this.difficulty.targetZ));
    this.devOverlay.update(this.wind.force, this.difficulty.targetZ);
  }

  private returnToMenu(): void {
    this.highScores.submit(this.difficulty.id, this.score.getStreak());
    this.scene.start("Start");
  }

  private drawSky(): void {
    const { width, height } = this.scale;
    const sky = this.add.graphics();

    // Renderer-agnostic gradient: stack of thin horizontal strips
    // with linearly interpolated color between sky.top and sky.bottom
    const steps = 64;
    const stripH = Math.ceil(height / steps);
    const topR = (theme.sky.top >> 16) & 0xff;
    const topG = (theme.sky.top >> 8) & 0xff;
    const topB = theme.sky.top & 0xff;
    const botR = (theme.sky.bottom >> 16) & 0xff;
    const botG = (theme.sky.bottom >> 8) & 0xff;
    const botB = theme.sky.bottom & 0xff;

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(topR + (botR - topR) * t);
      const g = Math.round(topG + (botG - topG) * t);
      const b = Math.round(topB + (botB - topB) * t);
      sky.fillStyle((r << 16) | (g << 8) | b);
      sky.fillRect(0, i * stripH, width, stripH + 1); // +1 avoids sub-pixel gaps
    }

    // Horizon glow band — soft rectangle centered on the vanishing point
    const horizonY = height * VANISH_Y_PCT;
    const glowH = height * theme.horizon.heightPct;
    sky.fillStyle(theme.horizon.color, theme.horizon.alpha);
    sky.fillRect(0, horizonY - glowH / 2, width, glowH);
  }

  private setMode(mode: InputModeType): void {
    if (mode === this.activeMode) return;

    // Disable current
    this.disableActiveMode();

    this.activeMode = mode;

    // Reset ball to center before enabling new mode
    const { width, height } = this.scale;
    this.projectile.resetPosition(width, height);

    // Enable new
    this.enableActiveMode();
  }
}
