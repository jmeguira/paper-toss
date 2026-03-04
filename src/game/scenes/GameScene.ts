import Phaser from "phaser";
import { InputModeType, ThrowParams } from "../types";
import { GroundPlane } from "../objects/GroundPlane";
import { Target } from "../objects/Target";
import { Projectile } from "../objects/Projectile";
import { AngleBounds } from "../ui/AngleBounds";
import { ModeToggle } from "../ui/ModeToggle";
import { SwipeInput } from "../systems/SwipeInput";
import { MechanicalInput } from "../systems/MechanicalInput";
import { FlightAnimator } from "../systems/FlightAnimator";
import { WindSystem } from "../systems/WindSystem";
import { ScoreDisplay } from "../ui/ScoreDisplay";
import { WindIndicator } from "../ui/WindIndicator";
import { DevOverlay } from "../ui/DevOverlay";
import { resolveShot } from "../systems/ShotResolver";
import { LANDING_PAUSE_MS, tierInfo } from "../constants";

export class GameScene extends Phaser.Scene {
  private projectile!: Projectile;
  private swipeInput!: SwipeInput;
  private mechInput!: MechanicalInput;
  private flight!: FlightAnimator;
  private wind!: WindSystem;
  private score!: ScoreDisplay;
  private windIndicator!: WindIndicator;
  private devOverlay!: DevOverlay;
  private activeMode: InputModeType = "swipe";

  constructor() {
    super("Game");
  }

  create(): void {
    // Background layers (z-order: GroundPlane → Target → AngleBounds → Projectile → UI)
    new GroundPlane(this);
    new Target(this);
    new AngleBounds(this);
    this.projectile = new Projectile(this);

    // Flight animator
    this.flight = new FlightAnimator(this, this.projectile);
    this.flight.onComplete = (result) => {
      const info = tierInfo(result.tier);
      if (info.scores) {
        this.score.hit();
      } else {
        this.score.miss();
      }

      console.log(`Landed: dist=${result.distance.toFixed(0)} ${info.label}`);

      // Brief pause, then reset with new wind
      this.time.delayedCall(LANDING_PAUSE_MS, () => {
        const { width, height } = this.scale;
        this.projectile.resetPosition(width, height);
        this.wind.generate();
        this.windIndicator.update(this.wind.force);
        this.devOverlay.update(this.wind.force);
        this.enableActiveMode();
      });
    };

    // Wind
    this.wind = new WindSystem(this.scale.height);
    this.windIndicator = new WindIndicator(this, this.wind.maxWind);
    this.devOverlay = new DevOverlay(this);
    this.devOverlay.onPerfectThrow = (angle) => {
      this.handleThrow({ angle, launchX: this.scale.width / 2 });
    };
    this.wind.generate();
    this.windIndicator.update(this.wind.force);
    this.devOverlay.update(this.wind.force);

    // Score display
    this.score = new ScoreDisplay(this);

    // Input systems
    this.swipeInput = new SwipeInput(this, this.projectile);
    this.swipeInput.onThrow = (params) => this.handleThrow(params);

    this.mechInput = new MechanicalInput(this, this.projectile);
    this.mechInput.onThrow = (params) => this.handleThrow(params);

    // Start in swipe mode
    this.swipeInput.enable();

    // Mode toggle (top-right, highest z)
    const toggle = new ModeToggle(this, "swipe");
    toggle.onToggle = (mode) => {
      this.setMode(mode);
    };
  }

  update(time: number, delta: number): void {
    if (this.flight.isFlying) {
      this.flight.update(delta);
    } else if (this.activeMode === "mechanical") {
      this.mechInput.update(time, delta);
    }
  }

  private handleThrow(params: ThrowParams): void {
    const { width, height } = this.scale;
    const wx0 = params.launchX - width / 2;
    const wy0 = height - this.projectile.sprite.y;

    const result = resolveShot(params.angle, wx0, wy0, this.wind.force);

    this.disableActiveMode();
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
