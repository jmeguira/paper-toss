import Phaser from "phaser";
import { ThrowParams, InputMode } from "../types";
import { Projectile } from "../objects/Projectile";
import { TouchButton } from "../ui/TouchButton";
import { AngleIndicator } from "../ui/AngleIndicator";
import {
  BALL_REST_Y_PCT,
  MECH_BUTTON_SIZE,
  MECH_LAUNCH_SIZE,
  MECH_MOVE_SPEED,
  MECH_ANGLE_SWEEP_SPEED,
  MODE_TOGGLE_SIZE,
  MODE_TOGGLE_MARGIN,
} from "../constants";

export class MechanicalInput implements InputMode {
  private scene: Phaser.Scene;
  private projectile: Projectile;
  private leftBtn: TouchButton;
  private rightBtn: TouchButton;
  private launchBtn: TouchButton;
  private resetBtn: TouchButton;
  private indicator: AngleIndicator;
  private enabled = false;

  public onThrow: ((params: ThrowParams) => void) | null = null;

  constructor(scene: Phaser.Scene, projectile: Projectile) {
    this.scene = scene;
    this.projectile = projectile;

    const { width, height } = scene.scale;
    const ballY = height * BALL_REST_Y_PCT;

    // ← GO → clustered below ball
    const controlsY = ballY + 130;
    const goRadius = MECH_LAUNCH_SIZE / 2 + 8;
    const spacing = goRadius + MECH_BUTTON_SIZE / 2 + 16;

    this.leftBtn = new TouchButton(scene, {
      x: width / 2 - spacing,
      y: controlsY,
      radius: MECH_BUTTON_SIZE / 2,
      fillColor: 0x4444ff,
      label: "\u2190",
      fontSize: 28,
    });

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
        launchX: this.scene.scale.width / 2, // v1: fixed center launch
      };
      console.log("Throw! (mechanical)", params);
      this.onThrow?.(params);
    };

    this.rightBtn = new TouchButton(scene, {
      x: width / 2 + spacing,
      y: controlsY,
      radius: MECH_BUTTON_SIZE / 2,
      fillColor: 0x4444ff,
      label: "\u2192",
      fontSize: 28,
    });

    // Reset in bottom-right corner, same size as mode toggle
    this.resetBtn = new TouchButton(scene, {
      x: width - MODE_TOGGLE_MARGIN - MODE_TOGGLE_SIZE / 2,
      y: height - MODE_TOGGLE_MARGIN - MODE_TOGGLE_SIZE / 2,
      radius: MODE_TOGGLE_SIZE / 2,
      fillColor: 0x888888,
      label: "\u21BA",
      fontSize: 18,
    });

    this.resetBtn.onPress = () => {
      if (!this.enabled) return;
      const { width: w, height: h } = this.scene.scale;
      this.projectile.resetPosition(w, h);
    };

    // Angle indicator — above ball
    this.indicator = new AngleIndicator(scene, MECH_ANGLE_SWEEP_SPEED);
    this.indicator.setPosition(width / 2, ballY - 20);

    // Start hidden
    this.setVisible(false);
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.setVisible(true);
    // Reset ball to center
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
    this.leftBtn.destroy();
    this.rightBtn.destroy();
    this.launchBtn.destroy();
    this.resetBtn.destroy();
    this.indicator.destroy();
  }

  /** Call from scene update() — advance angle oscillator */
  update(_time: number, delta: number): void {
    if (!this.enabled) return;

    // v1: lateral movement disabled — L/R buttons hidden, ball stays center
    // To re-enable for v2, uncomment below and show L/R in setVisible()
    // if (this.leftBtn.isDown) {
    //   this.projectile.setX(this.projectile.sprite.x - MECH_MOVE_SPEED);
    // }
    // if (this.rightBtn.isDown) {
    //   this.projectile.setX(this.projectile.sprite.x + MECH_MOVE_SPEED);
    // }
    // const ballY = this.scene.scale.height * BALL_REST_Y_PCT;
    // this.indicator.setPosition(this.projectile.sprite.x, ballY - 20);

    this.indicator.update(delta);
  }

  private setVisible(visible: boolean): void {
    // v1: L/R and RESET always hidden — lateral movement disabled
    // To re-enable for v2: change these to follow `visible` param
    this.leftBtn.setVisible(false);
    this.rightBtn.setVisible(false);
    this.resetBtn.setVisible(false);
    this.launchBtn.setVisible(visible);
    if (visible) {
      this.indicator.show();
    } else {
      this.indicator.hide();
    }
  }
}
