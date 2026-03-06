import { ThrowParams, InputMode } from "../types";
import { Projectile } from "../objects/Projectile";
import { TouchButton } from "../components/TouchButton";
import { AngleIndicator } from "../components/AngleIndicator";
import {
  BALL_REST_Y_PCT,
  MECH_LAUNCH_SIZE,
  MECH_ANGLE_SWEEP_SPEED,
} from "../constants";
import { log } from "./logger";

export class MechanicalInput implements InputMode {
  private scene: Phaser.Scene;
  private projectile: Projectile;
  private launchBtn: TouchButton;
  private indicator: AngleIndicator;
  private enabled = false;

  public onThrow: ((params: ThrowParams) => void) | null = null;

  constructor(scene: Phaser.Scene, projectile: Projectile) {
    this.scene = scene;
    this.projectile = projectile;

    const { width, height } = scene.scale;
    const ballY = height * BALL_REST_Y_PCT;

    // GO button below ball
    const controlsY = ballY + 130;
    const goRadius = MECH_LAUNCH_SIZE / 2 + 8;

    this.launchBtn = new TouchButton(scene, {
      x: width / 2,
      y: controlsY,
      radius: goRadius,
      fillColor: 0x44aa44,
      label: "GO",
      fontSize: 22,
    });

    this.launchBtn.onPress = () => {
      if (!this.enabled) return;
      const params: ThrowParams = {
        angle: this.indicator.angle,
        launchX: this.scene.scale.width / 2,
      };
      log("Throw! (mechanical)", params);
      this.onThrow?.(params);
    };

    // Angle indicator — centered on ball
    this.indicator = new AngleIndicator(scene, MECH_ANGLE_SWEEP_SPEED);
    this.indicator.setPosition(width / 2, ballY);

    // Start hidden
    this.setVisible(false);
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.setVisible(true);
    const { width, height } = this.scene.scale;
    this.projectile.resetPosition(width, height);
  }

  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    this.setVisible(false);
  }

  destroy(): void {
    this.disable();
    this.launchBtn.destroy();
    this.indicator.destroy();
  }

  /** Call from scene update() — advance angle oscillator */
  update(_time: number, delta: number): void {
    if (!this.enabled) return;
    this.indicator.update(delta);
  }

  private setVisible(visible: boolean): void {
    this.launchBtn.setVisible(visible);
    if (visible) {
      this.indicator.show();
    } else {
      this.indicator.hide();
    }
  }
}
