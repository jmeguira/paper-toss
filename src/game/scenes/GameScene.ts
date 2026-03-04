import Phaser from "phaser";
import { InputModeType, ThrowParams } from "../types";
import { GroundPlane } from "../objects/GroundPlane";
import { Target } from "../objects/Target";
import { Projectile } from "../objects/Projectile";
// v1: ThrowLine disabled — kept on disk for v2 ball-in-hand mode
// import { ThrowLine } from "../ui/ThrowLine";
import { AngleBounds } from "../ui/AngleBounds";
import { ModeToggle } from "../ui/ModeToggle";
import { SwipeInput } from "../systems/SwipeInput";
import { MechanicalInput } from "../systems/MechanicalInput";
import { FlightSimulator } from "../systems/FlightSimulator";
import { WindSystem } from "../systems/WindSystem";
import { ScoreDisplay } from "../ui/ScoreDisplay";
import { WindIndicator } from "../ui/WindIndicator";
import { TARGET_Z, HIT_RADIUS, LANDING_PAUSE_MS } from "../constants";

export class GameScene extends Phaser.Scene {
  private projectile!: Projectile;
  private swipeInput!: SwipeInput;
  private mechInput!: MechanicalInput;
  private flight!: FlightSimulator;
  private wind!: WindSystem;
  private score!: ScoreDisplay;
  private windIndicator!: WindIndicator;
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

    // Flight simulator
    this.flight = new FlightSimulator(this, this.projectile);
    this.flight.onLand = (result) => {
      const dz = result.z - TARGET_Z;
      const dist = Math.sqrt(result.x * result.x + dz * dz);
      const isHit = dist <= HIT_RADIUS;

      console.log(`Landed: dist=${dist.toFixed(0)} ${isHit ? "HIT" : "MISS"}`);

      if (isHit) {
        this.score.hit();
      } else {
        this.score.miss();
      }

      // Brief pause, then reset with new wind
      this.time.delayedCall(LANDING_PAUSE_MS, () => {
        const { width, height } = this.scale;
        this.projectile.resetPosition(width, height);
        this.wind.generate();
        this.windIndicator.update(this.wind.force);
        this.enableActiveMode();
      });
    };

    // Wind
    this.wind = new WindSystem();
    this.windIndicator = new WindIndicator(this);
    this.wind.generate();
    this.windIndicator.update(this.wind.force);

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
    this.disableActiveMode();
    this.flight.launch(params, this.wind.force);
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
