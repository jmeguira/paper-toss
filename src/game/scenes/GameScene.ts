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
import { NavBar } from "../components/NavBar";
import { WallPanel } from "../composites/WallPanel";
import { DevOverlay } from "../composites/DevOverlay";
import { SettingsOverlay } from "../composites/SettingsOverlay";
import { resolveShot } from "../systems/ShotResolver";
import { HighScoreStore } from "../systems/HighScoreStore";
import { LANDING_PAUSE_MS, DIFFICULTIES, Depth, DifficultyId, DEFAULT_DIFFICULTY, BALL_RADIUS, DEV_BUTTON_GAP_PCT, LAYOUT, tierInfo, juiceIntensity } from "../constants";
import { log } from "../systems/logger";

export class GameScene extends Phaser.Scene {
  private projectile!: Projectile;
  private swipeInput!: SwipeInput;
  private mechInput!: MechanicalInput;
  private flight!: FlightAnimator;
  private wind!: WindSystem;
  private panel!: WallPanel;
  private devOverlay!: DevOverlay;
  private target!: Target;
  private difficulty: (typeof DIFFICULTIES)[number] = DEFAULT_DIFFICULTY;
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
      const streak = this.panel.getStreak();
      this.panel.showFeedback(result.tier);
      if (info.scores) {
        this.panel.hit();
      } else {
        const isRecord = this.highScores.submit(this.difficulty.id, streak);
        this.panel.miss();
        if (isRecord) this.panel.setBest(this.highScores.get(this.difficulty.id));
      }

      this.landingCameraFx(result.tier, streak);
      log(`Landed: dist=${result.distance.toFixed(0)} ${info.label}`);

      // Brief pause, then reset with new wind
      this.landingTimer = this.time.delayedCall(LANDING_PAUSE_MS, () => {
        this.throwAngle.hide();
        const { width, height } = this.scale;
        this.projectile.resetPosition(width, height);
        this.wind.generate(this.difficulty.targetZ);
        this.panel.updateWind(this.wind.force, this.wind.maxWind(this.difficulty.targetZ));
        this.devOverlay.update(this.wind.force, this.difficulty.targetZ);
        this.enableActiveMode();
      });
    };

    // Persistence
    this.highScores = new HighScoreStore();

    // Layout zones — pixel bounds from percentage budget
    const { width, height } = this.scale;
    const navH = Math.round(height * LAYOUT.NAV_PCT);
    const hudH = Math.round(height * LAYOUT.HUD_PCT);

    // Nav bar (top row — home + hamburger)
    const navBar = new NavBar(this);
    navBar.onHomeClick = () => this.returnToMenu();
    navBar.onMenuClick = () => settingsOverlay.show();

    // Wall panel — fills HUD zone, anchored below nav bar
    this.panel = new WallPanel(
      this,
      navH,
      hudH,
      this.highScores.get(this.difficulty.id),
    );

    // Input systems
    this.swipeInput = new SwipeInput(this, this.projectile, this.throwAngle);
    this.swipeInput.onThrow = (params) => this.handleThrow(params);

    this.mechInput = new MechanicalInput(this, this.projectile);
    this.mechInput.onThrow = (params) => this.handleThrow(params);

    // Start in swipe mode
    this.swipeInput.enable();

    // Wind + dev overlay (buttons centered below ball)
    this.wind = new WindSystem();
    const devBtnY = this.projectile.sprite.y + BALL_RADIUS + height * DEV_BUTTON_GAP_PCT;
    this.devOverlay = new DevOverlay(this, width / 2, devBtnY);
    this.devOverlay.onThrow = (angle) => {
      this.resetForNextShot();
      this.handleThrow({ angle, launchX: this.scale.width / 2 });
    };
    this.wind.generate(this.difficulty.targetZ);
    this.panel.updateWind(this.wind.force, this.wind.maxWind(this.difficulty.targetZ));
    this.devOverlay.update(this.wind.force, this.difficulty.targetZ);

    // Settings overlay (mode toggle lives inside)
    const settingsOverlay = new SettingsOverlay(this, this.activeMode);
    settingsOverlay.onModeChange = (mode) => this.setMode(mode);
    settingsOverlay.onSwipeModeChange = (mode) => this.swipeInput.setSwipeMode(mode);
    settingsOverlay.onDevToggle = (enabled) => this.setDevOverlay(enabled);
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
    this.panel.setBest(this.highScores.get(this.difficulty.id));
    this.target.setDistance(this.difficulty.targetZ);
    this.wind.generate(this.difficulty.targetZ);
    this.panel.updateWind(this.wind.force, this.wind.maxWind(this.difficulty.targetZ));
    this.devOverlay.update(this.wind.force, this.difficulty.targetZ);
  }

  private returnToMenu(): void {
    this.highScores.submit(this.difficulty.id, this.panel.getStreak());
    this.scene.start("Start");
  }

  private setDevOverlay(enabled: boolean): void {
    if (enabled) {
      this.devOverlay.show();
      this.angleBounds.show();
    } else {
      this.devOverlay.hide();
      this.angleBounds.hide();
    }
  }

  /** Camera effects on landing — intensity scales with streak */
  private landingCameraFx(tier: string, streak: number): void {
    const cam = this.cameras.main;
    const ji = juiceIntensity(streak);

    if (tier === "PERFECT") {
      // Zoom punch — subtle even at max
      const zoomPeak = 1 + 0.015 * ji; // max 1.015
      this.tweens.add({
        targets: cam,
        zoom: zoomPeak,
        duration: 80,
        yoyo: true,
        ease: "Sine.easeOut",
        onComplete: () => { cam.zoom = 1; },
      });
    } else if (tier === "NEAR_HIT") {
      // Light shake — just grazed the rim, but you got it
      cam.shake(100, 0.004 * ji);
    } else if (tier === "NEAR_MISS") {
      // Harder shake — so close, but no
      cam.shake(150, 0.012 * ji);
    }
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
