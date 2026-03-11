import Phaser from "phaser";
import { Depth, LAYOUT, BALL_REST_Y_PCT, WIND_FORCE_MAX } from "../constants";
import { theme } from "../theme";
import { juiceFlags } from "../systems/juiceFlags";

/**
 * Visible wind dots during flight. Flowing across the screen in the
 * wind direction with speed/size variation. Active only during flight.
 *
 * Single Graphics object redrawn each frame (one draw call).
 */

interface Particle {
  x: number;
  y: number;
  speed: number;
  radius: number;
  alpha: number;
  fadeOut: boolean;
  life: number;
}

const Y_MIN_PCT = LAYOUT.VANISH_Y_PCT;
const Y_MAX_PCT = BALL_REST_Y_PCT;

export class WindParticles {
  private scene: Phaser.Scene;
  private gfx: Phaser.GameObjects.Graphics;
  private particles: Particle[] = [];
  private active = false;
  private windDir = 1;
  private baseSpeed = 0;
  private targetCount = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gfx = scene.add.graphics();
    this.gfx.setDepth(Depth.GAME - 2);
  }

  start(windForce: number): void {
    if (!juiceFlags.windParticles) return;
    this.active = true;

    const wp = theme.windParticles;
    const absWind = Math.abs(windForce);
    const t = Math.min(1, absWind / WIND_FORCE_MAX);

    this.windDir = windForce >= 0 ? 1 : -1;
    this.baseSpeed = wp.speedMin + (wp.speedMax - wp.speedMin) * t;
    this.targetCount = Math.round(wp.countMin + (wp.countMax - wp.countMin) * t);

    this.particles.length = 0;
    const { width, height } = this.scene.scale;
    for (let i = 0; i < this.targetCount; i++) {
      this.particles.push(this.makeParticle(
        Math.random() * width,
        this.randomY(height),
      ));
    }
  }

  stop(): void {
    this.active = false;
    for (const p of this.particles) p.fadeOut = true;
  }

  clear(): void {
    this.active = false;
    this.particles.length = 0;
    this.gfx.clear();
  }

  update(delta: number): void {
    if (this.particles.length === 0) {
      this.gfx.clear();
      return;
    }

    const wp = theme.windParticles;
    const dt = delta / 1000;
    const { width, height } = this.scene.scale;
    const dyBase = -10 * dt;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speed * this.windDir * dt;
      p.y += dyBase + (Math.random() - 0.5) * 8 * dt;

      if (p.fadeOut) {
        p.life += wp.fadeOutSpeed * dt;
        if (p.life >= 1) {
          this.particles.splice(i, 1);
          continue;
        }
      }

      if ((this.windDir > 0 && p.x > width + wp.spawnMargin) ||
          (this.windDir < 0 && p.x < -wp.spawnMargin)) {
        this.particles.splice(i, 1);
        continue;
      }
      if (p.y < height * Y_MIN_PCT - wp.spawnMargin ||
          p.y > height * Y_MAX_PCT + wp.spawnMargin) {
        this.particles.splice(i, 1);
        continue;
      }
    }

    if (this.active) {
      while (this.particles.length < this.targetCount) {
        const spawnX = this.windDir > 0
          ? -wp.spawnMargin + Math.random() * 10
          : width + wp.spawnMargin - Math.random() * 10;
        this.particles.push(this.makeParticle(spawnX, this.randomY(height)));
      }
    }

    this.gfx.clear();
    const color = wp.color;

    for (const p of this.particles) {
      const crossT = this.windDir > 0
        ? p.x / width
        : 1 - p.x / width;
      const crossFade = 1 - crossT * wp.crossFade;

      const fadeMult = p.fadeOut ? 1 - p.life : 1;
      const a = p.alpha * fadeMult * crossFade;
      if (a < 0.01) continue;

      this.gfx.fillStyle(color, a);
      this.gfx.fillCircle(p.x, p.y, p.radius);
    }
  }

  private makeParticle(x: number, y: number): Particle {
    const wp = theme.windParticles;
    const speedVar = (Math.random() + Math.random() - 1) * wp.speedSpread;
    const speed = this.baseSpeed * (1 + speedVar);

    const baseRadius = wp.radiusMin + Math.random() * (wp.radiusMax - wp.radiusMin);
    const baseAlpha = wp.alphaMin + Math.random() * (wp.alphaMax - wp.alphaMin);
    const isLarge = Math.random() < wp.largeChance;

    return {
      x,
      y,
      speed,
      radius: baseRadius * (isLarge ? wp.largeRadiusMult : 1),
      alpha: baseAlpha * (isLarge ? wp.largeAlphaMult : 1),
      fadeOut: false,
      life: 0,
    };
  }

  private randomY(height: number): number {
    const minY = height * Y_MIN_PCT;
    const maxY = height * Y_MAX_PCT;
    return minY + Math.random() * (maxY - minY);
  }
}
