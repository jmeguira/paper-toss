import Phaser from "phaser";
import {
  FOCAL_LENGTH,
  LAYOUT,
  GROUND_MAX_Z,
  Depth,
} from "../constants";
import { theme } from "../theme";

const GRID_CELL = 200; // world units per grid square

export class GroundPlane {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(Depth.GRID);
    this.draw();
  }

  draw(): void {
    const { width, height } = this.scene.scale;
    const vanishX = width / 2;
    const vanishY = height * LAYOUT.VANISH_Y_PCT;
    const f = FOCAL_LENGTH;
    const wallZ = GROUND_MAX_Z;
    const wallScale = f / (f + wallZ);

    // Wall base: where the floor meets the wall in screen space
    const wallBaseY = vanishY + (height - vanishY) * wallScale;

    this.graphics.clear();
    this.graphics.lineStyle(1, theme.ground.lineColor, theme.ground.alphaNear);

    // Vertical line count must cover the widest visible surface (the wall).
    // Wall spans full screen width, so max visible worldX = (width/2) / wallScale.
    const maxWorldX = (width / 2) / wallScale;
    const halfCount = Math.ceil(maxWorldX / GRID_CELL) + 1;

    // --- Floor grid (wallBaseY → bottom) ---

    // Horizontal lines at z = i * GRID_CELL
    for (let z = 0; z <= wallZ; z += GRID_CELL) {
      const scale = f / (f + z);
      const y = vanishY + (height - vanishY) * scale;
      this.graphics.lineBetween(0, y, width, y);
    }

    // Vertical lines at worldX = j * GRID_CELL — project from z=0 to z=wallZ
    for (let j = -halfCount; j <= halfCount; j++) {
      const worldX = j * GRID_CELL;
      const bottomX = vanishX + worldX;                // z = 0
      const topX = vanishX + worldX * wallScale;       // z = wallZ
      this.graphics.lineBetween(bottomX, height, topX, wallBaseY);
    }

    // --- Back wall at z = wallZ ---

    // Vertical lines — same worldX positions, straight up from wall base
    for (let j = -halfCount; j <= halfCount; j++) {
      const worldX = j * GRID_CELL;
      const x = vanishX + worldX * wallScale;
      this.graphics.lineBetween(x, wallBaseY, x, 0);
    }

    // Horizontal lines at worldY = k * GRID_CELL above floor
    for (let k = 0; k * GRID_CELL * wallScale < wallBaseY; k++) {
      const y = wallBaseY - k * GRID_CELL * wallScale;
      this.graphics.lineBetween(0, y, width, y);
    }
  }
}
