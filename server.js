const express = require('express');
const webserver = express()

const { WebSocketServer } = require('ws')

let players = [];

class playerModule {
    constructor(name, position, rotation) {
        this.id = players.length;
        this.name = name;
        this.position = position;
        this.rotation = rotation;
    }

    delete() {
        // players[this.id] = null;
        players.splice(this.id, 1);
    }
}

const sockserver = new WebSocketServer({ port: 5000 })

sockserver.on('connection', ws => {
    console.log('New client connected!');

    //send player data of other players to player 
    ws.send(JSON.stringify({type: 'oldPlayers', content: players}));


    //put player in game when he pressed start
    ws.on('message', data => {
        const type = JSON.parse(data).type;
        if (type === "createNewPlayer") {

            const name = JSON.parse(data).user;

            //create player
            const player = new playerModule(name, {x:0, y:0, z:0}, 0);
            players.push(player);
            ws.playerData = player
            //send the player ser id to that client
            ws.send(JSON.stringify({type: 'id', content: player.id}));


            //send all player data to the new player
            sockserver.clients.forEach(client => {
                //dont send the data to the player who just joined
                if (client.playerData && client.playerData.id == player.id) return;
                client.send(JSON.stringify({type: 'newPlayer', content: player}));
            })

            //delete player
            ws.on('close', () => {
                console.log('Client has disconnected!');
                player.delete();
            })

        }else if (type === "updatePlayerPosition") {

            const id = JSON.parse(data).id;
            const newPosition = JSON.parse(data).data;
            if (!players[id]) {
                console.warn(`playyer ${id} doesnt exist on the server`);
                return;
            }
            players[id].position = newPosition;
            sockserver.clients.forEach(client => {
                //dont send the data to the player who is the one moving
                if (client.playerData && client.playerData.id == id) return;
                client.send(JSON.stringify({type: 'updatePlayerPosition', id: id, position: newPosition}));
            })

        }else if (type === "updatePlayerRotation") {

            const id = JSON.parse(data).id;
            const newRotation = JSON.parse(data).data;
            if (!players[id]) {
                console.warn(`playyer ${id} doesnt exist on the server`);
                return;
            }
            players[id].rotation = newRotation;
            sockserver.clients.forEach(client => {
                //dont send the data to the player who is the one moving
                if (client.playerData && client.playerData.id == id) return;
                client.send(JSON.stringify({type: 'updatePlayerRotation', id: id, rotation: newRotation}));
            })

        }else {
            console.warn('Unknown message type:', type);
        }
    })

  ws.onerror = function () {
    console.log('websocket error :(');
  }
})

console.log(`Listening on ${5000}`);