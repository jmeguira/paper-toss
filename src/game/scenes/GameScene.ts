import Phaser from "phaser";
import { GroundPlane } from "../objects/GroundPlane";
import { Target } from "../objects/Target";
import { Projectile } from "../objects/Projectile";
import { SwipeInput } from "../systems/SwipeInput";

export class GameScene extends Phaser.Scene {
  private projectile!: Projectile;

  constructor() {
    super("Game");
  }

  create(): void {
    new GroundPlane(this);
    new Target(this);
    this.projectile = new Projectile(this);

    const swipe = new SwipeInput(this);
    swipe.onThrow = (params) => {
      console.log("Throw!", params);
    };
    swipe.onCancel = () => {
      console.log("Cancelled");
    };
  }
}
