import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { StartScene } from "./scenes/StartScene";
import { GameScene } from "./scenes/GameScene";

export function createGame(): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    backgroundColor: "#1a1a2e",
    scene: [BootScene, StartScene, GameScene],
  });
}
