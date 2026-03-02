import Phaser from "phaser";
import { GroundPlane } from "../objects/GroundPlane";
import { Target } from "../objects/Target";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create(): void {
    new GroundPlane(this);
    new Target(this);
  }
}
