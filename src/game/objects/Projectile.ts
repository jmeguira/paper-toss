import Phaser from "phaser";
import { BALL_REST_Y_PCT } from "../constants";

export class Projectile {
  public sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private restX: number;
  private restY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.restX = width / 2;
    this.restY = height * BALL_REST_Y_PCT;

    this.sprite = scene.add.sprite(this.restX, this.restY, "projectile");
    this.sprite.setScale(1);
  }

  /** Hard reset — no animation, used on resize or mode switch */
  resetPosition(width: number, height: number): void {
    this.restX = width / 2;
    this.restY = height * BALL_REST_Y_PCT;
    this.sprite.setPosition(this.restX, this.restY);
    this.sprite.setScale(1);
    this.sprite.setVisible(true);
  }
}
