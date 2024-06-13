import OIMO from 'oimo';
import { WebSocketServer } from 'ws';

const playerSpeed = 10;
const shockwaveRadius = 5;
const shockwavePower = 15;
const jumpPower = 15;
const dashPower = 25;

const playerFellDownTeleportDistance = -50;

let players = [];

class playerModule {
    constructor(name, position) {
        this.id = players.length;
        this.name = name;
        this.position = position;
        this.quaternion = null;
        this.xInput = 0;
        this.zInput = 0;
        this.usingShockwave = false;
        this.usingDash = false;
        this.usingDash = false;
        this.usingJump = false;
        this.direction = {x: 0, z: 1};
        this.box = world.add({ type: 'sphere', size: [1, 1, 1], pos: [0,10,0], rot: [0, 0, 0], move: true, density: 1, friction: 1 });
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

class Map {
    constructor(world) {
        this.world = world
        this.defaultPlaneSettings = { type: 'box', size: [50, 1, 50], pos: [0, -1, 0], rot: [0, 0, 0], move: false, density: 1 };
        this.plane = world.add(this.defaultPlaneSettings);
    }
    loadNormalPlane() {
        this.world.gravity.y = -9.8;
        const newSettings = {restitution: 1};
        this.refreshMap(Object.assign(this.defaultPlaneSettings, newSettings)); //merge the 2 objects
    }
    loadBouncyCastle() {
        this.world.gravity.y = -9.8;
        const newSettings = {restitution: 3};
        this.refreshMap(Object.assign(this.defaultPlaneSettings, newSettings)); //merge the 2 objects
    }
    loadIceyTrouble() {
        this.world.gravity.y = -9.8;
        const newSettings = {friction: 0};
        this.refreshMap(Object.assign(this.defaultPlaneSettings, newSettings)); //merge the 2 objects
    }
    loadShadyMoon() {
        this.world.gravity.y = -2;
        const newSettings = {restitution: 3};
        this.refreshMap(Object.assign(this.defaultPlaneSettings, newSettings)); //merge the 2 objects
    }
    
    refreshMap(newPlaneSettings) {
        this.plane.remove();
        this.plane = world.add(newPlaneSettings);
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
function maginitude(vec3) {
    return Math.sqrt(vec3.x**2 + vec3.y**2 + vec3.z**2)
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
const mapModule = new Map(world);
mapModule.loadNormalPlane();
world.add({ type: 'box', size: [7, 14, 7], pos: [20, 6, 20], rot: [0, 0, 0], move: false, density: 1, restitution: 5 });
world.add({ type: 'box', size: [7, 14, 7], pos: [-20, 6, -20], rot: [0, 0, 0], move: false, density: 1, restitution: 5 });
world.add({ type: 'box', size: [7, 14, 7], pos: [-20, 6, 20], rot: [0, 0, 0], move: false, density: 1, restitution: 5 });
world.add({ type: 'box', size: [7, 14, 7], pos: [20, 6, -20], rot: [0, 0, 0], move: false, density: 1, restitution: 5 });


let previousTime = Date.now()

const sockserver = new WebSocketServer({ port: 5005 });

function update() {
    const currentTime = Date.now();
    const delta = (currentTime - previousTime) / 1000;

    // console.log(delta)
    world.step();

    players.forEach(player => {
        const box = player.box;

        //calculate the force
        let force = new OIMO.Vec3(player.zInput * player.direction.x + -player.xInput * -player.direction.z, 0, player.zInput * player.direction.z + -player.xInput * player.direction.x).normalize();
        force = multiplyScalar(force, delta * playerSpeed);
        // const force = new OIMO.Vec3(player.xInput * delta * playerSpeed, 0, player.zInput * delta * playerSpeed)
        
        const position = box.getPosition().clone();
        position.y += 1;
        box.applyImpulse(position, force);
        // box.angularVelocity.add(force);


        player.position = box.getPosition();
        player.quaternion = box.getQuaternion();

        //shockwave
        if (player.usingShockwave) {
            player.usingShockwave = false;

            players.forEach(otherPlayer => {
                if (player.id === otherPlayer.id) return;

                //find players affected by shockwave
                const distanceVec3 = new OIMO.Vec3(otherPlayer.position.x - position.x, otherPlayer.position.y -  position.y, otherPlayer.position.z - position.z);
                const distance = maginitude(distanceVec3);

                //apply effect
                if (distance < shockwaveRadius) {

                    let direction = distanceVec3.normalize();
                    distanceVec3.y += 10;
                    direction.y = .4;
                    otherPlayer.box.applyImpulse(otherPlayer.position, direction.multiplyScalar(shockwavePower));
                }                
            })
        }
        //dash
        if(player.usingDash) {
            player.usingDash = false;

            const direction = new OIMO.Vec3(player.direction.x, 0, player.direction.z);
            player.box.applyImpulse(player.position, direction.multiplyScalar(dashPower));
        }

        //jump
        if(player.usingJump) {
            player.usingJump = false;

            const direction = new OIMO.Vec3(0, 2, 0);
            player.box.applyImpulse(player.position, direction.multiplyScalar(jumpPower))
        }

        //teleport player up if he fell down
        players.forEach(player => {
            if (player.position.y < playerFellDownTeleportDistance) {
                player.box.resetPosition((Math.random()-.5) * 20, 10, (Math.random()-.5) * 20);
            }            
        })

    })
    
    const playerData = {type: "updatePosition", content: createClientPlayersPackage(players)};
    sockserver.clients.forEach(client => {
        client.send(JSON.stringify(playerData));
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

        }else if (type === "shockwave") {

            const playerData = ws.playerData;
            playerData.usingShockwave = true;

            sockserver.clients.forEach(client => {
                //dont send the data to the player who used the shockwave
                if (client.playerData && client.playerData.id == ws.playerData.id) return;
                client.send(JSON.stringify({type: 'usedShockwave', id: ws.playerData.id}));
            })
        }else if (type === "dash") {
            const direction = JSON.parse(data).direction;
            const playerData = ws.playerData;
            playerData.usingDash = true;

            sockserver.clients.forEach(client => {
                //only apply on player that used dash
                if (client.playerData && client.playerData.id == ws.playerData.id) return;
                client.send(JSON.stringify({type: 'usedDash', id: ws.playerData.id}));
            })

        }else if(type === "jump") {
            const direction = JSON.parse(data).direction;
            const playerData = ws.playerData;
            playerData.usingJump = true;

            sockserver.clients.forEach(client => {
                //only apply on player that used jump
                if (client.playerData && client.playerData.id == ws.playerData.id) return;
                client.send(JSON.stringify({type: 'usedJump', id: ws.playerData.id}));
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