import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.min.js';
import * as THREE from 'three';

let lastJump = 0;

const jumpDelay = 1;

export function jump(player, webSocket) {
    const currentTime = Date.now();
    if (!webSocket || currentTime - lastJump > jumpDelay * 1000) {
        lastJump = currentTime;
        //send server message if websocket given
        if (webSocket) {
            const messageData = {type: "jump"};
            webSocket.send(JSON.stringify(messageData));
        }
    }
}
