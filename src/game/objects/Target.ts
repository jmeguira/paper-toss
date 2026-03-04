import Phaser from "phaser";
import { FOCAL_LENGTH, VANISH_Y_PCT, TARGET_Z } from "../constants";

export class Target {
  public sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + TARGET_Z);
    const vanishY = height * VANISH_Y_PCT;
    const y = vanishY + (height - vanishY) * scale;

    this.sprite = scene.add.sprite(width / 2, y, "target");
    this.sprite.setScale(scale);
  }
}
