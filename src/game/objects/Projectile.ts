import Phaser from "phaser";

export class Projectile {
  public sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;

    this.sprite = scene.add.sprite(width / 2, height * 0.85, "projectile");
    this.sprite.setScale(1);
  }

  resetPosition(width: number, height: number): void {
    this.sprite.setPosition(width / 2, height * 0.85);
    this.sprite.setScale(1);
    this.sprite.setVisible(true);
  }
}
