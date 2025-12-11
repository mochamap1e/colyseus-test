import Phaser from "phaser";
import { useEffect } from "react"; 

import "./styles.css";

class Game extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "Game" });
  }

  preload() {
    this.load.image("sky", "/sky.jpg");
    this.load.image("player", "/player.png");
  }

  create() {
    this.add.image(0, 0, "sky");

    this.player = this.physics.add.sprite(250, 250, "player");
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update() {
    const speed = 100;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else {
      this.player.setVelocityY(0);
    }

    if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

export default function App() {
  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: true
        }
      },
      scene: Game
    });

    return () => game.destroy(true);
  }, []);

  return;
}