import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.min.js';
import * as THREE from 'three';

let lastDash = 0;

const dashDelay = 1;
const dashLength = 0.5;

export function dash(player, webSocket) {
    const currentTime = Date.now();
    if (!webSocket || currentTime - lastDash > dashDelay * 1000) {
        lastDash = currentTime;
        const material = new THREE.MeshBasicMaterial({
            color: "#e48d6c",
            transparent: true,
            opacity: 0.75
        })
        const geometry = new THREE.SphereGeometry(7.5, 16, 8);
        const ball = new THREE.Mesh(geometry, material);
        player.mesh.add(ball);

        //send server message if websocket given
        if (webSocket) {
            const messageData = {type: "dash"};
            webSocket.send(JSON.stringify(messageData));
        }

        //animate dash
        const currentSize = {x: 0, y: 0, z: 0 };
        const finalSize = {x: dashLength, y: dashLength, z: dashLength};
        
        new TWEEN.Tween(ball.material)
        .to({ opacity: 0 }, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

        new TWEEN.Tween(currentSize)
        .to(finalSize, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            //update ball scale
            ball.scale.set(currentSize.x, currentSize.y, currentSize.z);
        })
        .onComplete(() => {
            //delete ball
            player.mesh.remove(ball);
        })
        .start();
    }
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
}
animate();

