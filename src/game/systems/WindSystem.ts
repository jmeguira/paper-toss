import { WIND_MIN, WIND_MAX } from "../constants";

export class WindSystem {
  /** Current wind force — positive = right, negative = left */
  public force = 0;

  /** Generate a new random wind for the next throw */
  generate(): void {
    const strength =
      WIND_MIN + Math.random() * (WIND_MAX - WIND_MIN);
    const direction = Math.random() < 0.5 ? -1 : 1;
    this.force = strength * direction;
  }
}
