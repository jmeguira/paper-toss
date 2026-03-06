import { DEV_MODE } from "../constants";

export function log(...args: unknown[]): void {
  if (DEV_MODE) console.log(...args);
}
