import Phaser from "phaser";
import { GroundPlane } from "../objects/GroundPlane";
import { Target } from "../objects/Target";
import { Projectile } from "../objects/Projectile";

export class GameScene extends Phaser.Scene {
  private projectile!: Projectile;

  constructor() {
    super("Game");
  }

  create(): void {
    new GroundPlane(this);
    new Target(this);
    this.projectile = new Projectile(this);
  }
}
