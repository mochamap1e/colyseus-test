import { Room, Client } from "@colyseus/core";
import config, { listen } from "@colyseus/tools";
import { Schema, MapSchema, type } from "@colyseus/schema";

class Player extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
}

class State extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
}

class Game extends Room {
    maxClients = 4;
    state = new State();

    onCreate() {
        this.onMessage("INPUT", (client, input) => {
            const player = this.state.players.get(client.sessionId);
            const speed = 1;

            if (input.left) player.x -= speed;
            if (input.right) player.x += speed;
            if (input.up) player.y -= speed;
            if (input.down) player.y += speed;
        });
    }

    onJoin(client: Client) {
        const player = new Player();

        player.x = 250;
        player.y = 250;

        this.state.players.set(client.sessionId, new Player());
    }
 
    onLeave(client: Client) {
        this.state.players.delete(client.sessionId);
    }
}

listen(config({
    initializeGameServer: (gameServer) => {
        gameServer.define("room", Game);
    }
}));