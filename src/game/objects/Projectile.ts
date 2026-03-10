import Phaser from "phaser";
import { BALL_REST_Y_PCT, BALL_RADIUS, Depth, juiceIntensity } from "../constants";
import { theme } from "../theme";

// Ball radius scales with juice intensity
const RADIUS_BASE = BALL_RADIUS;
const RADIUS_GROWTH = 10; // max additional radius at full juice

export class Projectile {
  public sprite: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private restX: number;
  private restY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.restX = width / 2;
    this.restY = height * BALL_REST_Y_PCT;

    this.sprite = scene.add.graphics();
    this.drawBall(0);
    this.sprite.setPosition(this.restX, this.restY);
    this.sprite.setDepth(Depth.GAME);
  }

  /** Hard reset — no animation, used on resize or mode switch */
  resetPosition(width: number, height: number, streak = 0): void {
    this.restX = width / 2;
    this.restY = height * BALL_REST_Y_PCT;
    this.sprite.setPosition(this.restX, this.restY);
    this.sprite.setScale(1);
    this.sprite.setAlpha(1);
    this.sprite.setVisible(true);
    this.drawBall(streak);
  }

  private drawBall(streak: number): void {
    const r = RADIUS_BASE + RADIUS_GROWTH * juiceIntensity(streak);
    this.sprite.clear();
    this.sprite.fillStyle(theme.ball.base);
    this.sprite.fillCircle(0, 0, r);
  }
}
