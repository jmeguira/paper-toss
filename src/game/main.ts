import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { StartScene } from "./scenes/StartScene";
import { GameScene } from "./scenes/GameScene";
import { theme } from "./theme";

export function createGame(): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.CANVAS,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    backgroundColor: theme.canvas,
    antialias: true,
    roundPixels: false,
    scene: [BootScene, StartScene, GameScene],
  });
}
