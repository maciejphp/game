import * as THREE from 'three';
import { createScene } from "./scene.js";
import { localPlayer } from "./localPlayer.js";
import { otherPlayer } from "./player.js";

const result = createScene();
const scene = result.scene;
const camera = result.camera;
const renderer = result.renderer;
const map = result.map;


// const player2 = new otherPlayer(result, "hallo");
// player2.create();
// player2.move(new THREE.Vector3(2,0,2));

let player;
let oldPlayerPosition;
let oldQuaternion;

//represh every frame
function animate() {
  requestAnimationFrame(animate);

  if (player && (player.mesh.position.x != oldPlayerPosition.x || player.mesh.position.z != oldPlayerPosition.z)) {
    oldPlayerPosition = player.mesh.position.clone();
    sendPlayerPosition(oldPlayerPosition);
  }

  if (player && (player.mesh.quaternion.w != oldQuaternion.w || player.mesh.quaternion.y != oldQuaternion.y)) {
    oldQuaternion = player.mesh.quaternion.clone();
    sendPlayerQuaternion(oldQuaternion);
  }

  renderer.render(scene, camera);
}
animate();



//multiplayer stuff
// const webSocket = new WebSocket('wss://cheyenne-.glitch.me/');
// const webSocket = new WebSocket('ws://localhost:5000/');
const webSocket = new WebSocket('wss://bali237.glitch.me/');
let playersData;
let playerModels = [];
let playerServerId;

//recieve server messages
webSocket.onmessage = (message) => {
    try {
      const data = JSON.parse(message.data);
      const type = data.type;

      if (type === "oldPlayers") {
        //create objects for all old players who are already in game
        playersData = data.content;
        console.log( "old players: ", playersData);

        for (const playerData of playersData) {
            const player = new otherPlayer(result, playerData.name);
            player.create();
            player.move(new THREE.Vector3(playerData.position.x,playerData.position.y,playerData.position.z));
            player.rotate(playerData.rotation);
            playerModels[playerData.id] = player;
        }

      }else if (type === "newPlayer") {

        const playerData = data.content;
        playersData.push(playerData);

        const player = new otherPlayer(result, playerData.name);
        playerModels[playerData.id] = player;
        console.log("addedplayer", playerData.id, playerModels)
        player.create();

      }else if (type === "id") {

        playerServerId = data.content;
        console.log(`your playerid: ${playerServerId}`)

      }else if (type === "updatePlayerPosition") {

          const playerToUpdate = playerModels[data.id];
          if (!playerToUpdate) {
            console.warn(`player ${data.id} doesnt exist on client`, playerModels)
            return;
          }
          const newPosition = new THREE.Vector3(data.position.x,data.position.y,data.position.z)
          playerToUpdate.move(newPosition);

      }else if (type === "updatePlayerRotation") {

        const playerToUpdate = playerModels[data.id];
        playerToUpdate.rotate(data.rotation);
        // console.log(data.rotation)

      }else if (type === "deletePlayer") {

        console.log(data.id, playerModels);
        playerModels[data.id].destroy();
        playerModels.splice(data.id, 1);

      }
    } catch (error) {
        console.error('Error parsing message:', message, error);
    }
};

//send server messaged
const playerName = document.querySelector("#nameInput").querySelector("input");
function startGame() {
  let name = playerName.value;
  if (!name) name = "nameless";

  player = new localPlayer(result, name);
  player.create();
  player.move(map.playerPosition);
  oldPlayerPosition = player.mesh.position.clone();
  oldQuaternion = player.mesh.quaternion.clone();


  const messageData = {type: "createNewPlayer", user: name};
  console.log(webSocket)
  webSocket.send(JSON.stringify(messageData));
  playerName.value = "";
}

function sendPlayerPosition(position) {
  position = {x: position.x, y: position.y, z:position.z};
  const messageData = {type: "updatePlayerPosition", id: playerServerId, data: position};
  webSocket.send(JSON.stringify(messageData));
}
function sendPlayerQuaternion(quaternion) {
  const messageData = {type: "updatePlayerRotation", id: playerServerId, data: {w: quaternion.w, y: quaternion.y}};
  webSocket.send(JSON.stringify(messageData));
}

let playingGame = false;
const button = document.querySelector("#startGame");
button.addEventListener("click", ()=> {
  if (!playingGame) {
    playingGame = true;
    startGame();
  }
});

webSocket.addEventListener("open", () => {
  console.log("We are connected");
  button.style.display = "flex";
  document.querySelector("#loading").style.display = "none";
});