export interface ThrowParams {
  angle: number; // radians: 0 = straight, +right, -left. Clamped to ±LAUNCH_ANGLE_MAX
  launchX: number; // screen x where throw originates. Clamped to LAUNCH_X bounds
}

export type InputModeType = "swipe" | "mechanical";

export interface InputMode {
  enable(): void;
  disable(): void;
  destroy(): void;
}
