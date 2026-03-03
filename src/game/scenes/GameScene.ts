import Phaser from "phaser";
import { InputModeType } from "../types";
import { GroundPlane } from "../objects/GroundPlane";
import { Target } from "../objects/Target";
import { Projectile } from "../objects/Projectile";
import { ThrowLine } from "../ui/ThrowLine";
import { ModeToggle } from "../ui/ModeToggle";
import { SwipeInput } from "../systems/SwipeInput";
import { MechanicalInput } from "../systems/MechanicalInput";

export class GameScene extends Phaser.Scene {
  private projectile!: Projectile;
  private swipeInput!: SwipeInput;
  private mechInput!: MechanicalInput;
  private activeMode: InputModeType = "swipe";

  constructor() {
    super("Game");
  }

  create(): void {
    // Background layers (z-order: GroundPlane → Target → ThrowLine → Projectile → UI)
    new GroundPlane(this);
    new Target(this);
    const throwLine = new ThrowLine(this);
    this.projectile = new Projectile(this);

    // Input systems
    this.swipeInput = new SwipeInput(this, this.projectile, throwLine);
    this.swipeInput.onThrow = (params) => {
      console.log("Throw!", params);
      // Future: trigger projectile flight animation
    };
    this.swipeInput.onCancel = () => {
      console.log("Cancelled");
    };

    this.mechInput = new MechanicalInput(this, this.projectile);
    this.mechInput.onThrow = (params) => {
      console.log("Throw!", params);
      // Future: trigger projectile flight animation
    };

    // Start in swipe mode
    this.swipeInput.enable();

    // Mode toggle (top-right, highest z)
    const toggle = new ModeToggle(this, "swipe");
    toggle.onToggle = (mode) => {
      this.setMode(mode);
    };
  }

  update(time: number, delta: number): void {
    if (this.activeMode === "mechanical") {
      this.mechInput.update(time, delta);
    }
  }

  private setMode(mode: InputModeType): void {
    if (mode === this.activeMode) return;

    // Disable current
    if (this.activeMode === "swipe") {
      this.swipeInput.disable();
    } else {
      this.mechInput.disable();
    }

    this.activeMode = mode;

    // Reset ball to center before enabling new mode
    const { width, height } = this.scale;
    this.projectile.resetPosition(width, height);

    // Enable new
    if (mode === "swipe") {
      this.swipeInput.enable();
    } else {
      this.mechInput.enable();
    }
  }
}
