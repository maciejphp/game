import * as THREE from 'three';
import { createScene } from "./Modules/scene.js";
import { localPlayerModule } from "./Modules/localPlayer.js";
import { playerModule } from "./Modules/player.js";
import { shockwave } from "./Modules/shockwave.js";
import { dash } from "./Modules/dash.js";
import { jump } from "./Modules/jump.js";

const result = createScene();
const scene = result.scene;
const camera = result.camera;
const renderer = result.renderer;

 const webSocket = new WebSocket('ws://localhost:5005/');
// const webSocket = new WebSocket('wss://bali237.glitch.me/');
let playerModels = [];
let playerServerId;
let localPlayer;
let player

//represh every frame
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

let playersData = {};

//recieve server messages
webSocket.onmessage = (message) => {
    try {
      const data = JSON.parse(message.data);
      const type = data.type;

      if (type === "oldPlayers") {
        //create objects for all old players who are already in game
        playersData = data.content;
        console.log(playersData)
        // console.log( "old players: ", playersData);

        for (const playerData of playersData) {
            const player = new playerModule(result, playerData.name);
            player.create();
            player.move(new THREE.Vector3(playerData.position.x,playerData.position.y,playerData.position.z));
            // player.rotate(playerData.rotation);
            playerModels[playerData.id] = player;
        }

      }else if (type === "newPlayer") {

        const playerData = data.content;
        playersData.push(playerData);

        const player = new playerModule(result, playerData.name);
        playerModels[playerData.id] = player;
        console.log("addedplayer", playerData.id)
        player.create();

      }else if (type === "id") {

        playerServerId = data.content;
        playerModels[data.content] = localPlayer;
        console.log(`your playerid: ${playerServerId}`)

      }else if (type === "deletePlayer") {

        console.log(data.id, playerModels);
        playerModels[data.id].destroy();
        playerModels.splice(data.id, 1);

      }else if (type === "updatePosition") {

        //update the position of all players including yourself
        data.content.forEach(playerData => {
          const playerToUpdate = playerModels[playerData.id];
          // console.log(playerToUpdate)
          if (!playerToUpdate) {
            console.warn(`player ${data.id} doesnt exist on client`, playerModels)
            return;
          }

          playerToUpdate.move(playerData.position);
          playerToUpdate.rotate(playerData.quaternion);

        })

      }else if (type === "usedShockwave") {

        const player = playerModels[data.id];
        shockwave(player);
        console.log(data.id, "shockwave");
      }else if (type === "usedDash") {
        const player = playerModels[data.id];
        dash(player);
        console.log(data.id, "dash");
      }else if (type === "usedJump") {
        const player = playerModels[data.id];
        jump(player);
        console.log(data.id, "jump")
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


  const messageData = {type: "createNewPlayer", user: name};
  webSocket.send(JSON.stringify(messageData));
  playerName.value = "";

  //create local player
  localPlayer = new localPlayerModule(result, name, webSocket);
  localPlayer.create();
}

// button
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