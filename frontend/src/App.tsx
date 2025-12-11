import Phaser from "phaser";
import { useEffect } from "react";
import { Client, Room, getStateCallbacks } from "colyseus.js";

import "./styles.css";

class Game extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursor!: Phaser.Types.Input.Keyboard.CursorKeys;

  otherPlayerSprites: {[sessionId: string]: any} = {};

  client = new Client("ws://localhost:2567");
  room!: Room;

  constructor() {
    super({ key: "Game" });
  }

  preload() {
    this.load.image("sky", "/sky.jpg");
    this.load.image("player", "/player.png");
  }

  async create() {
    try {
      this.room = await this.client.joinOrCreate("room");
    } catch(error) {
      return;
    }

    const $ = getStateCallbacks(this.room);

    $(this.room.state).players.onAdd((player, sessionId) => {
      const sprite = this.physics.add.image(player.x, player.y, "player");

      this.otherPlayerSprites[sessionId] = sprite;

      $(player).onChange(() => {
        sprite.setData("currentX", player.x);
        sprite.setData("currentY", player.y);
      });
    });

    $(this.room.state).players.onRemove((_, sessionId) => {
      const sprite = this.otherPlayerSprites[sessionId];

      if (sprite) {
        sprite.destroy(); delete this.otherPlayerSprites[sessionId];
      }
    });

    this.cursor = this.input.keyboard!.createCursorKeys();
  }

  update() {
    if (!this.room || !this.player) { return; }

    const inputMap = {
      left: this.cursor.left.isDown,
      right: this.cursor.right.isDown,
      up: this.cursor.up.isDown,
      down: this.cursor.down.isDown
    }

    // locally apply input to sprite

    const speed = 1;

    if (inputMap.left) this.player.x -= speed;
    if (inputMap.right) this.player.x += speed;
    if (inputMap.up) this.player.y -= speed;
    if (inputMap.down) this.player.y += speed;

    // send current input to server
    this.room.send("INPUT", inputMap);

    // lerp other player sprites
    for (let sessionId in this.otherPlayerSprites) {
      if (sessionId === this.room.sessionId) continue;

      const lerpAlpha = 0.2;

      const sprite = this.otherPlayerSprites[sessionId];
      const { currentX, currentY } = sprite.data.values;

      sprite.x = Phaser.Math.Linear(sprite.x, currentX, lerpAlpha);
      sprite.y = Phaser.Math.Linear(sprite.y, currentY, lerpAlpha);
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