// const express = require('express');
// const webserver = express();

import OIMO from 'oimo';
import { WebSocketServer } from 'ws';


// const { WebSocketServer } = require('ws');
let players = [];

class playerModule {
    constructor(name, position) {
        this.id = players.length;
        this.name = name;
        this.position = position;
        this.quaternion = null;
        this.xInput = 0;
        this.zInput = 0;
        this.direction = {x: 0, z: 1};
        this.box = world.add({ type: 'box', size: [1, 1, 1], pos: [10,10,0], rot: [0, 0, 0], move: true, density: 1, friction: 1 });
    }
    delete() {
        this.box.remove();
        players.splice(this.id, 1);
    }
    createClientPackage() {
        const newPlayer = {
            id: this.id,
            name: this.name,
            position: this.position,
            quaternion: this.quaternion
        }
        return newPlayer;
    }
}

function createClientPlayersPackage(players) {
    const newPlayers = [];
    players.forEach(player => {
        const newPlayer = {
            id: player.id,
            name: player.name,
            position: player.position,
            quaternion: player.quaternion
        }
        newPlayers.push(newPlayer)
    })
    return newPlayers;
}
function multiplyScalar(vec, scalar) {
    return new OIMO.Vec3(vec.x * scalar, vec.y * scalar, vec.z * scalar);
}


let serverFPS = 30;

//create world physics object
const world = new OIMO.World({ 
    timestep: 1/serverFPS, 
    iterations: 8, 
    broadphase: 2,
    worldscale: 1, 
    random: true,
    info: false,
    gravity: [0,-9.8,0] 
});
//ground
world.add({ type: 'box', size: [50, 1, 50], pos: [0, -1, 0], rot: [0, 0, 0], move: false, density: 1 });

let previousTime = Date.now()

const sockserver = new WebSocketServer({ port: 5000 });

function update() {
    const currentTime = Date.now();
    const delta = (currentTime - previousTime) / 1000;

    // console.log(delta)
    world.step();

    players.forEach(player => {
        const box = player.box;

        const speed = 10;

        //calculate the force
        let force = new OIMO.Vec3(player.zInput * player.direction.x + -player.xInput * -player.direction.z, 0, player.zInput * player.direction.z + -player.xInput * player.direction.x).normalize();
        force = multiplyScalar(force, delta * speed);

        // const force = new OIMO.Vec3(player.xInput * delta * speed, 0, player.zInput * delta * speed)
        
        const position = box.getPosition().clone();
        box.applyImpulse(position, force);

        // console.log(box.getPosition())
        player.position = box.getPosition();
        player.quaternion = box.getQuaternion();

    })
    
    const playerPositionData = {type: "updatePosition", content: createClientPlayersPackage(players)};
    sockserver.clients.forEach(client => {
        client.send(JSON.stringify(playerPositionData));
    })


    previousTime = currentTime;
}
setInterval(update, 1000 / serverFPS);


sockserver.on('connection', ws => {
    console.log('New client connected!');

    //send player data of other players to player 
    ws.send(JSON.stringify({type: 'oldPlayers', content: createClientPlayersPackage(players)}));


    //put player in game when he pressed start
    ws.on('message', data => {
        const type = JSON.parse(data).type;
        if (type === "createNewPlayer") {

            const name = JSON.parse(data).user;

            //create player
            const player = new playerModule(name, {x:0, y:0, z:0});
            players.push(player);
            ws.playerData = player
            //send the player ser id to that client
            ws.send(JSON.stringify({type: 'id', content: player.id}));


            //send all player data to the new player
            sockserver.clients.forEach(client => {
                //dont send the data to the player who just joined
                if (client.playerData && client.playerData.id == player.id) return;
                client.send(JSON.stringify({type: 'newPlayer', content: player.createClientPackage()}));
            })

            //delete player
            ws.on('close', () => {
                console.log('Client has disconnected!');
                player.delete();
                sockserver.clients.forEach(client => {
                    if (client.playerData) {
                        client.send(JSON.stringify({type: 'deletePlayer', id: ws.playerData.id}));
                    }
                })
            })

        }else if (type === "handleUserInput") {

            const playerInput = JSON.parse(data).input;
            const quaternion = JSON.parse(data).quaternion;
            const direction = JSON.parse(data).direction;
            // console.log(quaternion)

            //move player
            const playerData = ws.playerData;

            playerData.xInput = Math.sign(playerInput.x);
            playerData.zInput = Math.sign(playerInput.z);
            playerData.quaternion = quaternion;
            playerData.direction = direction;

        }else {
            console.warn('Unknown message type:', type);
        }
    })

  ws.onerror = function () {
    console.log('websocket error :(');
  }
})

console.log(`Listening on ${5000}`);