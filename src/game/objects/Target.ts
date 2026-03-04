import Phaser from "phaser";
import { FOCAL_LENGTH, VANISH_Y_PCT } from "../constants";

export class Target {
  public sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, targetZ: number) {
    this.scene = scene;
    this.sprite = scene.add.sprite(0, 0, "target");
    this.setDistance(targetZ);
  }

  setDistance(z: number): void {
    const { width, height } = this.scene.scale;
    const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z);
    const vanishY = height * VANISH_Y_PCT;
    const y = vanishY + (height - vanishY) * scale;

    this.sprite.setPosition(width / 2, y);
    this.sprite.setScale(scale);
  }
}
